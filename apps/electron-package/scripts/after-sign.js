require('dotenv').config()
const { notarize } = require('@electron/notarize');
const path = require('path');
const packageInfo = require("../package.json");
const fs = require("fs");
const { env } = require('process');
const version = packageInfo.version;
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }
  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);
  console.log("notarize appPath:", appPath);
  return await notarize({
    appPath,          
    appBundleId: packageInfo.build.appId,     
    appleId: env.APP_ID,         
    appleIdPassword: env.APP_ID_PASSWORD, 
    ascProvider: env.ASC_PROVIDER,
    teamId: env.TEAM_ID
  })
}
