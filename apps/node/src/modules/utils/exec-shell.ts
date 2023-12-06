import { execa } from "execa";

export const CONDA_ENV_NAME = 'comflowy';
export async function execPythonShell(script: string) {
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : '/bin/bash';
    const activateCommand = isWindows ? `${CONDA_ENV_NAME}\\Scripts\\activate` : `conda activate ${CONDA_ENV_NAME}`;
    const command = `${activateCommand} && ${script}`;
    try {
        const { stdout } = await execa(command, { shell });
        return stdout
    } catch (error) {
        console.error(`Failed to execute command: ${command}`, error);
    }
}