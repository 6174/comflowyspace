import { modelManager } from '../../modules/model-manager/model-manager';
import { uuid } from '@comflowy/common';
import { Request, Response } from 'express';
import { installModel } from '../../modules/model-manager/install-model';
import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { MarketModel } from '../../modules/model-manager/types';
import { getFolderNamesAndPaths, getModelDir } from '../../modules/model-manager/model-paths';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiRouteGetModels(req: Request, res: Response) {
    try {
        const installedModels = await modelManager.getAllInstalledModels();
        const marketModels = await modelManager.getAllUninstalledModels();
        const paths = getFolderNamesAndPaths();
        res.send({
            success: true,
            data: {
                installedModels,
                marketModels,
                modelPath: paths.MODELS_DIR,
                paths
            }
        });
    } catch (err) {
        res.send({
            success: false,
            error: err
        })
    }
    
}


/**
 * install a model
 * @param req 
 * @param res 
 */
export async function ApiRouteInstallModel(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const model = data as MarketModel;
        const task: TaskProps = {
            taskId: uuid(),
            name: `download-model-${model.name}`,
            params: model,
            executor: async (dispatcher) => {
               return await installModel(dispatcher, model);
            }
        };
        taskQueue.addTask(task);
        res.send({
            success: true,
            data: {
                taskId: task.taskId,
                taskName: task.name,
            }
        });
    } catch (err) {
        res.send({
            success: false,
            error: err
        })
    }
    
}