import * as path from 'path';
import * as os from 'os';
import * as fsExtra from 'fs-extra';

export function getAppDataDir() {
    const configDir = path.join(os.homedir(), '.comflowy');
    fsExtra.ensureDirSync(configDir)
    return configDir;
}

export function getAppTmpDir() {
    const tmpDir = path.join(getAppDataDir(), 'tmp');
    fsExtra.ensureDirSync(tmpDir)
    return tmpDir;
}