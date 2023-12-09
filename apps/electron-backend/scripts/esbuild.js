#!/usr/bin/env node
const esbuild = require("esbuild");
const {MainBuildConfig, PreloadBuildConfig} = require("./esbuild.config");

const mainBuild = async () => {
  await esbuild.build({
    ...MainBuildConfig
  })
}

const preloadBuild = async () => {
  await esbuild.build({
    ...PreloadBuildConfig
  })
}

(async () => {
  try {
    await mainBuild();
    await preloadBuild();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
