import path from "path";
import { Extension, getExtensionDir } from "./types";
import fsExtra from "fs-extra";
import { gitRepoHasUpdates } from "./check-extension-status";
export async function updateExtension(extension: Extension) {
    const extensionPath = getExtensionPath(extension);
    if (!extensionPath) {
        return
    }

    if (await fsExtra.exists(extensionPath)) {
        await gitRepoHasUpdates(extensionPath, true, true)
    }
}

/**
 * Only update git repo
 */
function getExtensionPath(item: Extension): string | void {
    const custom_nodes_path = getExtensionDir();
    if (item.install_type === "git-clone" && item.files.length === 1) {
        let url = item.files[0];

        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        const dirName = path.parse(url).name.replace('.git', '');
        const dirPath = path.join(custom_nodes_path, dirName);
        return dirPath;
    }
}