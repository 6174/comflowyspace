#!/usr/bin/env node
import esbuild from "esbuild";
import chokidar from "chokidar";
import electronPath from "electron";
import { spawn } from "child_process";
import path from "path";
import { __dirname, MainBuildConfig, PreloadBuildConfig, RendererBuildConfig } from "./esbuild.config.mjs";

// use madge to check circle dependencies 
// madge --circular --extensions ts ./src/app.ts  

const setupMainBuild = async () => {
  let spawnProcess = null;
  let ctx = await esbuild.context({
    ...MainBuildConfig,
    plugins: [{
      name: "rebuild-notify",
      setup(build) {
        build.onEnd((result) => {
          restartElectron();
        })
      }
    }]
  })
  await ctx.watch({})

  await buildRenderer();
  chokidar.watch(path.resolve(__dirname, "../layers/renderer/src/**/*.{ts,tsx,scss,html}")).on('change', async () => {
    console.log("bug:", path.resolve(__dirname, "../../renderer/src/**/*"));
    await buildRenderer();
    // restartElectron();
  });

  function restartElectron() {
    if (spawnProcess !== null) {
      spawnProcess.off("exit", process.exit);
      spawnProcess.kill("SIGINT");
      spawnProcess = null;
    }

    const appPath = path.resolve(__dirname, "../");
    spawnProcess = spawn(String(electronPath), [appPath]);
    console.log("working dir:", String(electronPath), appPath);

    spawnProcess.stdout.on(
      "data",
      (d) =>
        d.toString().trim() && console.warn(d.toString(), { timestamp: true })
    );
    spawnProcess.stderr.on("data", (d) => {
      const data = d.toString().trim();
      if (!data) return;
      console.error(data, { timestamp: true });
    });

    // Stops the watch script when the application has been quit
    spawnProcess.on("exit", process.exit);
  }

  async function buildRenderer() {
    await esbuild.build({
      ...RendererBuildConfig
    }) 
  }
}

const setupPreloadBuild = async () => {
  let ctx = await esbuild.context({
    ...PreloadBuildConfig,
    plugins: [{
      name: "rebuild-notify",
      setup(build) {
        build.onEnd((result) => {
          // ctx.send({
          //   type: "full-reload",
          // });
        })
      }
    }]
  })
  await ctx.watch({})
}

(async () => {
  try {
    await setupMainBuild();
    await setupPreloadBuild();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
