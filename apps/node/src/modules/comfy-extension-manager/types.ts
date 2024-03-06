import path from "path";
import { getAppDataDir, getComfyUIDir } from "../utils/get-appdata-dir";
export type { ExtensionManifest, Extension, ExtensionNodeMap } from "@comflowy/common/types/extensions.types" 

export function getExtensionDir(name: string = ""): string {
  return path.join(getComfyUIDir(), 'custom_nodes', name)
}

export function getWebExtensionDir(name: string = ""): string {
  return path.join(getComfyUIDir(), 'web', "extensions", name)
}

export const EXTENTION_FOLDER = getExtensionDir()
export const WEB_EXTENTION_FOLDER = getWebExtensionDir()