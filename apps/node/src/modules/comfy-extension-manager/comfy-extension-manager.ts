import extensionList from './extension-list';
import extensionNodeMapping from './extension-node-mapping';
import { checkExtensionsInstalled } from './check-extension-status';
import { Extension, ExtensionNodeMap } from './types';
import { removeExtension } from './remove-extension';
import { disableExtension, enableExtension } from './disable-extension';
import { updateExtension } from './update-extension';

class ComfyExtensionManager {

  async updateExtensions(extensions: Extension[]): Promise<void> {
    for(let extension of extensions) {
      await updateExtension(extension);
    }
  }

  async removeExtensions(extensions: Extension[]){
    for(let extension of extensions) {
      await removeExtension(extension);
    }
  }

  async disableExtensions(extensions: Extension[]){
    for(let extension of extensions) {
      await disableExtension(extension);
    }
  }

  async enableExtensions(extensions: Extension[]){
    for(let extension of extensions) {
      await enableExtension(extension);
    }
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