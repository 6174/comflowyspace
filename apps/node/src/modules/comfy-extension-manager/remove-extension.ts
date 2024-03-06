import path from "path";
import { Extension, getExtensionDir } from "./types";
import fsExtra from "fs-extra";
import { getExtensionPath } from "./extension-utils";
export async function removeExtension(extension: Extension) {
    const extensionPath = getExtensionPath(extension);
    if (extensionPath) {
        return await fsExtra.remove(extensionPath);
    } 
    throw new Error("can't find extension")
}
