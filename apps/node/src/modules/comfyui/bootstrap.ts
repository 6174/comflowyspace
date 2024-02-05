import * as os from "os";
import * as path from "path";
import { getSystemProxy, isMac, isWindows } from "../utils/env"
import { downloadUrl } from "../utils/download-url";
import { getAppDataDir, getAppTmpDir, getComfyUIDir, getStableDiffusionDir } from "../utils/get-appdata-dir";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { getMacArchitecture } from "../utils/get-mac-arch";
import { getCondaPaths, runCommand, runCommandWithPty } from "../utils/run-command";
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
        isBasicExtensionInstalled: true,
        comfyUIVersion: await checkComfyUIVersion()
    }
}

export async function checkComfyUIVersion() {
    try {
        const ret = await runCommand('git rev-parse HEAD', (event) => { }, {
            cwd: getComfyUIDir()
        });
        return ret.stdout;
    } catch(err) {
        logger.info(err);
    }
    return ""
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
    const { PIP_PATH, PYTHON_PATH } = getCondaPaths();

    try {
        if (name === "python") {
            await runCommand(`${PYTHON_PATH} --version`);
        } else {
            await runCommand(name);
        }
        return true;
    } catch(err) {
        logger.info("check install error", err);
        return false;
    }
}

/**
 * Install Conda
 * @param dispatcher 
 * @returns 
 */
export async function installCondaTask(dispatcher: TaskEventDispatcher): Promise<boolean> {
    let success = false;
    let lastError = null;
    for (let i = 0; i < 3; i++) {
        try {
            if (await checkIfInstalled("conda")) {
                dispatcher({
                    message: `Already Find Conda`
                });
                return true;
            }
            dispatcher({
                message: `Start install conda`
            });
            let installerUrl, installerPath, installCommand: any[] = [];
            if (systemType.toUpperCase().includes("WINDOWS")) {
                await fsExtra.ensureDir('C:\\tools');
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
                installCommand = ['bash', [installerPath, '-b', '-u']];
            }
            await downloadUrl(dispatcher,installerUrl!, installerPath!)
            try {
                await runCommand(`${installCommand[0]} ${installCommand[1].join(" ")}`, dispatcher);
                dispatcher({
                    message: `Install conda end`
                });
                success = true;
                break;
            } catch (err: any) {
                console.error('Error running command:', err);
                dispatcher({
                    message: `Error running command:` + err.message
                });
                lastError = err;
            }
        } catch (e: any) {
            lastError = e;
        }
    }
    if (!success) {
        throw new Error(`Install conda error: ${lastError.message}`)
    }
    return true;
}

/**
 * Install python
 * @param dispatcher 
 * @returns 
 */
