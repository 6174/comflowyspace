import { ExecaChildProcess, Options, execaCommand } from "execa";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { getSystemPath, getSystemProxy } from "./env";

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
        logger.info("run command with proxy:" + command + " " + systemProxyString);
    } else {
        logger.info("run command without proxy")
    }
    const SHELL_ENV_PATH = getSystemPath({
        CONDA_SCRIPTS_PATH: conda.info?.CONDA_SCRIPTS_PATH || "",
        CONDA_ENV_PATH: conda.env?.CONDA_ENV_PATH || ""
    });
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
import { conda } from "./conda";

export const shell = process.platform === 'win32' ? 'powershell.exe' : 'zsh';

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
        try {
            const pty = nodePty.spawn(shell, [], {
                name: 'xterm-color',
                // conpty will cause Error: ptyProcess.kill() will throw a error that can't be catched
                useConpty: false,
                cols: 80,
                rows: 30,
                env: {
                    ...process.env,
                    ...systemProxy,
                    Path: process.env.PATH,
                    DISABLE_UPDATE_PROMPT: "true",
                    encoding: 'utf-8',
                },
                cwd: (options.cwd || appDir) as string
            });
    
            cb && cb(pty);
            
            let buffer = "";
            const disposable = pty.onData(function (data: string) {
                // raw output data
                dispatcher && dispatcher({
                    message: data,
                    data: {
                        raw: true
                    }
                });

                if (data.trim() === fullCommand.trim()) {
                    return;
                }

                // wrapped output data
                buffer += data;
                if (data.indexOf('\n') > 0) {
                    logger.info("[Log:" + buffer + "]");
                    dispatcher && dispatcher({
                        message: buffer.replace("&& echo END_OF_COMMAND", "").replace("END_OF_COMMAND", ""),
                        data: {
                            raw: false
                        }
                    });
                    buffer = ""
                }
                if (data.trim() === 'END_OF_COMMAND') {
                    logger.info('The command has finished executing.');
                    disposable.dispose();
                    pty.kill();
                }
            });
    
            pty.onExit((e: { exitCode: number }) => {
                logger.info("exitcode", e.exitCode);
                resolve(null);
                // if (e.exitCode !== 0) {
                // } else {
                //     resolve(pty);
                // }
            });
            pty.write(fullCommand);

        } catch (err: any) {
            logger.error("Run command error" + err.message + err.stack);
        }
    })
}
