import { Request, Response } from 'express';
import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { installExtension } from '../../modules/comfy-extension-manager/install-extension';
import { installPythonTask } from '../../modules/comfyui/bootstrap';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiRouteInstallExtension(req: Request, res: Response) {
    try {
        const {data} = req.body;
        console.log("start install extension");
        const taskParams = data as TaskProps; 
        const task: TaskProps = {
            taskId: taskParams.taskId,
            name: taskParams.name,
            params: taskParams.params,
            executor: async (dispatcher) => {
                // return  await installExtension(dispatcher, taskParams.params);
                return await installPythonTask(dispatcher);
            }
        };
        res.send({
            success: true,
            data: {
                taskId: task.taskId
            }
        });
        taskQueue.addTask(task);
    } catch (err: any) {
        console.log("error", err);
        res.send({
            success: false,
            error: err.message
        })
    }
    
}