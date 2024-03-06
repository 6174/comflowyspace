import path from "path";
import { Extension, getExtensionDir } from "./types";
import fsExtra from "fs-extra";
import { gitRepoHasUpdates } from "./check-extension-status";
import { getExtensionPath } from "./extension-utils";
export async function updateExtension(extension: Extension) {
    const extensionPath = getExtensionPath(extension);
    if (!extensionPath) {
        return
    }

    if (await fsExtra.exists(extensionPath)) {
        await gitRepoHasUpdates(extensionPath, true, true)
    }
}
