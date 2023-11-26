const isMacOS = process.platform === 'darwin';
import isDev from 'electron-is-dev'
export {
    isMacOS,
    isDev
}
import crypto from "crypto";
export function uuid() {
    return crypto.randomUUID();
}