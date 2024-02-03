import { ExecaChildProcess, Options, execaCommand } from "execa";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import * as os from "os";
import { getSystemProxy, isMac, isWindows } from "./env";
import { CONDA_ENV_NAME } from "../config-manager";

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
    const { systemProxy, systemProxyString } = await getSystemProxy();
    if (systemProxy) {
        logger.info("run command with proxy:" + systemProxyString);
    } else {
        logger.info("run command without proxy")
    }
    const subProcess = execaCommand(command, {
        env: {
            ...process.env,
            PATH: SHELL_ENV_PATH,
            ...systemProxy,
        },
        // shell: isMac ? "/bin/zsh" : true,
        ...options
    });

    cb && cb(subProcess);

    subProcess.stdout?.on('data', (chunk) => {
        logger.info("out", chunk.toString());
        dispatcher && dispatcher({
            message: chunk.toString()
        })
    });

    subProcess.stderr?.on('data', (chunk) => {
        logger.error(`run command "${command}" error: ${chunk.toString()}`);
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
        message: stderr + stdout
    });

    if (exitCode !== 0) {
        throw new Error("Run command error:" + stderr);
    }

    return {
        stderr,
        exitCode,
        stdout
    }
}

import * as nodePty from "node-pty"
import { getAppDataDir } from "./get-appdata-dir";
import logger from "./logger";

const shell = process.platform === 'win32' ? 'powershell.exe' : 'zsh';

const appDir = getAppDataDir();

export async function runCommandWithPty(
    command: string,
    dispatcher: TaskEventDispatcher = () => { },
    options: Options = {},
    cb?: (process: nodePty.IPty) => void
) {
    const { systemProxy, systemProxyString } = await getSystemProxy();
    logger.info("run command with PTY");
    const fullCommand = `${command} && echo END_OF_COMMAND\n`;
    return new Promise((resolve, reject) => {
        const pty = nodePty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            env: {
                ...process.env,
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
                logger.info("[Log:" + buffer + "]");
                dispatcher && dispatcher({
                    message: buffer.replace("&& echo END_OF_COMMAND", "").replace("END_OF_COMMAND", "")
                });
                buffer = ""
            }
            if (data.trim() === 'END_OF_COMMAND') {
                logger.info('The command has finished executing.');
                disposable.dispose();
                pty.kill();
            }
        });

        pty.onData

        pty.onExit((e: { exitCode: number }) => {
            logger.info("exitcode", e.exitCode);
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
    const { CONDA_SCRIPTS_PATH } = getCondaPaths();
    if (OS_TYPE.includes('WINDOWS')) {
        pathDelimiter = ';';
        paths = ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files (x86)', CONDA_SCRIPTS_PATH, process.env.PATH];
    } else {
        pathDelimiter = ':';
        paths = ['/usr/local/bin', CONDA_SCRIPTS_PATH, '/usr/bin', '/sbin', '/usr/sbin', process.env.PATH];
    }
    return paths.join(pathDelimiter);
}

// export const CONDA_ENV_PATH = isWindows ? `C:\\tools\\Miniconda3\\envs\\${CONDA_ENV_NAME}` : `${OS_HOME_DIRECTORY}/miniconda3/envs/${CONDA_ENV_NAME}`;
// export const CONDA_PATH = isWindows ? 'C:\\tools\\Miniconda3\\Scripts\\conda.exe' : `${OS_HOME_DIRECTORY}/miniconda3/condabin/conda`;
// export const condaActivate = `${CONDA_PATH} init & ${CONDA_PATH} activate ${CONDA_ENV_NAME} & `;
// export const PYTHON_PATH = isWindows ? `${CONDA_ENV_PATH}\\python.exe` : `${CONDA_ENV_PATH}/bin/python`;
// export const PIP_PATH = isWindows ? `${CONDA_ENV_PATH}\\Scripts\\pip.exe` : `${CONDA_ENV_PATH}/bin/pip`;

export function getCondaPaths(): {
    CONDA_ROOT: string,
    CONDA_ENV_PATH: string,
    CONDA_SCRIPTS_PATH: string,
    CONDA_PATH: string,
    PYTHON_PATH: string,
    PIP_PATH: string
}{
    // if user already install conda, conda_prefix is the location of conda root;
    const condaEnv = process.env.CONDA_PREFIX;
    const CONDA_ROOT = condaEnv ? condaEnv : (isWindows ? 'C:\\tools\\Miniconda3' : `${OS_HOME_DIRECTORY}/miniconda3`);

    if (isWindows) {
        const CONDA_ENV_PATH = `${CONDA_ROOT}\\envs\\${CONDA_ENV_NAME}`
        return {
            CONDA_ROOT,
            CONDA_ENV_PATH,
            CONDA_SCRIPTS_PATH: `${CONDA_ROOT}\\Scripts`,
            CONDA_PATH: `${CONDA_ROOT}\\Scripts\\conda.exe`,
            PYTHON_PATH: `${CONDA_ENV_PATH}\\python.exe`,
            PIP_PATH: `${CONDA_ENV_PATH}\\Scripts\\pip.exe`
        }
    }

    const CONDA_ENV_PATH = `${CONDA_ROOT}/envs/${CONDA_ENV_NAME}`
    return {
        CONDA_ROOT,
        CONDA_ENV_PATH,
        CONDA_SCRIPTS_PATH: `${CONDA_ROOT}/bin`,
        CONDA_PATH: `${CONDA_ROOT}/condabin/conda`,
        PYTHON_PATH: `${CONDA_ENV_PATH}/bin/python`,
        PIP_PATH: `${CONDA_ENV_PATH}/bin/pip`
    }
}