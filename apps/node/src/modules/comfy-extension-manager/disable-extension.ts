import path from "path";
import { Extension, getExtensionDir } from "./types";
import fsExtra from "fs-extra";
export async function disableExtension(extension: Extension) {
    const extensionPath = getExtensionPath(extension);
    if (extensionPath) {
        await fsExtra.ensureFile(extensionPath + '.disabled')
    }
}

export async function enableExtension(extension: Extension) {
    const extensionPath = getExtensionPath(extension);
    if (extensionPath) {
        const exists = await fsExtra.exists(extensionPath + '.disabled')
        if (exists) {
            return await fsExtra.remove(extensionPath + '.disabled')
        }
    }
}

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

    if (item.install_type === 'copy' && item.files.length === 1) {
        const dirName = path.basename(item.files[0]);
        return path.join(custom_nodes_path, dirName);
    }
}