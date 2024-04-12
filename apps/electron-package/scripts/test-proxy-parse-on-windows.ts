
const systemProxy: {
  http_proxy?: string;
  https_proxy?: string;
  // socks
  all_proxy?: string;
  [_:string]: any
} = {};

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

    console.log(systemProxy);
  } catch (err) {
    console.log("read error", err);
  }
}

parseWindowsProxySettings();
