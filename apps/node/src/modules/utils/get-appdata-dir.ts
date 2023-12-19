import * as path from 'path';
import * as os from 'os';
import * as fsExtra from 'fs-extra';
import { CONFIG_KEYS, appConfigManager } from '../config-manager';

export function getAppDataDir() {
    const appDir = path.join(os.homedir(), '.comflowy');
    fsExtra.ensureDirSync(appDir)
    return appDir;
}

export function getAppTmpDir() {
    const tmpDir = path.join(getAppDataDir(), 'tmp');
    fsExtra.ensureDirSync(tmpDir)
    return tmpDir;
}

export function getComfyUIDir(): string {
    const configStr = appConfigManager.get(CONFIG_KEYS.appSetupConfig);
    let comfyUIDir = path.join(getAppDataDir(), 'ComfyUI');
    if (configStr) {
        try {
            const config = JSON.parse(configStr);
            comfyUIDir = config.comfyUIDir;
        } catch(err) {
            console.log("parse config error", err);
        }
    }
    return comfyUIDir;
}