import { checkBasicRequirements } from '../../modules/comfyui/bootstrap';
import { Request, Response } from 'express';

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