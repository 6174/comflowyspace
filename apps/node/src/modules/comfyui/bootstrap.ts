import { ExecaChildProcess, execaCommand } from "execa";
import * as os from "os";
import * as path from "path";

import { downloadUrl } from "../utils/download-url";
import { getAppDataDir, getAppTmpDir } from "../utils/get-appdata-dir";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { getMacArchitecture } from "../utils/get-mac-arch";
import { runCommand } from "../utils/run-command";
import { CONDA_ENV_NAME } from "../config-manager";
import { getGPUType } from "../utils/get-gpu-type";
import { verifyIsTorchInstalled } from "./verify-torch";
const systemType = os.type();
const appTmpDir = getAppTmpDir();

export async function checkBasicRequirements() {
    const isCondaInstalled = await checkIfInstalled("conda");
    const isPythonInstalled = await checkIfInstalled("python");
    const isGitInstalled = await checkIfInstalled("git");
    let isTorchInstalled = false;
    if (isCondaInstalled && isPythonInstalled) {
        isTorchInstalled = await verifyIsTorchInstalled()
    }
    return {
        isCondaInstalled,
        isPythonInstalled,
        isGitInstalled,
        isTorchInstalled
    }
}

// 检查一个程序是否已经安装
export async function checkIfInstalled(name: string): Promise<boolean> {
    try {
        if (name === "python") {
            await runCommand(`conda activate ${CONDA_ENV_NAME} && python --version`);
        } else {
            await runCommand(name);
        }
        return true;
    } catch(err) {
        console.log("check install error", err);
        return false;
    }
}

/**
 * Install Conda
 * @param dispatcher 
 * @returns 
 */
export async function installCondaTask(dispatcher: TaskEventDispatcher): Promise<boolean> {
    if (await checkIfInstalled("conda")) {
        dispatcher({
            message: `Already Find Conda`
        });
        return true;
    }
    dispatcher({
        message: `Start install conda`
    });
    try {
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
        await downloadUrl(dispatcher,installerUrl!, installerPath!)
        await runCommand(`${installCommand[0]} ${installCommand[1].join(" ")}`, dispatcher)
        dispatcher({
            message: `Install conda end`
        });
    } catch (e: any) {
        throw new Error(`Install conda error: ${e.message}`)
    }
    return true;
}

/**
 * Install python
 * @param dispatcher 
 * @returns 
 */
export async function installPythonTask(dispatcher: TaskEventDispatcher): Promise<boolean> {
    if (await checkIfInstalled("python")) {
        dispatcher({
            message: `Already Find Python=3.10.8`
        });
        return true;
    }
    try {
        dispatcher({
            message: `Start installing Python=3.10.8`
        });
        await runCommand(`conda create -c anaconda -n ${CONDA_ENV_NAME} python=3.10.8 -y`, dispatcher);
        dispatcher({
            message: `Install Python=3.10.8 finished`
        });
    } catch (e: any) {
        throw new Error(`Install python error: ${e.message}`)
    }
    return true;
}

/**
 * install any conda package
 * @param dispatcher 
 * @param params 
 * @returns 
 */
export async function installCondaPackageTask(dispatcher: TaskEventDispatcher, params: {
    packageRequirment: string
}): Promise<boolean> {
    try {
        dispatcher({
            message: `Start installing ${params.packageRequirment}...`
        });
        if (await checkIfInstalled(params.packageRequirment.split("=")[0])) {
            return true;
        }
        await runCommand(`conda install -c anaconda ${params.packageRequirment}`, dispatcher);
        dispatcher({
            message: `Install ${params.packageRequirment} end`
        });
    } catch(e: any) {
        throw new Error(`Install conda packages error: ${e.message}`)
    }
    return true;
}

export const condaActivate = `conda env activate ${CONDA_ENV_NAME} && `;
/**
 * Install Pytorch
 * @param dispatcher 
 * @param nightly 
 * @returns 
 */
