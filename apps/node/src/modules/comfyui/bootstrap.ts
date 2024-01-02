import * as os from "os";
import * as path from "path";
import { isMac } from "../utils/env"
import { downloadUrl } from "../utils/download-url";
import { getAppDataDir, getAppTmpDir, getComfyUIDir, getStableDiffusionDir } from "../utils/get-appdata-dir";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { getMacArchitecture } from "../utils/get-mac-arch";
import { PIP_PATH, PYTHON_PATH, runCommand, runCommandWithPty } from "../utils/run-command";
import { CONDA_ENV_NAME, CONFIG_KEYS, appConfigManager } from "../config-manager";
import { getGPUType } from "../utils/get-gpu-type";
import { verifyIsTorchInstalled } from "./verify-torch";
import * as fsExtra from "fs-extra"
import { createOrUpdateExtraConfigFileFromStableDiffusion } from "../model-manager/model-paths";

const systemType = os.type();
const appTmpDir = getAppTmpDir();
const appDir = getAppDataDir();

export async function checkBasicRequirements() {
    const isSetupedConfig = await checkIsSetupedConfig();
    let isCondaInstalled = false, 
        isPythonInstalled = false, 
        isTorchInstalled = false,
        isComfyUIInstalled = false,
        isComfyUIStarted = false,
        isGitInstalled = false;
    if (isSetupedConfig) {
        isComfyUIInstalled = await checkIfInstalledComfyUI();
        isComfyUIStarted = await isComfyUIAlive();
    }
    isCondaInstalled = await checkIfInstalled("conda");
    isPythonInstalled = await checkIfInstalled("python");
    isGitInstalled = await checkIfInstalled("git --version");
    if (isCondaInstalled && isPythonInstalled) {
        isTorchInstalled = await verifyIsTorchInstalled()
    }

    return {
        isCondaInstalled,
        isPythonInstalled,
        isGitInstalled,
        isTorchInstalled,
        isComfyUIInstalled,
        isComfyUIStarted,
        isSetupedConfig,
        isBasicModelInstalled: true,
        isBasicExtensionInstalled: true
    }
}

export async function checkIsSetupedConfig() {
    const config = appConfigManager.get(CONFIG_KEYS.appSetupConfig)
    return !!config;
}

export async function checkIfInstalledComfyUI(comfy_path?: string): Promise<boolean> {
    try {
        const comfyUIPath = comfy_path || getComfyUIDir();
        const isGitRepo = await fsExtra.exists(path.resolve(comfyUIPath, ".git"));
        const isExistMain = await fsExtra.exists(path.resolve(comfyUIPath, "main.py"));
        const isExisComfySrc = await fsExtra.exists(path.resolve(comfyUIPath, "comfy"));
        return isGitRepo && isExistMain && isExisComfySrc;
    } catch(err) {
        return false;
    }
}

