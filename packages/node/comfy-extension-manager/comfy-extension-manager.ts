import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';
import { appConfigManager } from '..';
import * as fsExtra from 'fs-extra';

interface Plugin {
  name: string;
  gitUrl: string;
}

class ComfyExtensionManager {
  private git: SimpleGit;

  constructor() {
    const gitOptions: SimpleGitOptions = {
        baseDir: this.getPluginDir(),
        binary: 'git',
        maxConcurrentProcesses: 6,
        config: [],
        trimmed: false
    };
    this.git = simpleGit(gitOptions);
  }

  getPluginDir(name: string = ""): string {
    return path.join(appConfigManager.getConfigDir(), 'comfyUI', 'custom_nodes', name)
  }

  async downloadPlugin(plugin: Plugin): Promise<void> {
    const pluginDir = this.getPluginDir(plugin.name)

    // 如果插件目录已存在，删除它
    if (fsExtra.existsSync(pluginDir)) {
        await fsExtra.remove(pluginDir);
    }

    // 克隆插件
    await this.git.clone(plugin.gitUrl);
  }

  async updatePlugin(pluginName: string): Promise<void> {
    // 切换到插件目录
    await this.git.cwd(this.getPluginDir(pluginName));

    // 拉取最新代码
    await this.git.pull('origin', 'master');
  }

  async updateAllPlugins(): Promise<void> {
    const pluginDirs = fs.readdirSync(this.getPluginDir());

    for (const pluginName of pluginDirs) {
      await this.updatePlugin(pluginName);
    }
  }

  async listPlugins(): Promise<string[]> {
    const pluginDirs = fs.readdirSync(this.getPluginDir());
    return pluginDirs;
  }

  async removePlugin(pluginName: string): Promise<void> {
    const pluginDir = this.getPluginDir(pluginName);

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