import { Options, execaCommand } from "execa";
import { TaskEventDispatcher } from "../task-queue/task-queue";

export async function runCommand(command: string, dispatcher: TaskEventDispatcher = () => {}, options: Options = {}): Promise<{
    stderr: string,
    exitCode: number,
    stdout: string
}> {
    const process = execaCommand(command, { shell: true, ...options });

    process.stdout?.on('data', (chunk) => {
        dispatcher && dispatcher({
            message: chunk.toString()
        })
    });

    process.stderr?.on('data', (chunk) => {
        dispatcher &&  dispatcher({
            message: chunk.toString()
        })
    });

    const { exitCode, stderr, stdout } = await process;

    dispatcher && dispatcher({
        data: {
            exitCode,
            stderr,
            stdout,
        },
    });

    return {
        stderr,
        exitCode,
        stdout
    }
}
