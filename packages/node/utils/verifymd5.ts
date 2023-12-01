import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export async function verifyFileMd5(filePath: string, expectedMd5: string): Promise<boolean> {
    const fileBuffer: Buffer = fs.readFileSync(filePath);
    const fileMd5: string = crypto.createHash('md5').update(fileBuffer).digest('hex');

    if (fileMd5 !== expectedMd5) {
        // throw new Error(`MD5 verification failed for ${path.basename(filePath)}`);
        return false;
    }
    return true;
    // console.log(`MD5 verification successful for ${path.basename(filePath)}`);
}