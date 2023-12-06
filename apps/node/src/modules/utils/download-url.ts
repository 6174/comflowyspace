import * as fs from 'fs';
import * as path from 'path';
import fetch, { Response } from 'node-fetch';
import { pipeline } from 'stream/promises';
import { verifyFileMd5 } from './verifymd5';
import * as progress from "progress";

export async function downloadUrl(url: string, targetPath: string): Promise<void> {
  const filename: string = path.basename(url);
  const filePath: string = path.join(targetPath, filename);

  try {
    const response: Response = await fetch(url);
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
    });
    response.body!.pipe(bufferStream);
    await pipeline(bufferStream, fs.createWriteStream(filePath));
    
    console.log(`Downloaded ${filename} to ${targetPath}`);
  } catch (error) {
    console.error(`Error downloading from ${url}: ${error}`);
    throw error;
  }
}

export async function downloadUrlWithMd5Check(url: string, targetPath: string, md5: string): Promise<void> {
  const filename: string = path.basename(url);
  const tmpFilePath: string = path.join(targetPath, `${filename}.tmp`);
  const filePath: string = path.join(targetPath, filename);

  if (fs.existsSync(filePath)) {
    const msg = `File ${filename} already exists. Skipping download.`;
    if (md5) {
      if (await verifyFileMd5(filePath, md5)) {
        console.log(msg);
        return;
      }
    } else {
      console.log(msg);
      return;
    }
  }

  const fileSize: number = fs.existsSync(tmpFilePath) ? fs.statSync(tmpFilePath).size : 0;

  try {
    const controller = new AbortController();
    const signal = controller.signal;

    const headers: Record<string, string> = fileSize > 0 ? { Range: `bytes=${fileSize}-` } : {};

    const response: Response = await fetch(url, { headers, signal });
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
      console.log(`Downloading ${filename}... ${progress.toFixed(2)}%`);
    });

    await pipeline(bufferStream, fs.createWriteStream(tmpFilePath, { flags: 'a' }));

    console.log(`Downloaded ${filename} to ${targetPath}`);

    if (downloadedSize >= totalSize) {
      // 如果下载完成，进行校验，并将文件重命名为正式文件
      await verifyFileMd5(tmpFilePath, md5);
      fs.renameSync(tmpFilePath, filePath);
      console.log(`Renamed ${filename}.tmp to ${filename}`);
    }
  } catch (error) {
    console.error(`Error downloading from ${url}: ${error}`);
    throw error;
  }
}

// 示例用法
const url: string = 'https://example.com/file.txt';
const targetPath: string = 'path/to/download/directory';
const md5: string = 'expected_md5_hash'; // 替换为实际的 MD5 值

// downloadUrlWithMd5Check(url, targetPath, md5)
//   .then(() => console.log('Download successful'))
//   .catch((error: Error) => console.error(`Download failed: ${error.message}`));
