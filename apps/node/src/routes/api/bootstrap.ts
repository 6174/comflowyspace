import { PartialTaskEvent, TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { checkIfInstalled, installPyTorchForGPU, checkIfInstalledComfyUI, cloneComfyUI, installCondaPackageTask, installCondaTask, installPythonTask, getInstallPyTorchForGPUCommand} from '../../modules/comfyui/bootstrap';
import { CONFIG_KEYS, appConfigManager } from '../../modules/config-manager';
import { checkBasicRequirements } from '../../modules/comfyui/bootstrap';
import { Request, Response } from 'express';
import path from 'path';
import { DEFAULT_COMFYUI_PATH, getComfyUIDir } from '../../modules/utils/get-appdata-dir';
import * as fsExtra from "fs-extra";
import { createOrUpdateExtraConfigFileFromStableDiffusion } from '../../modules/model-manager/model-paths';
import logger from '../../modules/utils/logger';
import { comfyuiService } from '../../modules/comfyui/comfyui.service';
import { verifyIsTorchInstalled } from 'src/modules/comfyui/verify-torch';
import { runCommand } from '../../modules/utils/run-command';
import { systemProxyString } from '../../modules/utils/env';
import { conda } from '../../modules/utils/conda';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiEnvCheck(req: Request, res: Response) {
    try {
        const requirements = await checkBasicRequirements()
        res.send({
            success: true,
            data: requirements
        });
    } catch (err: any) {
        res.send({
            success: false,
            error: err.message + err.stack
        })
    } 
}

/**
 * get conda info
 * @param req 
 * @param res 
 */
export async function ApiGetCondaInfo(req: Request, res: Response) {
    const CONDA_ENV_PATH = conda.env?.CONDA_ENV_PATH
    try {
        const condaInfo = await runCommand("conda info");
        const packageInfo = await runCommand(`conda list -p ${CONDA_ENV_PATH}`);
        res.send({
            success: true,
            condaInfo: condaInfo.stderr + condaInfo.stdout + systemProxyString,
            packageInfo: packageInfo.stderr + packageInfo.stdout
        });
    } catch (err: any) {
        res.send({
            success: true,
            condaInfo: CONDA_ENV_PATH + "===" + systemProxyString,
            packageInfo: err.message + err.stack
        })
    }
}


export enum BootStrapTaskType {
    "installConda" = "installConda",
    "installPython" = "installPython",
    "installGit" = "installGit",
    "installTorch" = "installTorch",
    "installComfyUI" = "installComfyUI",
    "installBasicModel" = "installBasicModel",
    "installBasicExtension" = "installBasicExtension",
    "startComfyUI" = "startComfyUI",
    "startComfyUIWithPrecision" = "startComfyUIWithPrecision",
}

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiBootstrap(req: Request, res: Response) {
    try {
        const taskType = req.body.data && req.body.data.name
        const taskId = req.body.data && req.body.data.taskId;
        const task: TaskProps = {
            taskId,
            name: taskType,
            executor: async (dispatcher): Promise<boolean> => {
                const newDispatcher = (event: PartialTaskEvent) => {
                    dispatcher(event);
                    comfyuiService.comfyuiProgressEvent.emit({
                        type: "OUTPUT",
                        message: event.message || ""
                    })
                }
                async function withTimeout(task: Promise<any>, timeout: number, errorMessage: string): Promise<boolean> {
                    const timeoutId = setTimeout(() => {
                        newDispatcher({ type: 'TIMEOUT', message: errorMessage });
                    }, timeout);
                    const ret = await task;
                    clearTimeout(timeoutId);
                    return ret;
                }

                const msgTemplate = (type: string, solution = "") => `${type} operation timed out.${solution}  If you can't go through this issue. Please reach out to us on Discord or refer to our FAQ for assistance. We are open to offer 1v1 support.`
                let task: Promise<any>;

                switch (taskType) {
                    case BootStrapTaskType.installConda:
                        const isCondaInstalled = await checkIfInstalled("conda");
                        if (isCondaInstalled) {
                            return true;
                        }
                        return await withTimeout(installCondaTask(newDispatcher), 1000 * 60 * 20, msgTemplate("Install conda", "You can directly install conda from https://docs.anaconda.com/free/miniconda/miniconda-install/. After that, restart Comflowy."));
                    case BootStrapTaskType.installPython:
                        const isPythonInstalled = await checkIfInstalled("python");
                        if (isPythonInstalled) {
                            return true;
                        }
                        return await withTimeout(installPythonTask(newDispatcher), 1000  * 60 * 10, msgTemplate("Create python env", "You can directly create a python env from your terminal by running `conda create -n comflowy python=3.10.8`"));
                    case BootStrapTaskType.installTorch:
                        const isTorchInstalled = await verifyIsTorchInstalled();
                        if (isTorchInstalled) {
                            return true;
                        }
                        const command = await getInstallPyTorchForGPUCommand();
                        newDispatcher({ message: `Install command \`${command}\`, if it takes too long, you can directly copy this command and execute it in your termnial, after that, restart Comflowyspace.`})
                        task = installPyTorchForGPU(newDispatcher);
                        return await withTimeout(task, 1000 * 60 * 20, msgTemplate("Install torch", `You can copy the command \`${command}\` and directly execute it in your terminal. After that, restart Comflowy.`));
                    case BootStrapTaskType.installGit:
                        const isGitInstall = await checkIfInstalled("git --version");
                        if (isGitInstall) {
                            return true;
                        }
                        task = installCondaPackageTask(newDispatcher, {
                            packageRequirment: "git"
                        });
                        return await withTimeout(task, 1000 * 60 * 10, msgTemplate("Install git"));
                    case BootStrapTaskType.installComfyUI:
                        const isComfyUIInstalled = await checkIfInstalledComfyUI();
                        if (isComfyUIInstalled) {
                            return true;
                        }
                        task = cloneComfyUI(newDispatcher);
                        return await withTimeout(task, 1000 * 60 * 10, msgTemplate("Clone comfyUI"));
                    case BootStrapTaskType.startComfyUI:
                        const isComfyUIStarted = await comfyuiService.isComfyUIAlive();
                        if (isComfyUIStarted) {
                            return true;
                        }
                        const disposable = comfyuiService.comfyuiProgressEvent.on((event) => {
                            if (event.type === "OUTPUT_WARPED") {
                                dispatcher({
                                    message: event.message
                                });
                            }
                            if (event.type === "START_SUCCESS") {
                                dispatcher({
                                    type: "SUCCESS",
                                    message: event.message
                                })
                            }
                            if (event.type === "TIMEOUT") {
                                dispatcher({
                                    type: "TIMEOUT",
                                    message: event.message
                                })
                            }
                        });
                        const ret = await comfyuiService.startComfyUI();
                        disposable.dispose();
                        return ret;
                    default:
                        throw new Error("No task named " + taskType)
                }
            }
        }
        taskQueue.addTask(task);
        res.send({
            success: true,
            data: {
                taskId
            }
        });


    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        })
    } 
}


