const packagInfo = require("./package.json");
const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');
const {cleanAndCopy} = require('./scripts/pre-package');

module.exports = {
  "buildIdentifier": process.env.IS_BETA ? 'beta' : 'prod',
  "packagerConfig": {
    "asar": false,
    "dir": "./",
    "icon": './assets/icon',
    "appBundleId": fromBuildIdentifier({ beta: 'com.comflowy.beta.app', prod: 'com.comflowy.app' })
  },
  "makers": [
    // {
    //   "name": "@electron-forge/maker-squirrel",
    //   "config": {
    //     "name": "Comflowy",
    //     "iconUrl": "./assets/icon.ico",
    //   }
    // },
    {
      "name": "@electron-forge/maker-dmg",
      "config": {
        // "background": "",
        "overwrite": true,
        "debug": true,
        "icon": "./assets/icon.png"
      }
    },
    // {
    //   "name": "@electron-forge/maker-deb",
    //   "config": {}
    // },
    // {
    //   "name": "@electron-forge/maker-rpm",
    //   "config": {}
    // }
  ],
  hooks: {
    packageAfterCopy: async () => {
      await cleanAndCopy();
    }
  }
}