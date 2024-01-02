import * as nodePty from "node-pty"
import { getAppDataDir, getComfyUIDir } from "../utils/get-appdata-dir";
import { PYTHON_PATH, SHELL_ENV_PATH } from "../utils/run-command";
import path from "path";

const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const appDir = getAppDataDir()
const pty = nodePty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: appDir,
  env: {
    PATH: SHELL_ENV_PATH
  },
});

const repoPath = getComfyUIDir();
pty.write(`echo Hell0; sleep 5; echo END_OF_COMMAND\n`);

const dispose = pty.onData(function (data: string) {
  console.log(data);
  if (data.trim() === 'END_OF_COMMAND') {
    console.log('The command has finished executing.');
    dispose.dispose();
    pty.kill();
  }
});

pty.onExit((e: {exitCode: number}) => {
  console.log("exitcode", e.exitCode);
});


console.log(nodePty);
