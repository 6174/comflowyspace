import { Extension, getExtensionDir } from "./types";
import * as fsExtra from 'fs-extra';
import logger from "../utils/logger";
import { checkExtensionsInstalled } from "./check-extension-status";
import _ from "lodash";
import { getMarketExtensions } from "./market-extension";
import path from "path";
import { parseManifestFromExtensionPath } from "./frontend-extensions";
/**
 * Find all frontend extensions
 */
export async function findAllInstalledExtensions({
  doFetch = false,
  doUpdateCheck = false,
  doUpdate = false
}): Promise<Extension[]> {
  try {
    const allExtensions = getMarketExtensions();
    const custom_nodes_path = getExtensionDir();
    const ret: Extension[] = [];
    const files = await fsExtra.readdir(custom_nodes_path);
    for (const file of files) {
      if (['__pycache__', 'example_node.py.example'].indexOf(file) >= 0 || file.endsWith('.disabled') || file.startsWith('.')) {
        continue
      }
      const extension = findExtensionByTitle(allExtensions, file);
      const manifest = await parseManifestFromExtensionPath(file);
      if (extension) {
        ret.push({
          ...extension,
          manifest
        });
      } else {
        const readme = await readExtensionReadmeContent(file);
        ret.push({
          id: file,
          custom_extension: true,
          title: file,
          reference: file,
          install_type: "custom",
          files: [file],
          installed: true,
          disabled: false,
          need_update: false,
          author: "",
          js_path: "",
          pip: [],
          description: manifest?.description || readme,
          manifest,
          readme
        })
      }
    }
    await checkExtensionsInstalled(ret, doFetch, doUpdateCheck, doUpdate);
    return ret;
  } catch (err: any) {
    logger.info("findAllFrontendExtensions:", err);
    return [];
  }
}



/**
 * parse extension readme content by extension title
 * @param title 
 * @returns 
 */
async function readExtensionReadmeContent(title: string) {
  try {
    const extensionDir = getExtensionDir(title);
    const readme = path.join(extensionDir, "README.md");
    const readmeLowercase = path.join(extensionDir, "readme.md");
  
    if (await fsExtra.pathExists(readme)) {
      return fsExtra.readFile(readme, "utf-8");
    } else if (await fsExtra.pathExists(readmeLowercase)) {
      return fsExtra.readFile(readmeLowercase, "utf-8");
    } else {
      return '';
    }
  } catch (err: any) {
    logger.error("parse extension readme error: " + err.message)
  }
  return '';
}

function findExtensionByTitle(extensions: Extension[], title: string): Extension | undefined {
  return extensions.find(it => {
    const install_type = it.install_type;
    const reference = it.reference;
    if (install_type === "git-clone") {
      return reference.endsWith(title);
    }
    return it.title === title;
  });
}