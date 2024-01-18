import * as fs from 'fs';
import * as path from 'path';
import fetch, { Response } from 'node-fetch';
import { pipeline } from 'stream/promises';
import { verifyFileMd5 } from './verifymd5';
import * as progress from "progress";
import { TaskEventDispatcher } from '../task-queue/task-queue';
import logger from './logger';

export async function downloadUrl(dispatch: TaskEventDispatcher, url: string, targetPath: string): Promise<void> {
  const filename: string = path.basename(url);
  const filePath: string = path.join(targetPath, filename);
  dispatch({
    message: `Downloading ${url}`
  })
  try {
    const headers: { [key: string]: string } = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    };
    const response: Response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download from ${url}. Status: ${response.status} ${response.statusText}`);
    }

    const totalSize = Number(response.headers.get('content-length'));
    const progressBar = new progress('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: totalSize,
    });

    const bufferStream = new (require('stream').PassThrough)();
    response.body!.on('data', (chunk) => {
      progressBar.tick(chunk.length);
      dispatch({
        message: `Download progress: ${progressBar.curr}/${progressBar.total}`
      })
    });
    response.body!.pipe(bufferStream);
    await pipeline(bufferStream, fs.createWriteStream(filePath));

    dispatch({
      message: `Downloaded ${filename} to ${targetPath}`
    })
  } catch (error) {
    throw new Error(`Error downloading from ${url}: ${error}`);
  }
}

export async function downloadUrlPro(dispatch: TaskEventDispatcher, url: string, targetPath: string, md5?: string): Promise<void> {
  const filename: string = path.basename(url);
  const tmpFilePath: string = path.join(targetPath, `${filename}.tmp`);
  const filePath: string = path.join(targetPath, filename);
  dispatch({
    message: `Downloading ${url}`
  });
  if (fs.existsSync(filePath)) {
    const msg = `File ${filename} already exists. Skipping download.`;
    if (md5) {
      if (await verifyFileMd5(filePath, md5)) {
        logger.info(msg);
        return;
      }
    } else {
      logger.info(msg);
      return;
    }
  }

  const fileSize: number = fs.existsSync(tmpFilePath) ? fs.statSync(tmpFilePath).size : 0;

  try {
    const controller = new AbortController();
    const signal = controller.signal;

    const headers: Record<string, string> = fileSize > 0 ? { Range: `bytes=${fileSize}-` } : {};
    const response: Response = await fetch(url, { 
      headers: {
        ...headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      }
    , signal });
    if (!response.ok) {
      throw new Error(`Failed to download from ${url}. Status: ${response.status} ${response.statusText}`);
    }

    const totalSize = Number(response.headers.get('content-length')) + fileSize;
    let downloadedSize = fileSize;

    const bufferStream = new (require('stream').PassThrough)();

    response.body!.pipe(bufferStream, { end: false });

    bufferStream.on('data', (chunk: Buffer) => {
      downloadedSize += chunk.length;
      const progress = (downloadedSize / totalSize) * 100;
      logger.info(`Downloading ${filename}... ${progress.toFixed(2)}%`);
      dispatch({
        message: `Downloading ${filename}... ${progress.toFixed(2)}%`
      });
    });

    await pipeline(bufferStream, fs.createWriteStream(tmpFilePath, { flags: 'a' }));

    dispatch({
      message: `Downloaded ${filename} to ${targetPath}`
    });

    if (downloadedSize >= totalSize) {
      // 如果下载完成，进行校验，并将文件重命名为正式文件
      if (md5) {
        const verified = await verifyFileMd5(tmpFilePath, md5);
        if (!verified) {
          dispatch({
            message: `Md5 check error`,
            error: new Error(`Md5 check error`)
          });
        }
      }
      fs.renameSync(tmpFilePath, filePath);
      logger.info(`Renamed ${filename}.tmp to ${filename}`);
    }
  } catch (error) {
    throw new Error(`Error downloading from ${url}: ${error}`);
  }
}