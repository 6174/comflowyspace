import Queue from "bull";
import {SlotEvent} from "@comflowy/common/utils/slot-event";
export type TaskEventDispatcher = (event: Pick<TaskEvent, "message" | "data" | "progress">) => void;
export type TaskExecutor = (dispatcher: TaskEventDispatcher, params: any) => Promise<any>
export type TaskProps = {
    taskId: string,
    name: string,
    params?: any,
    executor: TaskExecutor,
    [key: string]: any
}

export type TaskProgressEvent = {
    type: "PROGRESS",
    task: TaskProps,
    progress?: number,
    message?: string,
    data?: any
}

export type TaskResultEvent = {
    type: "RESULT",
    task: TaskProps,
    progress?: number,
    message?: string,
    data?: any
}

export type TaskEvent = TaskProgressEvent | TaskResultEvent;

/**
 * TaskQueue
 */
class TaskQueue {
    taskQueue: Queue.Queue<TaskProps>;
    progressEvent = new SlotEvent<TaskEvent>();
    constructor() {
        // polyfill

        // @ts-ignore
        const crypto = require("crypto"); 
        // @ts-ignore
        global.crypto1 = crypto;
        // @ts-ignore
        console.log(crypto1.getRandomValues);

        // // @ts-ignore
        // if (typeof crypto.getRandomValues !== 'function') {
        //     // @ts-ignore
        //     crypto.getRandomValues = () => {
        //         // @ts-ignore
        //         return crypto.randomBytes(16).toString('hex')
        //     }
        // }

        this.taskQueue = new Queue<TaskProps>("TaskQueue", {
            limiter: {
                max: 5,
                duration: 1000 * 60 * 60 * 10
            },
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true
            }
        });
        this.taskQueue.process(this.processJob);
    }

    #dispatchTaskProgressEvent = (event: TaskEvent) => {
        this.progressEvent.emit(event);
    }

    private async processJob(job: Queue.Job<TaskProps>) {
        const { executor, params } = job.data;
        try {
          const result = await executor((event) => {
            if (event.progress) {
                job.progress(event.progress);
            }
            this.#dispatchTaskProgressEvent({
                type: "PROGRESS",
                task: job.data,
                data: event.data,
                progress: event.progress,
                message: event.message
            });
          }, params);
          job.progress(100);
          this.#dispatchTaskProgressEvent({
            type: "RESULT",
            task: job.data,
            data: result,
          });
          return result;
        } catch (error) {
          console.error(`Job failed: ${error}`);
          throw error;
        }
    }

    addTask(task: TaskProps) {
        this.taskQueue.add(task);
    }
}

export const taskQueue = new TaskQueue();