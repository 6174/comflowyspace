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
  files: ["layers/**/dist/**", path.resolve(__dirname, "../electron-frontend", "out")],
  extraMetadata: {
    version: packagInfo.version,
  },
};

module.exports = config;
