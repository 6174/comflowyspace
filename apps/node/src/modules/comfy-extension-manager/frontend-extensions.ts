import { uuid } from "@comflowy/common";
import { ExtensionManifest, getExtensionDir } from "./types";
import * as fsExtra from 'fs-extra';
import path from 'path';
import logger from "../utils/logger";

/**
 * Find all frontend extensions
 */
export async function findAllFrontendExtensions<T = any>(): Promise<T[]> {
  try {
    const custom_nodes_path = getExtensionDir();
    const extensions: any[] = [];
    const files = await fsExtra.readdir(custom_nodes_path);
    for (const file of files) {
      const manifest = await parseManifestFromExtensionPath(file);
      if (manifest) {
        extensions.push(manifest);
      }
    }
    return extensions;
  } catch (err: any) {
    logger.info("findAllFrontendExtensions:", err);
    return [];
  }
}

export async function parseManifestFromExtensionPath(name: string): Promise<ExtensionManifest | undefined> {
  try {
    const extensionDir = getExtensionDir(name);
    const stat = await fsExtra.stat(extensionDir);
    if (stat.isDirectory()) {
      const manifestPath = path.join(extensionDir, 'manifest.json');
      if (await fsExtra.exists(manifestPath)) {
        const manifestData = await fsExtra.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestData);
        if (!manifest.main) {
          return ;
        }
        manifest.main = path.join("custom_nodes", name, manifest.main);
        if (manifest.ui) {
          manifest.ui = path.join("custom_nodes", name, manifest.ui);
        }
        return manifest;
      }
    }
  } catch (err) {
    logger.info("parseManifestFromExtensionPath:", err);
  }
  return;
}