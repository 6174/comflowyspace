import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';
import { appConfigManager } from '..';
import * as fsExtra from 'fs-extra';

export interface Extension {
  title: string;
  reference: string;
  author: string;
  files: string[];
  js_path: string;
  pip: string[];
  install_type: "git_clone" | "copy" | "unzip";
  description: string;
}

export function getExtensionDir(name: string = ""): string {
  return path.join(appConfigManager.getConfigDir(), 'comfyUI', 'custom_nodes', name)
}

export function getWebExtensionDir(name: string = ""): string {
  return path.join(appConfigManager.getConfigDir(), 'comfyUI', 'web', "extensions", name)
}

export const EXTENTION_FOLDER = getExtensionDir()
export const WEB_EXTENTION_FOLDER = getWebExtensionDir()

class ComfyExtensionManager {
  private git: SimpleGit;

  constructor() {
    const gitOptions: SimpleGitOptions = {
        baseDir: getExtensionDir(),
        binary: 'git',
        maxConcurrentProcesses: 6,
        config: [],
        trimmed: false
    };
    this.git = simpleGit(gitOptions);
  }

  async downloadPlugin(plugin: Extension): Promise<void> {
    const pluginDir = getExtensionDir(plugin.title)

    // 如果插件目录已存在，删除它
    if (fsExtra.existsSync(pluginDir)) {
        await fsExtra.remove(pluginDir);
    }

    // 克隆插件
    await this.git.clone(plugin.files[0]);
  }

  async updatePlugin(pluginName: string): Promise<void> {
    // 切换到插件目录
    await this.git.cwd(getExtensionDir(pluginName));

    // 拉取最新代码
    await this.git.pull('origin', 'master');
  }

  async updateAllPlugins(): Promise<void> {
    const pluginDirs = fs.readdirSync(getExtensionDir());

    for (const pluginName of pluginDirs) {
      await this.updatePlugin(pluginName);
    }
  }

  async listPlugins(): Promise<string[]> {
    const pluginDirs = fs.readdirSync(getExtensionDir());
    return pluginDirs;
  }

  async removePlugin(pluginName: string): Promise<void> {
    const pluginDir = getExtensionDir(pluginName);

    try {
      await fsExtra.remove(pluginDir);
      console.log(`Plugin '${pluginName}' removed successfully.`);
    } catch (error) {
      console.error(`Error removing plugin '${pluginName}': ${error}`);
    }
  }
}

const comfyExtensionManager = new ComfyExtensionManager();

export {comfyExtensionManager};