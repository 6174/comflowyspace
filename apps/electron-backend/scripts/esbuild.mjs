#!/usr/bin/env node
import esbuild from "esbuild";
import {MainBuildConfig, PreloadBuildConfig, RendererBuildConfig} from "./esbuild.config.mjs";

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

const rendererBuild = async () => {
  await esbuild.build({
    ...RendererBuildConfig
  }) 
}

(async () => {
  try {
    await mainBuild();
    await preloadBuild();
    await rendererBuild();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
