import * as os from "os";
export function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const result = [];
  
    for (const interfaceName in interfaces) {
      const interfaceInfo = interfaces[interfaceName]!;
  
      for (const info of interfaceInfo) {
        if (info.family === 'IPv4' && info.address !== '127.0.0.1') {
          result.push(info.address);
        }
      }
    }
  
    return result;
  }
  
//   const localIPs = getLocalIP();
//   console.log('Local IP Addresses:', localIPs);