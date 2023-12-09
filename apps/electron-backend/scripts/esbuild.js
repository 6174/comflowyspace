#!/usr/bin/env node
const esbuild = require("esbuild");
const electronPath = require("electron");
const { spawn } = require("child_process");
const { generateAsync } = require("dts-for-context-bridge");
const path = require("path");
const {chrome, node} = require("../.electron-vendors.cache.json");
const  { builtinModules } = require("module");

// use madge to check circle dependencies 
// madge --circular --extensions ts ./src/app.ts  


/** @type 'production' | 'development'' */
const mode = (process.env.MODE = process.env.MODE || "development");

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
  // warning about devtools extension
  // https://github.com/cawa-93/vite-electron-builder/issues/492
  // https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
  /ExtensionLoadWarning/,
];

const setupMainBuild = async () => {
  let spawnProcess = null;
  let ctx = await esbuild.context({
    entryPoints: [path.resolve(__dirname, "../layers/main/", "./src/index.ts")],
    outfile:  path.resolve(__dirname, "../layers/main/", "./dist/index.js"),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: [`node14`],
    sourcemap: false,
    external: ['electron', ...builtinModules], // Add external dependencies here
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
      const mayIgnore = stderrFilterPatterns.some((r) => r.test(data));
      if (mayIgnore) return;
      console.error(data, { timestamp: true });
    });

    // Stops the watch script when the application has been quit
    spawnProcess.on("exit", process.exit);
  }
}

const setupPreloadBuild = async () => {
  let ctx = await esbuild.context({
    entryPoints: ["./src/index.ts"],
    outfile:  "./dist/index.js",
    bundle: true,
    platform: 'node',
    target: `chrome${chrome}`,
    sourcemap: false,
    sourceRoot: path.resolve(__dirname, "../layers/preload/"),
    external: ['electron', ...builtinModules], // Add external dependencies here
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
    // await setupPreloadBuild();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
