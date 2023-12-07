import { uuid } from '@comflowy/common';
import { Extension } from '../../modules/comfy-extension-manager/comfy-extension-manager';
import { Request, Response } from 'express';
import { TaskProps, taskQueue } from 'src/modules/task-queue/task-queue';
import { installExtension } from '../../modules/comfy-extension-manager/install-extension';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiRouteInstallExtension(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const extension = data as Extension;
        const task: TaskProps = {
            taskId: uuid(),
            name: `download-extension-${extension.title}`,
            params: extension,
            executor: async (dispatcher) => {
               await installExtension(dispatcher, extension);
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