import { comfyExtensionManager } from '../../modules/comfy-extension-manager/comfy-extension-manager';
import { Request, Response } from 'express';

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
    } catch (err) {
        res.send({ 
            success: false,
            error: err
        })
    } 
}