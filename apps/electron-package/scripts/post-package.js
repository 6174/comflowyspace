const { notarize } = require('@electron/notarize');
const path = require('path');
const packageInfo = require("../package.json");
const fs = require("fs");
const version = packageInfo.version;
let appPath = path.resolve(__dirname, `../out/comflowy-${version}-arm64.dmg`);

process.argv.forEach(arg => {
  if (arg === '--x64') {
    appPath = path.resolve(__dirname, `../out/comflowy-${version}.dmg`);
  }
});

if (!fs.existsSync(appPath)) {
  throw new Error(`DMG ${appPath} not found`);
} else {
  console.log("Notrize:", appPath);
}

// notarize({
//   appPath,          
//   appBundleId: packageInfo.build.appId,     
//   appleId: '',         
//   appleIdPassword: '', 
//   ascProvider: ''      
// })
