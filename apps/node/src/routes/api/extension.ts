import { Request, Response } from 'express';
import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { installExtension } from '../../modules/comfy-extension-manager/install-extension';
import { comfyExtensionManager } from '../../modules/comfy-extension-manager/comfy-extension-manager';
import { Extension } from '../../modules/comfy-extension-manager/types';

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
            executor: async (dispatcher) => {
                return  await installExtension(dispatcher, taskParams.params);
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
        console.log("error", err);
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
        console.log("start route get extensions info");
        const extensions = await comfyExtensionManager.getAllExtensions();
        const extensionNodeMap = await comfyExtensionManager.getExtensionNodeMap();
        const extensionNodeList = await comfyExtensionManager.getExtensionNodes()
        res.send({
            success: true,
            data: {
                extensions,
                extensionNodeMap,
                extensionNodeList
            }
        });
    } catch (err: any) {
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
        res.send({
            success: false,
            error: err.message
        })
    }
}

export async function ApiRouteDisableExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        console.log("extensions", extensions);
        await comfyExtensionManager.disableExtensions(extensions);
        res.send({
            success: true
        });
    } catch (err: any) {
        res.send({ 
            success: false,
            error: err.message
        })
    } 
}

export async function ApiRouteEnableExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        await comfyExtensionManager.disableExtensions(extensions);
        res.send({
            success: true
        });
    } catch (err: any) {
        res.send({ 
            success: false,
            error: err.message
        })
    } 
}

export async function ApiRouteRemoveExtensions(req: Request, res: Response) {
    try {
        const extensions = req.body.extensions as Extension[];
        await comfyExtensionManager.removeExtensions(extensions);
        res.send({
            success: true
        });
    } catch (err: any) {
        res.send({ 
            success: false,
            error: err.message
        })
    } 
}

export async function ApiRouteUpdateExtensions(req: Request, res: Response) {
    try {
        const { data } = req.body;
        const extensions = data as Extension[];
        await comfyExtensionManager.updateExtensions(extensions);
        res.send({
            success: true
        });
    } catch (err: any) {
        res.send({
            success: false,
            error: err.message
        })
    }
}