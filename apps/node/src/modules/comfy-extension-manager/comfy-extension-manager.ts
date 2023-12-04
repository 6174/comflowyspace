import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';
import { appConfigManager } from '../..';
import extensionList from './extension-list';
import extensionNodeMapping from './extension-node-mapping';

export interface Extension {
  title: string;
  reference: string;
  author: string;
  files: string[];
  js_path: string;
  pip: string[];
  install_type: "git_clone" | "copy" | "unzip";
  description: string;
  [_:string]: any
}

export type ExtensionNodeMap = {
  [key: string]: string[]
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

  constructor() {
    const gitOptions: SimpleGitOptions = {
        baseDir: getExtensionDir(),
        binary: 'git',
        maxConcurrentProcesses: 6,
        config: [],
        trimmed: false
    };
    // this.git = simpleGit(gitOptions);
  }

  async downloadPlugin(plugin: Extension): Promise<void> {
  }

  async updatePlugin(pluginName: string): Promise<void> {
  }

  async updateAllPlugins(): Promise<void> {
  }

  async listPlugins(): Promise<string[]> {
    throw new Error("not implemented");
  }

  async removePlugin(pluginName: string): Promise<void> {
  }

  async getAllExtensions(): Promise<Extension[]> {
    const ret = extensionList.extensions;
    return ret as unknown as Extension[];
  }

  async getExtensionNodeMap(): Promise<ExtensionNodeMap> {
    const mapping = extensionNodeMapping as any as {
      [key: string]: [string[], { title_aux: string }]
    };
    const ret: ExtensionNodeMap = {};
    for (const key in mapping) {
      const it = mapping[key];
      ret[it[1].title_aux] = it[0];
    }
    return ret;
  }

  async getExtensionNodes(): Promise<Record<string, any>> {
    const ret = (await fetch(
      'http://127.0.0.1:8188/object_info'
    )).json();
    return ret;
  }
}

const comfyExtensionManager = new ComfyExtensionManager();

export {comfyExtensionManager};