import * as os from "os";
import { getAppDataDir, getAppTmpDir } from "./get-appdata-dir";
import { execSync } from "child_process";
export const systemType = os.type().toUpperCase();
export const isWindows = systemType.includes("WINDOWS");
export const isMac = systemType.includes("DARWIN");
export const isLinux = systemType.includes("LINUX");
export const appDir = getAppDataDir();
export const tmpDir = getAppTmpDir();

const systemProxy: {
  http_proxy?: string;
  https_proxy?: string;
  // socks
  all_proxy?: string;
  [_:string]: any
} = {};

if (isMac) { 
  parseMacProxySettings();
} else if (isWindows) { 
  parseWindowsProxySettings();
}

export {systemProxy}

function parseMacProxySettings() {
  const systemProxyString = execSync("scutil --proxy").toString();
  const proxyTypes = [['HTTP', 'http_proxy'], ['HTTPS', 'https_proxy'], ['SOCKS', 'all_proxy']];

  for (let item of proxyTypes) {
    const type = item[0];
    const key = item[1];
    const proxyPattern = new RegExp(type + "Proxy" + " : (\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})");
    const portPattern = new RegExp(type + "Port" + " : (\\d+)");

    const address = proxyPattern.exec(systemProxyString);
    const port = portPattern.exec(systemProxyString);
    if (address && port) {
      systemProxy[key] = `http://${address[1]}:${port[1]}`;
    }
  }
}

function parseWindowsProxySettings() {
  const systemProxyString = execSync('netsh winhttp show proxy').toString();

  // Windows 的代理设置通常是这种格式 "HTTP(S) Proxy Directories: (proxy-server-and-port) Directories: (none)"
  const proxyPattern = /(HTTP|HTTPS) Proxy Directories: ((\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}:\d+))/g;

  let match;
  while (match = proxyPattern.exec(systemProxyString)) {
    const key = match[1] === 'HTTP' ? 'http_proxy' : 'https_proxy';
    systemProxy[key] = `http://${match[2]}`;
  }

  // Windows 上 SOCKS 代理需要另一个调研工具 (代理设置)，Windows 平台可能不提供 SOCK 代理设置的命令行工具
  return systemProxy;
}