import { execa } from "execa";
import * as os from "os";
import * as path from "path";

import { downloadUrl } from "../utils/download-url";
import { getAppTmpDir } from "../utils/get-appdata-dir";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { CONDA_ENV_NAME, execPythonShell } from "../utils/exec-shell";
const systemType = os.type();

interface Requirement {
    name: string;
    type?: 'conda' | 'pip' | 'npm' | 'git' | "shell";
    version?: string;
    command?: string;
}

export class Bootstrap {

}


// 检查一个程序是否已经安装
async function checkIfInstalled(name: string): Promise<boolean> {
    try {
        if (name === "conda") {
            await execa(name);
        }
        if (name === "python") {
            await execPythonShell("python --version");
        }
        return true;
    } catch {
        return false;
    }
}

const appTmpDir = getAppTmpDir();
/**
 * Install Conda
 * @param dispatcher 
 * @returns 
 */
export async function installCondaTask(dispatcher: TaskEventDispatcher) {
    if (await checkIfInstalled("conda")) {
        return;
    }
    // 根据不同的系统设置不同的安装包地址和安装命令
    let installerUrl, installerPath, installCommand: any[] = [];
    if (systemType.toUpperCase().includes("WINDOWS")) {
        installerUrl = 'https://repo.continuum.io/miniconda/Miniconda3-latest-Windows-x86_64.exe';
        installerPath = path.resolve(appTmpDir, './Miniconda3-latest-Windows-x86_64.exe');
        installCommand = [installerPath, ['/InstallationType=JustMe', '/RegisterPython=0', '/S', '/D=C:\\tools\\Miniconda3']];
    } else if (systemType.toUpperCase().includes("DARWIN")) {
        installerUrl = 'https://repo.continuum.io/miniconda/Miniconda3-latest-MacOSX-x86_64.sh';
        installerPath = path.resolve(appTmpDir, './Miniconda3-latest-MacOSX-x86_64.sh');
        installCommand = ['bash', [installerPath, '-b']];
    } else if (systemType.toUpperCase().includes("LINUX")) {
        installerUrl = 'https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh';
        installerPath = path.resolve(appTmpDir, './Miniconda3-latest-Linux-x86_64.sh');
        installCommand = ['bash', [installerPath, '-b']];
    }
    await downloadUrl(installerUrl!, installerPath!)
    const ret = execa(installCommand[0], installCommand[1] as any);
    ret.stdout?.on("data", (chunk: any) => {
        dispatcher({
            message: chunk.toString()
        })
    });
    ret.stderr?.on("data", (chunk: any) => {
        dispatcher({
            message: chunk.toString()
        })
    });
    const {exitCode, stdout, stderr} = await ret;
    dispatcher({
        data: {
            exitCode,
            stderr,
            stdout
        }
    })
    return;
}

/**
 * Install python
 * @param dispatcher 
 * @returns 
 */
export async function installPythonTask(dispatcher: TaskEventDispatcher) {
    if (await checkIfInstalled("python")) {
        return true;
    }
    let installCommand: any[] = [];
    if (systemType.toUpperCase().includes("WINDOWS")) {
        installCommand = ['conda', ['create', '-n', CONDA_ENV_NAME, 'python=3.11.6']];
    } else {
        installCommand = ['conda', ['create', '-n', CONDA_ENV_NAME, 'python=3.11.6']];
    }
    const ret = execa(installCommand[0], installCommand[1] as any);
    ret.stdout?.on("data", (chunk: any) => {
        dispatcher({
            message: chunk.toString()
        })
    });
    ret.stderr?.on("data", (chunk: any) => {
        dispatcher({
            message: chunk.toString()
        })
    });
    const {exitCode, stdout, stderr} = await ret;
    dispatcher({
        data: {
            exitCode,
            stderr,
            stdout
        }
    })
    return;
}

/**
 * install any conda package
 * @param dispatcher 
 * @param params 
 * @returns 
 */
export async function installCondaPackageTask(dispatcher: TaskEventDispatcher, params: {
    packageName: string, 
    version: string, 
}) {
    if (await checkIfInstalled("git")) {
        return true;
    }
    let installCommand: any[] = ['conda', ['install', '-c', 'anaconda', params.packageName + params.version ? `=${params.version}` : "" ]];
    const ret = execa(installCommand[0], installCommand[1] as any);
    ret.stdout?.on("data", (chunk: any) => {
        dispatcher({
            message: chunk.toString()
        })
    });
    ret.stderr?.on("data", (chunk: any) => {
        dispatcher({
            message: chunk.toString()
        })
    });
    const {exitCode, stdout, stderr} = await ret;
    dispatcher({
        data: {
            exitCode,
            stderr,
            stdout
        }
    })
    return;
}


