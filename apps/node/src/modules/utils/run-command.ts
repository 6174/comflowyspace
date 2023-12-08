import { Options, execaCommand } from "execa";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import * as os from "os";
export const OS_TYPE = os.type().toUpperCase();
export const OS_HOME_DIRECTORY = os.homedir();
export const SHELL_ENV_PATH = getSystemPath();

export async function runCommand(command: string, dispatcher: TaskEventDispatcher = () => { }, options: Options = {}): Promise<{
    stderr: string,
    exitCode: number,
    stdout: string
}> {
    const subProcess = execaCommand(command, {
        env: {
            PATH: SHELL_ENV_PATH
        },
        shell: true,
        ...options
    });

    subProcess.stdout?.on('data', (chunk) => {
        dispatcher && dispatcher({
            message: chunk.toString()
        })
    });

    subProcess.stderr?.on('data', (chunk) => {
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
