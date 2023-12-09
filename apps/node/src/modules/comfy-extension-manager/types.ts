import path from "path";
import { getAppDataDir } from "../utils/get-appdata-dir";

export interface Extension {
    title: string;
    reference: string;
    author: string;
    files: string[];
    js_path: string;
    pip: string[];
    install_type: "git-clone" | "copy" | "unzip";
    description: string;
    installed?: boolean;
    need_update?: boolean;
    disabled?: boolean;
    [_:string]: any
  }
  
  export type ExtensionNodeMap = {
    [key: string]: string[]
  }
  
  export function getExtensionDir(name: string = ""): string {
    return path.join(getAppDataDir(), 'ComfyUI', 'custom_nodes', name)
  }
  
  export function getWebExtensionDir(name: string = ""): string {
    return path.join(getAppDataDir(), 'ComfyUI', 'web', "extensions", name)
  }
  
  export const EXTENTION_FOLDER = getExtensionDir()
  export const WEB_EXTENTION_FOLDER = getWebExtensionDir()