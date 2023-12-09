import * as os from "os";
export const systemType = os.type().toUpperCase();
export const isWindows = systemType.includes("WINDOWS");
export const isMac = systemType.includes("DARWIN");
export const isLinux = systemType.includes("LINUX");
