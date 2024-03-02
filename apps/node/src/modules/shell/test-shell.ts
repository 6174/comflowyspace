import path from "path";
import { runCommand } from "../utils/run-command";
import { appDir, getSystemPath, isWindows } from "../utils/env";
import { spawn } from "child_process";
import { getComfyUIDir } from "../utils/get-appdata-dir";
import logger from "../utils/logger";
import { conda } from "../utils/conda";

async function start() {
  const { PIP_PATH, PYTHON_PATH, CONDA_SCRIPTS_PATH, CONDA_ENV_PATH } = conda.getCondaPaths();

  try {
    logger.info("start ");
    const repoPath = getComfyUIDir();
    const shell = isWindows ? 'cmd' : '/bin/bash';
    const command = PYTHON_PATH;
    const args = ['main.py', '--enable-cors-header'];

    const proc = spawn(command, args, {
      cwd: repoPath,
      env: {
        PATH: getSystemPath({
          CONDA_SCRIPTS_PATH,
          CONDA_ENV_PATH
        })
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