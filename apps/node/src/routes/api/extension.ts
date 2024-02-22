import { Request, Response } from 'express';
import { PartialTaskEvent, TaskEvent, TaskEventDispatcher, TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { installExtension } from '../../modules/comfy-extension-manager/install-extension';
import { comfyExtensionManager } from '../../modules/comfy-extension-manager/comfy-extension-manager';
import { Extension } from '../../modules/comfy-extension-manager/types';
import { comfyUIProgressEvent, installCondaPackageTask, installPipPackageTask, restartComfyUI, stopComfyUI } from '../../modules/comfyui/bootstrap';
import logger from '../../modules/utils/logger';
import { checkAExtensionInstalled } from '../../modules/comfy-extension-manager/check-extension-status';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiRouteInstallExtension(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const taskParams = data as TaskProps; 
        const task: TaskProps = {
            taskId: taskParams.taskId,
            name: taskParams.name,
            params: taskParams.params,
            executor: async (dispatcher: TaskEventDispatcher) => {
                const newDispatcher = (event: PartialTaskEvent) => {
                    dispatcher(event);
                    comfyUIProgressEvent.emit({
                        type: event.type == "FAILED" ? "ERROR" : "INFO",
                        message: event.message || ""
                    })
                }
                const extension = taskParams.params as Extension;
                await checkAExtensionInstalled(extension)
                if (extension.installed) {
                    newDispatcher({
                        message: "Extension already installed"
                    });
                    return true;
                }
                await installExtension(newDispatcher, taskParams.params);
                await restartComfyUI(dispatcher);
                return true;
            }
        };
        taskQueue.addTask(task);
        res.send({
            success: true,
            data: {
                taskId: task.taskId
            }
        });
    } catch (err: any) {
        logger.error("error", err);
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
export async function ApiRouteGetExtensions(req: Request, res: Response) {
    try {
        logger.info("start route get extensions info");
        const update_check = req.query.update_check;
        const extensions = await comfyExtensionManager.getAllExtensions(!!update_check);
        const extensionNodeMap = await comfyExtensionManager.getExtensionNodeMap();
        res.send({
            success: true,
            data: {
                extensions,
                extensionNodeMap,
                // extensionNodeList
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

export async function ApiRouteGetFrontendExtensions(req: Request, res: Response) {
    try {
        const extensions = await comfyExtensionManager.getFrontendExtensions();
        res.send({
            success: true,
            data: extensions
        });
    } catch(err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        })
    }
}

export async function ApiRouteDisableExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        logger.info("extensions", extensions);
        await comfyExtensionManager.disableExtensions(extensions);
        await restartComfyUI();
        res.send({
            success: true
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({ 
            success: false,
            error: err.message
        })
    } 
}

export async function ApiRouteEnableExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        await comfyExtensionManager.enableExtensions(extensions);
        await restartComfyUI();
        res.send({
            success: true
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({ 
            success: false,
            error: err.message
        })
    } 
}

export async function ApiRouteRemoveExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        await stopComfyUI();
        await comfyExtensionManager.removeExtensions(extensions);
        await restartComfyUI();
        res.send({
            success: true
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({ 
            success: false,
            error: err.message
        })
    } 
}

export async function ApiRouteUpdateExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        await comfyExtensionManager.updateExtensions(extensions);
        await restartComfyUI();
        res.send({
            success: true
        });
    } catch (err: any) {
        logger.error(err.message + ":" + err.stack);
        res.send({
            success: false,
            error: err.message
        })
    }
}

export async function ApiInstallPipPackages(req: Request, res: Response) {
    try {
        const {packages} = req.body;
        console.log("install", packages);
        if (packages) {
            const dispatcher = (event: PartialTaskEvent) => {
                comfyUIProgressEvent.emit({
                    type: event.type == "FAILED" ? "ERROR" : "INFO",
                    message: event.message || ""
                })
            }
            await installPipPackageTask(dispatcher, {
                packageRequirment: packages
            });
            await restartComfyUI();
            res.send({
                success: true,
            });
        } else {
            throw new Error("packages is required");
        }
    } catch (err: any) {
        logger.error("error", err);
        res.send({
            success: false,
            error: err.message
        })
    }
}