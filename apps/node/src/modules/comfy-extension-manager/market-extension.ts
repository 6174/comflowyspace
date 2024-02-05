import extensionList from './extension-list.json';
import extensionNodeMapping from './extension-node-mapping.json';

import * as fsExtra from 'fs-extra';
import { getAppDataDir, getAppTmpDir } from '../utils/get-appdata-dir';
import path from 'path';
import { Extension } from './types';

const dataDir = getAppDataDir();
const EXTENSION_NODE_MAP_FILE = path.resolve(dataDir, "market-extension-node-map.json");
const MARKET_EXTENSIONS_FILE = path.resolve(dataDir, "market-extensions.json");

let updating = false;
/**
 * Update market extensions trigger
 */
export async function sheduleUpdateMarketExtensions() {
  try {
    if (updating) {
      return;
    }
    const exist = await fsExtra.exists(MARKET_EXTENSIONS_FILE);
    let need_update = false;
    if (!exist) {
      need_update = true;
    } else {
      const lastUpdateTime = (await fsExtra.stat(MARKET_EXTENSIONS_FILE)).mtime;
      console.log("lastUpdateTime", lastUpdateTime);
      const now = new Date();
      const diff = now.getTime() - lastUpdateTime.getTime();
      const diffInDays = diff / (1000 * 60 * 60 * 24);
      if (diffInDays > 1) {
        need_update = true;
      }
    }
    if (need_update) {
      updating = true;
      await doUpdateMarketExtension();
      await doUpdateMarketExtensionNodeMap();
      updating = false;
    }
  } catch(err) {
    console.error("Failed to update market extensions:", err);
  }
}

/**
 * Update market extensions
 */
async function doUpdateMarketExtension() {
  try {
    const apiUrl = "https://comflowy.com/api/get-market-extensions";
    const response = await fetch(apiUrl);
    const extensions = await response.json();
    
    await fsExtra.ensureFile(MARKET_EXTENSIONS_FILE);
    await fsExtra.writeFile(MARKET_EXTENSIONS_FILE, JSON.stringify(extensions));

    console.log("Market extensions updated successfully!");
  } catch (error) {
    console.error("Failed to update market extensions:", error);
  }
}

/**
 * Update market extensions
 */
async function doUpdateMarketExtensionNodeMap() {
  try {
    const apiUrl = "https://comflowy.com/api/get-extension-node-map";
    const response = await fetch(apiUrl);
    const extensions = await response.json();

    await fsExtra.ensureFile(EXTENSION_NODE_MAP_FILE);
    await fsExtra.writeFile(EXTENSION_NODE_MAP_FILE, JSON.stringify(extensions));

    console.log("Market extensions node map updated successfully!");
  } catch (error) {
    console.error("Failed to update market extensions:", error);
  }
}

import _ from "lodash";

/**
 * Get market extensions
 */
export function getMarketExtensions(): Extension[] {
  try {
    const ret = JSON.parse(fsExtra.readFileSync(MARKET_EXTENSIONS_FILE, 'utf-8'));
    return ret.custom_nodes as unknown as Extension[]
  } catch (err) {
    return _.cloneDeep(extensionList.custom_nodes) as unknown as Extension[]
  }
}

export type ExtensionNodeMap = {
  [key: string]: [string[], { title_aux: string }]
};

/**
 * Get market extensions node map
 */
export function getMarketExtensionNodeMap(): ExtensionNodeMap {
  try {
    const ret = JSON.parse(fsExtra.readFileSync(EXTENSION_NODE_MAP_FILE, 'utf-8'));
    return ret;
  } catch (err) {
    return _.cloneDeep(extensionNodeMapping);
  }
}