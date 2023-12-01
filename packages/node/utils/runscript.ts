import { NodeOptions, execaNode } from "execa";

export async function runScript(command: string[], options?: NodeOptions): Promise<number> {
    try {
        const { exitCode } = await execaNode(command[0], command.slice(1), options)
        return exitCode || 0;
    } catch (error) {
        console.error(`Error executing script: ${error}`);
        return 1; // Return non-zero code to indicate failure
    }
}