import { Extension, ExtensionNodeMap } from './types';
import { removeExtension } from './remove-extension';
import { disableExtension, enableExtension } from './disable-extension';
import { updateExtension } from './update-extension';
import { findAllFrontendExtensions } from './frontend-extensions';
import { findAllInstalledExtensions } from './installed-extensions';
import { getMarketExtensionNodeMap, getMarketExtensions, sheduleUpdateMarketExtensions } from './market-extension';

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

  async getAllExtensions(checkUpdate = false): Promise<Extension[]> {
    const ret = getMarketExtensions();
    ret.forEach(item => {
      item.installed = false;
      item.need_update = false;
      item.disabled = false;
    });
    const installedExtensions = await findAllInstalledExtensions({
      doFetch: checkUpdate,
      doUpdateCheck: checkUpdate
    });

    // add local extensions which is not in extension market to list
    installedExtensions.forEach(it => {
      const id = it.title + it.reference;
      if (!ret.find(it2 => it2.title + it2.reference === id)) {
        ret.push(it);
      }
    });

    sheduleUpdateMarketExtensions();
    return ret.map(it => {
      const installedExtension = installedExtensions.find(it2 => it2.title + it2.reference === it.title + it.reference);
      return installedExtension ? installedExtension : it;
    });
  }

  async getExtensionNodeMap(): Promise<ExtensionNodeMap> {
    const mapping = getMarketExtensionNodeMap();
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

  async getFrontendExtensions(): Promise<any[]> {
    return await findAllFrontendExtensions();
  }
}

const comfyExtensionManager = new ComfyExtensionManager();

export {comfyExtensionManager};