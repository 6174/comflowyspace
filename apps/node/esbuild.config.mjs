import * as esbuild from 'esbuild'

let ctx = await esbuild.context({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node14',
  sourcemap: false,
  external: ['express'], // Add external dependencies here
  plugins: [{
    name: "rebuild-notify", 
    setup(build) { 
      build.onEnd((result) => {
        restartServer();
      })
    }
  }]
})

await ctx.watch({})

let serverProcess;

function restartServer() {
  if (serverProcess) {
    stopServer();
  }
  startServer();
}

import {execa} from "execa";

function startServer() {
  console.log('Starting server...');
  serverProcess = execa('pnpm', ['run', 'start']);
  serverProcess.stdout?.on('data', (data) => console.log(data.toString()));
  serverProcess.stderr?.on('data', (data) => console.error(data.toString()));
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    console.log('Stopping server...');
    serverProcess.kill();
  }
}

console.log('watching...');