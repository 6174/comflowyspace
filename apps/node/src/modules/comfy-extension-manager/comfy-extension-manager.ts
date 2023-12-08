import * as path from 'path';
import extensionList from './extension-list';
import extensionNodeMapping from './extension-node-mapping';
import { checkExtensionsInstalled } from './check-extension-status';
import { getAppDataDir } from '../utils/get-appdata-dir';

export interface Extension {
  title: string;
  reference: string;
  author: string;
  files: string[];
  js_path: string;
  pip: string[];
  install_type: "git-clone" | "copy" | "unzip";
  description: string;
  installed?: boolean;
  need_update?: boolean;
  disabled?: boolean;
  [_:string]: any
}

export type ExtensionNodeMap = {
  [key: string]: string[]
}

export function getExtensionDir(name: string = ""): string {
  return path.join(getAppDataDir(), 'ComfyUI', 'custom_nodes', name)
}

export function getWebExtensionDir(name: string = ""): string {
  return path.join(getAppDataDir(), 'ComfyUI', 'web', "extensions", name)
}

export const EXTENTION_FOLDER = getExtensionDir()
export const WEB_EXTENTION_FOLDER = getWebExtensionDir()

class ComfyExtensionManager {

  async updatePlugin(pluginName: string): Promise<void> {
  }

  async updateAllPlugins(): Promise<void> {
  }

  async removePlugin(pluginName: string): Promise<void> {
  }

  async getAllExtensions(): Promise<Extension[]> {
    const ret = extensionList.extensions as unknown as Extension[];
    await checkExtensionsInstalled(ret);
    return ret ;
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