// 检查一个程序是否已经安装
export async function checkIfInstalled(name: string): Promise<boolean> {
    try {
        if (name === "python") {
            await runCommand(`${PYTHON_PATH} --version`);
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
            installerUrl = 'https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe';
            installerPath = path.resolve(appTmpDir, './Miniconda3-latest-Windows-x86_64.exe');
            installCommand = [installerPath, ['/InstallationType=JustMe', '/RegisterPython=0', '/S', '/D=C:\\tools\\Miniconda3']];
        } else if (systemType.toUpperCase().includes("DARWIN")) {
            const architecture = await getMacArchitecture();
            installerUrl = architecture === 'arm64'
                ? 'https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh'
                : 'https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh';
            installerPath = path.resolve(appTmpDir, architecture === 'arm64' 
                ? 'Miniconda3-latest-MacOSX-arm64.sh'
                : 'Miniconda3-latest-MacOSX-x86_64.sh'
            );

            installCommand = ['bash', [installerPath, '-b']];
        } else if (systemType.toUpperCase().includes("LINUX")) {
            installerUrl = 'https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh';
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


/**
 * Install Pytorch
 * @param dispatcher 
 * @param nightly 
 * @returns 
 */
export async function installPyTorchForGPU(dispatcher: TaskEventDispatcher, nightly: boolean = false): Promise<boolean> {
    console.log("start installing Pytorch");
    dispatcher({
        message: "Start installing PyTorch..."
    });
    if (isMac) {
        try {
            const installCommand = `${PIP_PATH} install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu`;
            await runCommand(installCommand, dispatcher);
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
                    ? `${PIP_PATH} install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/${rocmVersion}`
                    : ` ${PIP_PATH} install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/${rocmVersion}`;

                await runCommand(installCommand, dispatcher);
            }
            // NVIDIA GPU
            else if (gpuType === 'nvidia') {
                const installCommand = `${PIP_PATH} install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121`;

                await runCommand(installCommand, dispatcher);
            } else {
                throw new Error(`Unkown GPU Type`)
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

export async function cloneComfyUI(dispatch: TaskEventDispatcher): Promise<boolean> {
    try {
        dispatch({
            message: 'Start cloning ComfyUI...'
        });

        await runCommand(`git clone https://github.com/comfyanonymous/ComfyUI`, dispatch, {
            cwd: appDir
        });

        const repoPath = getComfyUIDir();

        await runCommand(`${PIP_PATH} install -r requirements.txt`, dispatch, {
            cwd: repoPath
        });

        const sdPath = getStableDiffusionDir()
        if (sdPath !== "") {
            createOrUpdateExtraConfigFileFromStableDiffusion(sdPath)
        }

        dispatch({
            message: "clone comfyui success"
        });
    } catch (error: any) {
        throw new Error(`clone comfyui error: ${error.message}`);
    }
    return true;
}

import * as nodePty from "node-pty"
import { SlotEvent } from "@comflowy/common/utils/slot-event";
let comfyuiProcess: nodePty.IPty;
export type ComfyUIProgressEventType = {
    type: "START" | "RESTART" | "STOP" | "INFO" | "ERROR" | "WARNING",
    message: string | undefined
}
export const comfyUIProgressEvent = new SlotEvent<ComfyUIProgressEventType>();
export async function startComfyUI(dispatcher: TaskEventDispatcher): Promise<boolean> {
    try {
        console.log("start comfyUI");
        const repoPath = getComfyUIDir();
        await runCommandWithPty(`${PIP_PATH} install -r requirements.txt; ${PYTHON_PATH} main.py --enable-cors-header`, (event => {
            dispatcher(event);
            const cevent: ComfyUIProgressEventType = {
                type: "INFO",
                message: event.message
            };

            if (event.message?.includes("To see the GUI go to: http://127.0.0.1:8188")) {
                dispatcher({
                    type: "SUCCESS",
                    message: "Comfy UI started success"
                })
                cevent.type = "START"
                cevent.message = "Comfy UI started success"
            }

            if (event.message?.includes("ERROR")) {
                cevent.type = "ERROR"
            }

            comfyUIProgressEvent.emit(cevent);
        }), {
            cwd: repoPath
        }, (process: nodePty.IPty) => {
            comfyuiProcess = process;
        });
    } catch (err: any) {
        comfyUIProgressEvent.emit({
            type: "ERROR",
            message: err.message
        });
        console.log("Start ComfyUI Error", err);
        throw new Error(`Start ComfyUI error: ${err.message}`);
    }
    return true;
}

export async function stopComfyUI(): Promise<boolean> {
    try {
        if (comfyuiProcess) {
            comfyuiProcess.kill(); 
        }
        comfyUIProgressEvent.emit({
            type: "STOP",
            message: "STOP COMFYUI SUCCESS"
        });
    } catch (error) {
        throw new Error(`Error stopping comfyui`);
    }
    return true;
}

export async function isComfyUIAlive(): Promise<boolean> {
    try {
        await fetch("http://127.0.0.1:8188");
        return true;
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