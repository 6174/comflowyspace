import * as fs from 'fs';
import * as util from 'util';

const stat = util.promisify(fs.stat);

export async function getFileSize(file: string, decimals = 2): Promise<string> {
  try {
    let statInfo = await stat(file);
    return formatBytes(statInfo.size, decimals);
  } catch (err) {
    return "0 Bytes";
  }
}

export function getFileSizeSync(file: string, decimals = 2): string {
  try {
    let statInfo = fs.statSync(file);
    return formatBytes(statInfo.size, decimals);
  } catch(err: any) {
    return "0 Bytes" + err.message;
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}