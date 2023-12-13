import { builtinModules } from "module";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path"
import htmlPlugin from '@chialab/esbuild-plugin-html';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import * as fs from "fs";
import process from "process";

console.log("html Plugin", htmlPlugin);
console.log("saas Plugin", sassPlugin);

// import {chrome, node} from "../.electron-vendors.cache.json";
const chrome = 98;
const node = 16;
export const __dirname = dirname(fileURLToPath(import.meta.url));

const MainBuildConfig = {
    entryPoints: [path.resolve(__dirname, "../layers/main/", "./src/index.ts")],
    outfile:  path.resolve(__dirname, "../layers/main/", "./dist/index.js"),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: [`node${node}`],
    sourcemap: false,
    external: ['electron', 'node-pty', ...builtinModules], 
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

const RendererBuildConfig = {
    entryPoints: findAllHtmlFilesInRenderer(),
    outdir: path.resolve(__dirname, "../layers/renderer/", "./dist"),
    bundle: true,
    platform: 'node',
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.MODE || "development"),
    },
    target: `chrome${chrome}`,
    sourcemap: false,
    assetNames: 'assets/[name]-[hash]',
    chunkNames: '[ext]/[name]-[hash]',
    external: ['electron', ...builtinModules], // Add external dependencies here
    plugins: [
        htmlPlugin(), 
        sassPlugin({
            filter: /\.scss$/
        }),
    ]
}

function findAllHtmlFilesInRenderer() {
    const srcDirectory = path.resolve(__dirname, "../layers/renderer/src");

    const allFilesAndDirs = fs.readdirSync(srcDirectory);

    const htmlFiles = allFilesAndDirs.filter(fileOrDir => {
        const fullPath = path.resolve(srcDirectory, fileOrDir);
        
        const isFile = fs.statSync(fullPath).isFile();
        
        const isHtmlFile = path.extname(fullPath) === '.html';
        
        return isFile && isHtmlFile;
    });
    return htmlFiles.map(file => `${srcDirectory}/${file}`);
}

export {
    MainBuildConfig,
    PreloadBuildConfig,
    RendererBuildConfig
}