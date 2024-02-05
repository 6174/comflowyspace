import * as fs from 'fs';
import * as path from 'path';
import fetch, { Response } from 'node-fetch';
import progress from "progress";
import { TaskEventDispatcher } from '../task-queue/task-queue';
import logger from './logger';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {getSystemProxy} from './env';
import * as fsExtra from "fs-extra";
import { verifySHA } from './sha';
const stream = require('stream');
const util = require('util');

export async function downloadUrl(dispatch: TaskEventDispatcher, url: string, targetPath: string): Promise<void> {
  const { systemProxy, systemProxyString } = await getSystemProxy();
  const filename: string = path.basename(url);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
    return;
  }
  dispatch({
    message: `Downloading ${url}`
  });
  try {
    await fsExtra.ensureDir(path.dirname(targetPath));
    const headers: { [key: string]: string } = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    };
    if (systemProxy.http_proxy) {
      logger.info("download with proxy" + systemProxyString)
    } else {
      logger.info("download without proxy")
    }
    const agentOptions = {
      secureProtocol: 'TLSv1_2_method',
    };
    const response: Response = await fetch(
      url, { 
        headers,
        agent: systemProxy.http_proxy ? new HttpsProxyAgent(systemProxy.http_proxy as string, agentOptions) : undefined,
      });
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

    const finished = util.promisify(stream.finished);
    
    const bufferStream = new stream.PassThrough();
    const writeStream = fs.createWriteStream(targetPath);

    bufferStream.on('error', (err: any) => {
      const msg = `Error with buffer stream: ${err.message}, ${err.stack}`
      logger.error(msg);
      throw new Error(msg)
    });

    writeStream.on('error', (err: any) => {
      const msg = `Error writing to file: ${err.message}, ${err.stack}`
      logger.error(msg);
      throw new Error(msg)
    });

    response.body!.on('error', (err) => {
      const msg = `Error reading from response body: ${err.message}, ${err.stack}`
      logger.error(msg);
      throw new Error(msg)
    });

    response.body!.on('data', (chunk) => {
      progressBar.tick(chunk.length);
      dispatch({
        message: `Download progress: ${progressBar.curr}/${progressBar.total}`
      })
    });

    try {
      response.body!.pipe(bufferStream);
      bufferStream.pipe(writeStream);
      // this will throw if an error occurred
      await finished(writeStream);
    } catch (err: any) {
      const msg = `Error with streams: ${err.message} + ${err.stack}`
      logger.error(msg);
      throw new Error(msg);
    }
    dispatch({
      message: `Downloaded ${filename} to ${targetPath}`
    })
  } catch (error: any) {
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
      dispatch({
        message: `Downloaded ${filename} to ${targetPath}`
      })
    } else {
      const msg = `Error downloading from ${url}: ${error.message}, ${error.stack}`
      logger.error(msg);
      throw new Error(msg);
    }
  }
}

export async function downloadUrlPro(dispatch: TaskEventDispatcher, url: string, targetPath: string, sha?: string): Promise<void> {
  const { systemProxy } = await getSystemProxy();
  const filename: string = path.basename(url);
  const tmpFilePath: string = targetPath + ".tmp";

  try {

    if (fs.existsSync(targetPath)) {
      const msg = `File ${filename} already exists. Skipping download.`;
      if (sha) {
        if (await verifySHA(targetPath, sha)) {
          logger.info(msg);
          return;
        }
      } else {
        logger.info(msg);
        return;
      }
    }

    dispatch({
      message: `Downloading ${url}`
    });

    const fileSize: number = fs.existsSync(tmpFilePath) ? fs.statSync(tmpFilePath).size : 0;
    const headers: Record<string, string> = fileSize > 0 ? { Range: `bytes=${fileSize}-` } : {};

    console.log(fileSize, headers);
    const response: Response = await fetch(url, {
      headers: {
        ...headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
      agent: systemProxy.http_proxy ? new HttpsProxyAgent(systemProxy.http_proxy as string) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to download from ${url}. Status: ${response.status} ${response.statusText}`);
    } else {
      console.log("Download Reponse from " + url);
    }

    const totalSize = Number(response.headers.get('content-length')) + fileSize;
    let downloadedSize = fileSize;

    const progressBar = new progress('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: totalSize,
    });

    const finished = util.promisify(stream.finished);
    const bufferStream = new stream.PassThrough();
    const writeStream = fs.createWriteStream(tmpFilePath, { flags: 'a' });

    bufferStream.on('error', (err: any) => {
      const msg = `Error with buffer stream: ${err.message}, ${err.stack}`
      logger.error(msg);
      throw new Error(msg)
    });

    writeStream.on('error', (err: any) => {
      const msg = `Error writing to file: ${err.message}, ${err.stack}`
      logger.error(msg);
      throw new Error(msg)
    });

    response.body!.on('error', (err) => {
      const msg = `Error reading from response body: ${err.message}, ${err.stack}`
      logger.error(msg);
      throw new Error(msg)
    });

    response.body!.on('data', (chunk) => {
      progressBar.tick(chunk.length);
      downloadedSize += chunk.length;
      dispatch({
        message: `Download progress: ${progressBar.curr}/${progressBar.total}`
      })
    });

    
    try {
      response.body!.pipe(bufferStream);
      bufferStream.pipe(writeStream);
      await finished(writeStream);
      if (downloadedSize >= totalSize) {
        dispatch({
          message: `Downloaded ${filename} to ${targetPath}`
        });
      }
    } catch(err: any) {
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0 && downloadedSize >= totalSize) {
        dispatch({
          message: `Downloaded2 ${filename} to ${targetPath}`
        });
      } else {
        throw new Error(`Error downloading from ${url}: ${err.message}`);
      }
    }
    if (sha) {
      const verified = await verifySHA(tmpFilePath, sha);
      if (!verified) {
        dispatch({
          message: `Sha check error`,
          error: new Error(`Md5 check error`)
        });
        logger.error(`Sha check error for ${url} with ${sha}`);
        throw new Error("sha check error")
      }
    }
    fs.renameSync(tmpFilePath, targetPath);
  } catch (error) {
    throw new Error(`Error downloading from ${url}: ${error}`);
  }
}