const  { builtinModules } = require("module");
const path = require("path");
const {chrome, node} = require("../.electron-vendors.cache.json");
const MainBuildConfig = {
    entryPoints: [path.resolve(__dirname, "../layers/main/", "./src/index.ts")],
    outfile:  path.resolve(__dirname, "../layers/main/", "./dist/index.js"),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: [`node${node}`],
    sourcemap: false,
    external: ['electron', ...builtinModules], 
}

const PreloadBuildConfig = {
    entryPoints: [path.resolve(__dirname, "../layers/preload/", "./src/index.ts")],
    outfile:  path.resolve(__dirname, "../layers/preload/", "./dist/index.js"),
    bundle: true,
    platform: 'node',
    target: `chrome${chrome}`,
    sourcemap: false,
    external: ['electron', ...builtinModules], // Add external dependencies here
}

module.exports = {
    MainBuildConfig,
    PreloadBuildConfig
}