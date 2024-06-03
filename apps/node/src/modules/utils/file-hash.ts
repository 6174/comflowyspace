import { createReadStream } from 'fs';
import { createHash } from 'crypto';
/**
 * Input a filePath string and return the hash of the file.
 * @param filePath The path to the file to hash.
 * @returns A promise that resolves to the hash string of the file.
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256'); // or 'md5', 'sha1', etc.
    const stream = createReadStream(filePath);

    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}