export async function installPythonTask(dispatcher: TaskEventDispatcher): Promise<boolean> {
    let success = false;
    let lastError = null;
    for (let i = 0; i < 3; i++) {
        try {
            if (await checkIfInstalled("python")) {
                dispatcher({
                    message: `Already Find Python=3.10.8`
                });
                return true;
            }
            dispatcher({
                message: `Start installing Python=3.10.8`
            });
            await runCommand(`conda create -c anaconda -n ${CONDA_ENV_NAME} python=3.10.8 -y`, dispatcher);
            dispatcher({
                message: `Install Python=3.10.8 finished`
            });
            success = true;
            break;
        } catch (e: any) {
            lastError = e;
        }
    }

    if (!success) {
        throw new Error(`Install python error: ${lastError.message}`);
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
    let success = false;
    let lastError = null;

    for (let i = 0; i < 3; i++) {
        try {
            dispatcher({
                message: `Start installing ${params.packageRequirment}...`
            });
            await runCommand(`conda install -c anaconda -n ${CONDA_ENV_NAME} ${params.packageRequirment} -y`, dispatcher);
            dispatcher({
                message: `Install ${params.packageRequirment} end`
            });
            success = true;
            break;
        } catch(e: any) {
            lastError = e
        }
    }

    if (!success) {
        new Error(`Install conda packages error: ${lastError.message}`)
    }

    return true;
}


/**
 * install any conda package
 * @param dispatcher 
 * @param params 
 * @returns 
 */
export async function installPipPackageTask(dispatcher: TaskEventDispatcher, params: {
    packageRequirment: string
}): Promise<boolean> {
    const { PIP_PATH, PYTHON_PATH } = getCondaPaths();

    let success = false;
    let lastError = null;

    for (let i = 0; i < 3; i++) {
        try {
            dispatcher({
                message: `Pip install ${params.packageRequirment}...`
            });
            await runCommand(`${PIP_PATH} install ${params.packageRequirment}`, dispatcher);
            dispatcher({
                message: `Install ${params.packageRequirment} end`
            });
            success = true;
            break;
        } catch (e: any) {
            lastError = e
        }
    }

    if (!success) {
        new Error(`Install conda packages error: ${lastError.message}`)
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
    const { PIP_PATH, PYTHON_PATH } = getCondaPaths();

    logger.info("start installing Pytorch");
    dispatcher({
        message: "Start installing PyTorch..."
    });

    let success = false;
    let lastError = null;
    for (let i = 0; i < 3; i++) {
        if (isMac) {
            try {
                const installCommand = `${PIP_PATH} install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu`;
                await runCommand(installCommand, dispatcher);
                success = true;
                break;
            } catch (error: any) {
                lastError = error;
            }
        } else {
            try {
                const gpuType = await getGPUType()

                dispatcher({
                    message: "GPU Type: " + gpuType + ", pip: " +  PIP_PATH
                })
                // AMD GPU
                if (gpuType === 'amd') {
                    const rocmVersion = nightly ? 'rocm5.7' : 'rocm5.6';
                    const installCommand = nightly
                        ? `${PIP_PATH} install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/${rocmVersion}`
                        : ` ${PIP_PATH} install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/${rocmVersion}`;

                    await runCommand(installCommand, dispatcher);
                    success = true;
                    break;
                }
                // NVIDIA GPU
                else if (gpuType === 'nvidia') {
                    const installCommand = `${PIP_PATH} install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121`;

                    await runCommand(installCommand, dispatcher);
                    success = true;
                    break;
                } else {
                    lastError = new Error(`Unkown GPU Type`)
                }

            } catch (error: any) {
                lastError = error;
            }
        }
    }

    if (!success) {
        throw new Error(`PyTorch installation failed: ${lastError.message}`)
    }

    dispatcher({
        message: "Installing PyTorch Finish"
    });

    return true;
}

export async function cloneComfyUI(dispatch: TaskEventDispatcher): Promise<boolean> {
    let success = false;
    let lastError = null;
    const { PIP_PATH, PYTHON_PATH } = getCondaPaths();

    for (let i = 0; i < 3; i++) {
        try {
            const repoPath = getComfyUIDir();
            const parentDir = path.dirname(repoPath);
            await fsExtra.ensureDir(parentDir);

            if (!await checkIfInstalledComfyUI()) {
                dispatch({
                    message: 'Start cloning ComfyUI...'
                });
                await runCommand(`git clone https://github.com/comfyanonymous/ComfyUI`, dispatch, {
                    cwd: parentDir
                });
            }

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

            success = true;
            break;
        } catch (error: any) {
            lastError = error;
        }
    }
    if (!success) {
        throw new Error(`clone comfyui error: ${lastError.message}`);
    }
    return true;
}

import * as nodePty from "node-pty"
import { SlotEvent } from "@comflowy/common/utils/slot-event";
import logger from "../utils/logger";
import { comfyExtensionManager } from "../comfy-extension-manager/comfy-extension-manager";
let comfyuiProcess: nodePty.IPty | null;
export type ComfyUIProgressEventType = {
    type: "START" | "RESTART" | "STOP" | "INFO" | "WARNING" | "ERROR" | "WARNING" | "TIMEOUT",
    message: string | undefined
}
export const comfyUIProgressEvent = new SlotEvent<ComfyUIProgressEventType>();
export async function startComfyUI(dispatcher: TaskEventDispatcher, pip: boolean = false): Promise<boolean> {
    const { PIP_PATH, PYTHON_PATH } = getCondaPaths();

    const {systemProxy, systemProxyString} = await getSystemProxy();
    if (comfyuiProcess) {
        return true;
    }
    try {
        logger.info("start comfyUI");
        comfyUIProgressEvent.emit({
            type: "INFO",
            message: systemProxy.http_proxy ?  "Start ComfyUI With Proxy: " + systemProxyString : "Start ComfyUI Without Proxy"
        })
        const repoPath = getComfyUIDir();
        await new Promise((resolve, reject) => {
            const command = pip ? `${PIP_PATH} install -r requirements.txt ; ${PYTHON_PATH} main.py --enable-cors-header \r` : `${PYTHON_PATH} main.py --enable-cors-header \r`;
            let success = false;
            runCommandWithPty(command, (event => {
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
                    success = true;
                    resolve(null);
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

            setTimeout(() => {
                if (!success) {
                    comfyUIProgressEvent.emit({
                        type: "TIMEOUT",
                        message: "ComfyUI start timeout"
                    });
                    reject(new Error("ComfyUI start timeout"));
                }
            }, 60 * 1000);

        });

        // check comfyUI extensions
        const extensions = await comfyExtensionManager.getAllExtensions();
        const installedExtensions = extensions.filter((extension) => extension.installed);
        const msg = "All installed extensions: " + installedExtensions.map(ext => ext.title).join(",")
        logger.info(msg)
        comfyUIProgressEvent.emit({
            type: "INFO",
            message: msg
        })
    } catch (err: any) {
        const errMsg = `Start ComfyUI error: ${err.message}, ${err.stack}`
        comfyUIProgressEvent.emit({
            type: "ERROR",
            message: errMsg
        });
        logger.error(errMsg);
    }
    return true;
}

export async function stopComfyUI(): Promise<boolean> {
    try {
        if (comfyuiProcess) {
            console.log("before kill")
            comfyuiProcess.clear();
            comfyuiProcess.kill(); // 停止当前运行的 ComfyUI
            console.log("after kill")
            comfyuiProcess = null;
        }
        comfyUIProgressEvent.emit({
            type: "STOP",
            message: "STOP COMFYUI SUCCESS"
        });
    } catch (error: any) {
        const msg = `Error stopping comfyui: ${error.message}, ${error.stack}`
        logger.error(msg);
    }
    return true;
}

export async function isComfyUIAlive(): Promise<boolean> {
    try {
        await fetch("http://127.0.0.1:8188");
        return true;
    } catch (err: any) {
        logger.error('Error checking process:' + err.message + ":" + err.stack);
        return false;
    }
}

export async function restartComfyUI(dispatcher?: TaskEventDispatcher, pip=false): Promise<boolean>  {
    try {
        comfyUIProgressEvent.emit({
            type: "RESTART",
            message: "Restart ComfyUI"
        });
        await stopComfyUI(); // 停止当前运行的 ComfyUI
        await startComfyUI(dispatcher ? dispatcher : (event) => null, pip); // 启动新的 ComfyUI
        comfyUIProgressEvent.emit({
            type: "RESTART",
            message: "Restart ComfyUI Success"
        })
    } catch (err: any) {
        throw new Error(`Error restarting comfyui: ${err.message}`);
    }
    return true;
}

export async function updateComfyUI(dispatcher: TaskEventDispatcher): Promise<boolean> {
    try {
        comfyUIProgressEvent.emit({
            type: "RESTART",
            message: "Try Update ComfyUI"
        });
        const repoPath = getComfyUIDir();
        await runCommand(`git pull`, (event => {
            dispatcher(event);
            const cevent: ComfyUIProgressEventType = {
                type: "INFO",
                message: event.message
            };
            comfyUIProgressEvent.emit(cevent);
        }), {
            cwd: repoPath
        });
        await restartComfyUI(dispatcher, true);
        logger.info("updateComfyUI: stopped");
    } catch (err: any) {
        logger.info(err);
        throw new Error(`Error restarting comfyui: ${err.message}`);
    }
    return true;
}