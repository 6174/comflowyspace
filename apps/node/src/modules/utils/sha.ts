import { createReadStream } from 'fs';
import { finished } from 'stream/promises';
import crypto from 'crypto';

export async function calculateSHA(file: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  const stream = createReadStream(file);

  stream.on('data', (data: Buffer) => {
    hash.update(data);
  });

  try {
    await finished(stream);
    return hash.digest('hex');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error processing file: ${error.message}`);
    }
    throw error;
  }
}

export async function verifySHA(file: string, sha: string): Promise<boolean> {
  const hash = await calculateSHA(file);
  return hash.toLocaleLowerCase() === sha.toLocaleLowerCase();
}

// calculateSHA('~/comfyui/models/loras/xx.safetensors.tmp')
//   .then((hash) => {
//     console.log(hash);
//   })
//   .catch((error: Error) =>{
//     console.log(error)
//   })