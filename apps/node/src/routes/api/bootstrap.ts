import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { checkIfInstalled, installPyTorchForGPU, checkIfInstalledComfyUI, cloneComfyUI, installCondaPackageTask, installCondaTask, installPythonTask, isComfyUIAlive, startComfyUI } from '../../modules/comfyui/bootstrap';
import { Request, Response } from 'express';

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
                return true;
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