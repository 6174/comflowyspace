import { ExecaChildProcess, Options, execaCommand } from "execa";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import * as os from "os";
import { isMac, isWindows } from "./env";
import { CONDA_ENV_NAME } from "../config-manager";
import { systemProxy } from "./env";

export const OS_TYPE = os.type().toUpperCase();
export const OS_HOME_DIRECTORY = os.homedir();
export const SHELL_ENV_PATH = getSystemPath();

export async function runCommand(
    command: string, 
    dispatcher: TaskEventDispatcher = () => { }, 
    options: Options = {}, 
    cb?: (process: ExecaChildProcess) => void
): Promise<{
    stderr: string,
    exitCode: number,
    stdout: string,
}> {
    if (systemProxy) {
        console.log("run command with proxy:", systemProxy);
    } else {
        console.log("run command without proxy")
    }
    const subProcess = execaCommand(command, {
        env: {
            PATH: SHELL_ENV_PATH,
            ...systemProxy,
        },
        // shell: isMac ? "/bin/zsh" : true,
        ...options
    });

    cb && cb(subProcess);

    subProcess.stdout?.on('data', (chunk) => {
        console.log("out", chunk.toString());
        dispatcher && dispatcher({
            message: chunk.toString()
        })
    });

    subProcess.stderr?.on('data', (chunk) => {
        console.log("error", chunk.toString());
        dispatcher && dispatcher({
            message: chunk.toString()
        })
    });

    const { exitCode, stderr, stdout } = await subProcess;

    dispatcher && dispatcher({
        data: {
            exitCode,
            stderr,
            stdout,
        },
    });

    if (exitCode !== 0) {
        throw new Error("Run command error" + stderr);
    }

    return {
        stderr,
        exitCode,
        stdout
    }
}

import * as nodePty from "node-pty"
import { getAppDataDir } from "./get-appdata-dir";

const shell = process.platform === 'win32' ? 'cmd' : 'zsh';
const appDir = getAppDataDir();

export function runCommandWithPty(
    command: string,
    dispatcher: TaskEventDispatcher = () => { },
    options: Options = {},
    cb?: (process: nodePty.IPty) => void
) {
    console.log("run command with PTY");
    const fullCommand = `${command};echo END_OF_COMMAND\n`;
    return new Promise((resolve, reject) => {
        const pty = nodePty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            env: {
                PATH: SHELL_ENV_PATH,
                DISABLE_UPDATE_PROMPT: "true",
                ...systemProxy,
            },
            cwd: (options.cwd || appDir) as string
        });

        cb && cb(pty);
        
        let buffer = "";
        const disposable = pty.onData(function (data: string) {
            if (data.trim() === fullCommand.trim()) {
                return;
            }
            buffer += data;
            if (data.indexOf('\n') > 0) {
                console.log("[Log:" + buffer + "]");
                dispatcher && dispatcher({
                    message: buffer
                });
                buffer = ""
            }
            if (data.trim() === 'END_OF_COMMAND') {
                console.log('The command has finished executing.');
                disposable.dispose();
                pty.kill();
            }
        });

        pty.onData

        pty.onExit((e: { exitCode: number }) => {
            console.log("exitcode", e.exitCode);
            resolve(pty);
            // if (e.exitCode !== 0) {
            // } else {
            //     resolve(pty);
            // }
        });
        pty.write(fullCommand);
    })
}

export function getSystemPath(): string {
    let paths;
    let pathDelimiter;
    if (OS_TYPE.includes('WINDOWS')) {
        pathDelimiter = ';';
        paths = ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files (x86)', 'C:\\tools\\Miniconda3\\Scripts', process.env.PATH];
    } else {
        pathDelimiter = ':';
        paths = ['/usr/local/bin', `${OS_HOME_DIRECTORY}/miniconda3/condabin`, `${OS_HOME_DIRECTORY}/bin`, '/usr/bin', '/sbin', '/usr/sbin', process.env.PATH];
    }
    return paths.join(pathDelimiter);
}

export const CONDA_ENV_PATH = isWindows ? `C:\\tools\\Miniconda3\\envs\\${CONDA_ENV_NAME}` : `${OS_HOME_DIRECTORY}/miniconda3/envs/${CONDA_ENV_NAME}`;
export const CONDA_PATH = isWindows ? 'C:\\tools\\Miniconda3\\Scripts\\conda.exe' : `${OS_HOME_DIRECTORY}/miniconda3/condabin/conda`;
export const condaActivate = `${CONDA_PATH} init & ${CONDA_PATH} activate ${CONDA_ENV_NAME} & `;
export const PYTHON_PATH = isWindows ? `${CONDA_ENV_NAME}\\bin\\python.exe` : `${CONDA_ENV_PATH}/bin/python`;
export const PIP_PATH = isWindows ? `${CONDA_ENV_NAME}\\bin\\pip.exe` : `${CONDA_ENV_PATH}/bin/pip`;