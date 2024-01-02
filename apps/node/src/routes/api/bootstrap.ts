import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { checkIfInstalled, installPyTorchForGPU, checkIfInstalledComfyUI, cloneComfyUI, installCondaPackageTask, installCondaTask, installPythonTask, isComfyUIAlive, startComfyUI } from '../../modules/comfyui/bootstrap';
import { CONFIG_KEYS, appConfigManager } from '../../modules/config-manager';
import { checkBasicRequirements } from '../../modules/comfyui/bootstrap';
import { Request, Response } from 'express';
import path from 'path';


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
    } catch (err) {
        res.send({
            success: false,
            error: err
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
    "startComfyUI" = "startComfyUI"
}

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiBootstrap(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const taskType = data.name as BootStrapTaskType;
        const taskId = data.taskId;
        const task: TaskProps = {
            taskId,
            name: taskType,
            executor: async (dispatcher): Promise<boolean> => {
                switch (taskType) {
                    case BootStrapTaskType.installConda:
                        const isCondaInstalled = await checkIfInstalled("conda");
                        if (isCondaInstalled) {
                            return true;
                        }
                        return await installCondaTask(dispatcher);
                    case BootStrapTaskType.installPython:
                        const isPythonInstalled = await checkIfInstalled("python");
                        if (isPythonInstalled) {
                            return true;
                        }
                        return await installPythonTask(dispatcher);
                    case BootStrapTaskType.installTorch:
                        return await installPyTorchForGPU(dispatcher);
                    case BootStrapTaskType.installGit:
                        const isGitInstall = await checkIfInstalled("git --version");
                        if (isGitInstall) {
                            return true;
                        }
                        return await installCondaPackageTask(dispatcher, {
                            packageRequirment: "git"
                        });
                    case BootStrapTaskType.installComfyUI:
                        const isComfyUIInstalled = await checkIfInstalledComfyUI();
                        if (isComfyUIInstalled) {
                            return true;
                        }
                        return await cloneComfyUI(dispatcher);
                    case BootStrapTaskType.startComfyUI:
                        const isComfyUIStarted = await isComfyUIAlive();
                        if (isComfyUIStarted) {
                            return true;
                        }
                        return await startComfyUI(dispatcher)
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
    } catch (err) {
        res.send({
            success: false,
            error: err
        })
    } 
}

import { DEFAULT_COMFYUI_PATH, getComfyUIDir } from '../../modules/utils/get-appdata-dir';
import * as fsExtra from "fs-extra";
import { createOrUpdateExtraConfigFileFromStableDiffusion } from '../../modules/model-manager/model-paths';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiSetupConfig(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const comfyUIPath = data.comfyUIDir.trim();
        if (!comfyUIPath) {
            throw new Error("ComfyUI path is empty");
        }

        let isComfyUIInstalled = await checkIfInstalledComfyUI(comfyUIPath);
        console.log("isComfy isntall", isComfyUIInstalled, comfyUIPath, DEFAULT_COMFYUI_PATH);
        if (comfyUIPath !== DEFAULT_COMFYUI_PATH && !isComfyUIInstalled) {
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
        res.send({
            success: false,
            error: err.message
        });
    }
}