import Configstore from 'configstore';
import * as path from 'path';
import { getAppDataDir } from './utils/get-appdata-dir';

class MyConfigManager {
  private config: Configstore;

  constructor(configName: string) {
    // 设置配置文件的路径，存储在用户目录的 comflowy 目录下
    const configDir = getAppDataDir();
    const configPath = path.join(configDir, `${configName}.json`);
    // 初始化 Configstore 实例
    this.config = new Configstore(configName, {}, { configPath });
  }

  // 获取配置项 p
  get(key: string): any {
    return this.config.get(key);
  }

  // 设置配置项
  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  // 删除配置项
  delete(key: string): void {
    this.config.delete(key);
  }

  getAll(): any {
    return this.config.all;
  }
}

// 示例用法
const appConfigManager = new MyConfigManager('_config');

export enum CONFIG_KEYS {
  "appSetupConfig" = "appSetupConfig",
  "modeSetupConfig" = "modeSetupConfig"
}

export const CONDA_ENV_NAME = appConfigManager.get(CONFIG_KEYS.modeSetupConfig)?.condaEnv || "comflowy";

export {appConfigManager}

// // 设置配置项
// appConfigManager.set('apiKey', 'your_api_key');

// // 获取配置项
// const apiKey = appConfigManager.get('apiKey');
// logger.info('API Key:', apiKey);
// // 删除配置项
// appConfigManager.delete('apiKey');