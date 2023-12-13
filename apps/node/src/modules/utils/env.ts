import * as os from "os";
import { getAppDataDir, getAppTmpDir } from "./get-appdata-dir";
export const systemType = os.type().toUpperCase();
export const isWindows = systemType.includes("WINDOWS");
export const isMac = systemType.includes("DARWIN");
export const isLinux = systemType.includes("LINUX");
export const appDir = getAppDataDir();
export const tmpDir = getAppTmpDir();