/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiSetupConfig(req: Request, res: Response) {
    try {
        const { data, installedComfyUI } = req.body;
        let comfyUIPath = data.comfyUIDir.trim();
        if (!comfyUIPath) {
            throw new Error("ComfyUI path is empty");
        }

        // User select custom install comfyUI folder, comfyUI path will add the folder path
        if (!installedComfyUI && comfyUIPath !== DEFAULT_COMFYUI_PATH) {
            comfyUIPath = path.resolve(comfyUIPath, "ComfyUI");
        }

        let isComfyUIInstalled = await checkIfInstalledComfyUI(comfyUIPath);

        // user select pre installed comfyUI but it's not installed
        if (comfyUIPath !== DEFAULT_COMFYUI_PATH && installedComfyUI && !isComfyUIInstalled) {
            logger.info("isComfy isntall", isComfyUIInstalled, comfyUIPath, DEFAULT_COMFYUI_PATH);
            throw new Error("Your custom ComfyUI path is not valid, check if  it's a git repo clone from ComfyUI https://github.com/comfyanonymous/ComfyUI");
        }

        const stableDiffusionPath = (data.stableDiffusionDir || "").trim()
        if (stableDiffusionPath !== "") {
            if (!fsExtra.existsSync(path.resolve(stableDiffusionPath, "webui.py"))) {
                throw new Error("Doesn't find webui.py in stable diffusion path, please check if it's a valid diffusion path");
            }

            if (!fsExtra.existsSync(path.resolve(stableDiffusionPath, "models"))) {
                throw new Error("Doesn't find models in stable diffusion path, please check if it's a valid diffusion path");
            }
        }

        const setupString = JSON.stringify({
            comfyUIDir: comfyUIPath,
            stableDiffusionDir: stableDiffusionPath
        });

        appConfigManager.set(CONFIG_KEYS.appSetupConfig, setupString);
        
        res.send({
            success: true,
            isComfyUIInstalled,
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        })
    } 
}

export async function ApiGetAllConfig(req: Request, res: Response) {
    try {
        const runConfig = appConfigManager.getRunConfig();
        const setupConfig = appConfigManager.getSetupConfig();
        res.send({
            success: true,
            data: {
                runConfig,
                setupConfig
            }
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        })
    }
}

export async function ApiSetRunConfig(req: Request, res: Response) {
  try {
    const configs = req.body;
    const restart = req.query.restart === "true";
    console.log("restart", req.query.restart, restart);
    let runMode = appConfigManager.getRunConfig();
    appConfigManager.set(CONFIG_KEYS.runConfig, JSON.stringify({
        ...runMode,
        ...configs
    }));

    if (restart) {
        await comfyuiService.restartComfyUI();
    }

    res.send({
        success: true,
    });
  } catch (err: any) {
    logger.error(err.message + ":" + err.stack);
    res.send({
      success: false,
      error: err.message
    })
  }
}

export async function ApiUpdateStableDiffusionConfig(req: Request, res: Response) {
    try {
        const { data } = req.body;
        const stableDiffusionPath = (data.stableDiffusionDir || "").trim();

        if (stableDiffusionPath === "") {
            throw new Error("SD WebUI path is empty")
        }

        if (stableDiffusionPath !== "") {
            if (!fsExtra.existsSync(path.resolve(stableDiffusionPath, "webui.py"))) {
                throw new Error("Can't find webui.py in stable diffusion path, please check if it's a valid diffusion path");
            }

            if (!fsExtra.existsSync(path.resolve(stableDiffusionPath, "models"))) {
                throw new Error("Can't find models in stable diffusion path, please check if it's a valid diffusion path");
            }
        }

        const comfyUIDir = getComfyUIDir();
        const setupString = JSON.stringify({
            comfyUIDir,
            stableDiffusionDir: stableDiffusionPath
        });

        appConfigManager.set(CONFIG_KEYS.appSetupConfig, setupString);
        createOrUpdateExtraConfigFileFromStableDiffusion(stableDiffusionPath)
        res.send({
            success: true,
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        });
    }
}

export async function ApiRestartComfyUI(req: Request, res: Response) {
    try {
        await comfyuiService.restartComfyUI();
        res.send({
            success: true,
        });
    } catch(err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        });
    }
}

export async function ApiUpdateComfyUIAndRestart(req: Request, res: Response) {
    try {
        await comfyuiService.updateComfyUI();
        res.send({
            success: true,
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        });
    }
}