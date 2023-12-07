import { uuid } from '@comflowy/common';
import { Request, Response } from 'express';
import { installModel } from '../../modules/model-manager/install-model';
import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { MarketModel } from 'src/modules/model-manager/model-manager';

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
               await installModel(dispatcher, model);
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