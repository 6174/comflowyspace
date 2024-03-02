import * as os from "os";
import * as path from "path";
import { getSystemProxy, isMac, isWindows } from "../utils/env"
import { downloadUrl } from "../utils/download-url";
import { getAppDataDir, getAppTmpDir, getComfyUIDir, getStableDiffusionDir } from "../utils/get-appdata-dir";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { getMacArchitecture } from "../utils/get-mac-arch";
import { runCommand } from "../utils/run-command";
import { CONDA_ENV_NAME, CONFIG_KEYS, appConfigManager } from "../config-manager";
import { getGPUType } from "../utils/get-gpu-type";
import { verifyIsTorchInstalled } from "./verify-torch";
import * as fsExtra from "fs-extra" 
import { createOrUpdateExtraConfigFileFromStableDiffusion } from "../model-manager/model-paths";
import logger from "../utils/logger";
import { comfyuiService } from "./comfyui.service";
import { conda } from "../utils/conda";

const systemType = os.type();
const appTmpDir = getAppTmpDir();
const appDir = getAppDataDir();

export async function checkBasicRequirements() {
    let isSetupedConfig = await checkIsSetupedConfig();
    let isCondaInstalled = false, 
        isPythonInstalled = false, 
        isTorchInstalled = false,
        isComfyUIInstalled = false,
        isComfyUIStarted = false,
        isGitInstalled = false;
    if (isSetupedConfig) {
        isComfyUIInstalled = await checkIfInstalledComfyUI();
        /**
         * if user delete ComfyUI, user should re-setup the config
         */
        if (!isComfyUIInstalled) {
            appConfigManager.delete(CONFIG_KEYS.appSetupConfig);
            isSetupedConfig = false;
        }
        isComfyUIStarted = await comfyuiService.isComfyUIAlive();
    }
    isCondaInstalled = await checkIfInstalled("conda");
    isPythonInstalled = !!conda.env?.PYTHON_PATH;
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
    const { PIP_PATH, PYTHON_PATH } = conda.getCondaPaths();

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
            conda.updateCondaInfo();
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
    const { PIP_PATH, PYTHON_PATH } = conda.getCondaPaths();

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
    const { PIP_PATH, PYTHON_PATH } = conda.getCondaPaths();

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
                    const installCommand = `${PIP_PATH} install torch torchvision torchaudio`;
                    await runCommand(installCommand, dispatcher);
                    success = true;
                    break;
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


/**
 * For debug purpose
 * @param nightly 
 * @returns 
 */
export async function getInstallPyTorchForGPUCommand(nightly: boolean = false): Promise<string> {
    let installCommand = "";
    const { PIP_PATH } = conda.getCondaPaths();
    if (isMac) {
        installCommand = `${PIP_PATH} install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu`;
    } else {
        try {
            const gpuType = await getGPUType()
            // AMD GPU
            if (gpuType === 'amd') {
                const rocmVersion = nightly ? 'rocm5.7' : 'rocm5.6';
                installCommand = nightly
                    ? `${PIP_PATH} install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/${rocmVersion}`
                    : ` ${PIP_PATH} install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/${rocmVersion}`;
            }
            // NVIDIA GPU
            else if (gpuType === 'nvidia') {
                installCommand = `${PIP_PATH} install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121`;
            } else {
                installCommand = `${PIP_PATH} install torch torchvision torchaudio`;
            }

        } catch (error: any) {
            return ""
        }
    }
    return installCommand;
}

export async function cloneComfyUI(dispatch: TaskEventDispatcher): Promise<boolean> {
    let success = false;
    let lastError = null;
    const { PIP_PATH, PYTHON_PATH } = conda.getCondaPaths();

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