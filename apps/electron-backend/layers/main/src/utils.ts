const isMacOS = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
import isDev from 'electron-is-dev'
export {
    isMacOS,
    isDev,
    isWindows
}
import crypto from "crypto";
export function uuid() {
    return crypto.randomUUID();
}