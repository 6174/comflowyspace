import { uuid } from '@comflowy/common';
import { TaskProps, taskQueue } from '../../modules/task-queue/task-queue';
import { Request, Response } from 'express';

/**
 * fetch all extensions
 * @param req 
 * @param res 
 */
export async function ApiRouteAddTask(req: Request, res: Response) {
    try {
        const {data} = req.body;
        const taskProps = data as TaskProps;
        const taskId = uuid();
        taskQueue.addTask({
            ...taskProps,
            taskId
        })
        res.send({
            success: true,
            message: "Successful add task to queue",
            data: {
                taskId: taskProps.taskId,
            }
        });
    } catch (err) {
        res.send({
            success: false,
            error: err
        })
    }
}