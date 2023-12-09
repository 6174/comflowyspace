const path = require("path");
const packagInfo = require("./package.json");
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: "dist",
    buildResources: "buildResources",
  },
  files: [
    "layers/**/dist/**", 
    "layers/renderer/*.html",
    {
      from: path.resolve(__dirname, "../electron-frontend/out"),
      to: "layers/renderer/out"
    }
  ],
  extraFiles: [
    {
      "from": path.resolve(__dirname, "./packages/node_modules"),
      "to": "Resources/app/node_modules",
      "filter": [
        "**/*"
      ]
    }
  ],
  extraMetadata: {
    version: packagInfo.version,
  },
};

module.exports = config;
