import { modelManager } from '../../modules/model-manager/model-manager';
import { Request, Response } from 'express';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiRouteGetModels(req: Request, res: Response) {
    try {
        const installedModels = await modelManager.getAllInstalledModels();
        const marketModels = await modelManager.getAllUninstalledModels();
        res.send({
            success: true,
            data: {
                installedModels,
                marketModels
            }
        });
    } catch (err) {
        res.send({
            success: false,
            error: err
        })
    }
    
}