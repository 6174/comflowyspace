import path from "path";
import { SHELL_ENV_PATH, getCondaPaths, runCommand } from "../utils/run-command";
import { appDir, isWindows } from "../utils/env";
import { spawn } from "child_process";
import { getComfyUIDir } from "../utils/get-appdata-dir";
import logger from "../utils/logger";

async function start() {
  const { PIP_PATH, PYTHON_PATH } = getCondaPaths();

  try {
    logger.info("start ");
    const repoPath = getComfyUIDir();
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
      logger.info(`stdout: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    proc.on('close', (code) => {
      logger.info(`child process exited with code ${code}`);
    });
    
  } catch (err: any) {
    throw new Error(`Start ComfyUI error: ${err.message}`);
  }
}

start();