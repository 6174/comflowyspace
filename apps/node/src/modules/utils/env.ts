import * as os from "os";
import { getAppDataDir, getAppTmpDir } from "./get-appdata-dir";
import { execSync } from "child_process";
export const systemType = os.type().toUpperCase();
export const isWindows = systemType.includes("WINDOWS");
export const isMac = systemType.includes("DARWIN");
export const isLinux = systemType.includes("LINUX");
export const appDir = getAppDataDir();
export const tmpDir = getAppTmpDir();
export const OS_TYPE = os.type().toUpperCase();
export const OS_HOME_DIRECTORY = os.homedir();

export let SHELL_ENV_PATH = getSystemPath({
  CONDA_SCRIPTS_PATH: "",
  CONDA_ENV_PATH: ""
});

export function updateShellEnvPath(env: string) {
  SHELL_ENV_PATH = env;
}

export function getSystemPath({ CONDA_SCRIPTS_PATH, CONDA_ENV_PATH }: {
  CONDA_SCRIPTS_PATH: string,
  CONDA_ENV_PATH: string
}): string {
  let paths;
  let pathDelimiter;
  if (OS_TYPE.includes('WINDOWS')) {
    pathDelimiter = ';';
    paths = ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files (x86)', CONDA_SCRIPTS_PATH, `${CONDA_ENV_PATH}\\Scripts`, `${CONDA_ENV_PATH}\\Library\\bin`,  process.env.PATH];
  } else {
    pathDelimiter = ':';
    paths = ['/usr/local/bin', CONDA_SCRIPTS_PATH, , `${CONDA_ENV_PATH}/bin`, '/usr/bin', '/sbin', '/usr/sbin', process.env.PATH];
  }
  return paths.join(pathDelimiter);
}

const systemProxy: {
  http_proxy?: string;
  https_proxy?: string;
  // socks
  all_proxy?: string;
  [_:string]: any
} = {};

export let systemProxyString = JSON.stringify(systemProxy);
export {systemProxy}
let inited = false;
export async function getSystemProxy() {
  if (!inited) {
    if (isMac) { 
      parseMacProxySettings();
    } else if (isWindows) { 
      await parseWindowsProxySettings();
    }
  
    if (systemProxy.http_proxy) {
      process.env.GLOBAL_AGENT_HTTP_PROXY = systemProxy.http_proxy
    }
    
    if (systemProxy.https_proxy) {
      process.env.GLOBAL_AGENT_HTTPS_PROXY = systemProxy.https_proxy
    }
  
    systemProxyString = JSON.stringify(systemProxy);
    inited = true;
  }
  return {
    systemProxy,
    systemProxyString
  }
}

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

async function parseWindowsProxySettings() {
  const regedit = require('regedit').promisified;
  try {
    const key = "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"
    const proxySettings = (await regedit.list(key))[key].values;
    
    const ret = {
      enabled: proxySettings.ProxyEnable.value,
      server: proxySettings.ProxyServer.value,
      override: proxySettings.ProxyOverride.value
    };

    if (ret.enabled && ret.server) {
      const server = "http://" + ret.server;
      systemProxy.all_proxy = server;
      systemProxy.http_proxy = server;
      systemProxy.https_proxy = server;
    }

  } catch (err) {
    console.log("read error", err);
  }
}