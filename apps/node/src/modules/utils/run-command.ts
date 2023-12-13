import { ExecaChildProcess, Options, execaCommand } from "execa";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import * as os from "os";
import { isMac, isWindows } from "./env";
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
    const subProcess = execaCommand(command, {
        env: {
            PATH: SHELL_ENV_PATH
        },
        // shell: isMac ? "/bin/zsh" : true,
        ...options
    });

    cb && cb(subProcess);

    subProcess.stdout?.on('data', (chunk) => {
        console.log(chunk.toString());
        dispatcher && dispatcher({
            message: chunk.toString()
        })
    });

    subProcess.stderr?.on('data', (chunk) => {
        console.log(chunk.toString());
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