export async function installPyTorchForGPU(dispatcher: TaskEventDispatcher, nightly: boolean = false): Promise<boolean> {
    dispatcher({
        message: "Start installing PyTorch..."
    });
    if (systemType.toUpperCase().includes("DARWIN")) {
        try {
            const architecture = await getMacArchitecture();
            const scriptUrl = architecture === 'arm64'
                ? 'https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh'
                : 'https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh';

            const installerPath = path.resolve(appTmpDir, 'MinicondaInstaller.sh');

            await downloadUrl(dispatcher, scriptUrl, installerPath);
            await runCommand(`sh ${installerPath}`, dispatcher);

        } catch (error: any) {
            throw new Error(`PyTorch installation failed: ${error.message}`)
        }
    } else {
        try {
            const gpuType = await getGPUType()
            // AMD GPU
            if (gpuType === 'amd') {
                const rocmVersion = nightly ? 'rocm5.7' : 'rocm5.6';
                const installCommand = nightly
                    ? `pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/${rocmVersion}`
                    : ` pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/${rocmVersion}`;

                await runCommand(condaActivate + installCommand, dispatcher);
            }
            // NVIDIA GPU
            else if (gpuType === 'nvidia') {
                const installCommand = `pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121`;

                await runCommand(condaActivate + installCommand, dispatcher);
            } else {
                dispatcher({
                    message: `UNKNOWN GPU Type`
                });
            }
        } catch (error: any) {
            throw new Error(`PyTorch installation failed: ${error.message}`)
        }
    }

    dispatcher({
        message: "Installing PyTorch Finish"
    });

    return true;
}

const appDir = getAppDataDir();
export async function cloneComfyUI(dispatch: TaskEventDispatcher): Promise<boolean> {
    try {
        dispatch({
            message: 'Start cloning ComfyUI...'
        });

        await runCommand(`git clone https://github.com/comfyanonymous/ComfyUI`, dispatch, {
            cwd: appDir
        });

        const repoPath = path.resolve(appDir, 'ComfyUI');

        await runCommand(`${condaActivate} pip install -r requirements.txt`, dispatch, {
            cwd: repoPath
        });

        dispatch({
            message: "clone comfyui success"
        });
    } catch (error: any) {
        throw new Error(`clone comfyui error: ${error.message}`);
    }
    return true;
}

let comfyuiProcess: ExecaChildProcess<string>;
export async function startComfyUI(dispatcher: TaskEventDispatcher): Promise<boolean> {
    try {
        const repoPath = path.resolve(appDir, 'ComfyUI');
        const process = execaCommand(`${condaActivate} python main.py --enable-cors-header`, {
            shell: true,
            cwd: repoPath
        });
        process.stdout?.on('data', (chunk) => {
            dispatcher({
                message: chunk.toString()
            })
        });

        process.stderr?.on('data', (chunk) => {
            dispatcher({
                message: chunk.toString()
            })
        });

        comfyuiProcess = process;
    } catch (err: any) {
        throw new Error(`Start ComfyUI error: ${err.message}`);
    }
    return true;
}

export async function stopComfyUI(): Promise<boolean> {
    try {
        // 暂停 Python 程序
        if (comfyuiProcess) {
            const ret = comfyuiProcess.kill(); // 可以根据需要使用不同的信号
            return ret;
        }
    } catch (error) {
        throw new Error(`Error stopping comfyui`);
    }
    return true;
}

export async function isComfyUIAlive(): Promise<boolean> {
    try {
        // 检查 Python 进程是否存在
        return comfyuiProcess?.exitCode === null;
    } catch (error) {
        console.error('Error checking process:', error);
        return false;
    }
}

export async function restartComfyUI(dispatcher: TaskEventDispatcher): Promise<boolean>  {
    try {
        await stopComfyUI(); // 停止当前运行的 ComfyUI
        await startComfyUI(dispatcher); // 启动新的 ComfyUI
    } catch (err: any) {
        throw new Error(`Error restarting comfyui: ${err.message}`);
    }
    return true;
}