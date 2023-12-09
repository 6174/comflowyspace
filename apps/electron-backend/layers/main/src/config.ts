import Configstore from 'configstore';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export const APP_SERVER_PORT = 3333

class MyConfigManager {
  private config: Configstore;

  constructor(configName: string) {
    // 设置配置文件的路径，存储在用户目录的 .comflowy 目录下
    const configDir = this.getConfigDir();
    const configPath = path.join(configDir, `${configName}.json`);

    // 创建目录
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    // 初始化 Configstore 实例
    this.config = new Configstore(configName, {}, { configPath });
  }

  getConfigDir() {
    return path.join(os.homedir(), '.comflowy');
  }

  // 获取配置项
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
}

// 示例用法
const appConfigManager = new MyConfigManager('_config');

export {appConfigManager}

// // 设置配置项
// appConfigManager.set('apiKey', 'your_api_key');

// // 获取配置项
// const apiKey = appConfigManager.get('apiKey');
// console.log('API Key:', apiKey);
// // 删除配置项
// appConfigManager.delete('apiKey');