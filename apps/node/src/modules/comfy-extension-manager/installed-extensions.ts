import { Extension, getExtensionDir } from "./types";
import * as fsExtra from 'fs-extra';
import logger from "../utils/logger";
import { checkExtensionsInstalled } from "./check-extension-status";
import _ from "lodash";
import { getMarketExtensions } from "./market-extension";
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
      if (file.endsWith('.disabled')) {
        continue
      }
      const extension = findExtensionByTitle(allExtensions, file);
      if (extension) {
        ret.push(_.cloneDeep(extension));
      }
    }
    await checkExtensionsInstalled(ret, doFetch, doUpdateCheck, doUpdate);
    return ret;
  } catch (err: any) {
    logger.info("findAllFrontendExtensions:", err);
    return [];
  }
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