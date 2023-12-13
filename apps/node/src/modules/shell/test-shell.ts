import path from "path";
import { PYTHON_PATH, SHELL_ENV_PATH, runCommand } from "../utils/run-command";
import { appDir, isWindows } from "../utils/env";
import { spawn } from "child_process";

async function start() {
  try {
    console.log("start ");
    const repoPath = path.resolve(appDir, 'ComfyUI');
    const shell = isWindows ? 'cmd' : '/bin/bash';
    const command = PYTHON_PATH;
    const args = ['main.py', '--enable-cors-header'];

    const proc = spawn(command, args, {
      cwd: repoPath,
      env: {
        PATH: SHELL_ENV_PATH
      },
      shell
    });

    proc.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    proc.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
    
  } catch (err: any) {
    throw new Error(`Start ComfyUI error: ${err.message}`);
  }
}

start();