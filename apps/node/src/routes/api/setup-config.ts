import { Request, Response } from 'express';
import { checkIfInstalledComfyUI } from 'src/modules/comfyui/bootstrap';
import { CONFIG_KEYS, appConfigManager } from 'src/modules/config-manager';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiSetupConfig(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const setupString = JSON.stringify(data);
        console.log(setupString);
        appConfigManager.set(CONFIG_KEYS.appSetupConfig, setupString);
        const isComfyUIInstalled = await checkIfInstalledComfyUI();
        res.send({
            success: true,
            isComfyUIInstalled
        });
    } catch (err) {
        res.send({
            success: false,
            error: err
        })
    }
    
}