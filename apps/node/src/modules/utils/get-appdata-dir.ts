import * as path from 'path';
import * as os from 'os';
import * as fsExtra from 'fs-extra';
import { CONFIG_KEYS, appConfigManager } from '../config-manager';
import logger from './logger';

export function getAppDataDir() {
    const appDir = path.join(os.homedir(), 'comflowy');
    fsExtra.ensureDirSync(appDir)
    return appDir;
}

export function getAppTmpDir() {
    const tmpDir = path.join(getAppDataDir(), 'tmp');
    fsExtra.ensureDirSync(tmpDir)
    return tmpDir;
}

export const DEFAULT_COMFYUI_PATH = path.join(getAppDataDir(), 'ComfyUI');
export function getComfyUIDir(): string {
    const configStr = appConfigManager.get(CONFIG_KEYS.appSetupConfig);
    let comfyUIDir = path.join(getAppDataDir(), 'ComfyUI');
    if (configStr) {
        try {
            const config = JSON.parse(configStr);
            comfyUIDir = config.comfyUIDir;
        } catch(err) {
            logger.error("parse config error", err);
        }
    }
    return comfyUIDir;
}

export function getStableDiffusionDir(): string {
    const configStr = appConfigManager.get(CONFIG_KEYS.appSetupConfig);
    let stableDiffusionDir = "";
    if (configStr) {
        try {
            const config = JSON.parse(configStr);
            stableDiffusionDir = config.stableDiffusionDir;
        } catch(err) {
            logger.error("parse config error", err);
        }
    }
    return stableDiffusionDir;
}