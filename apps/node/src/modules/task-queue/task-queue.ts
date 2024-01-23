import fastq from "fastq";
import type { queue as Queue, done as Done} from "fastq";

import { SlotEvent } from "@comflowy/common/utils/slot-event";
export type TaskEvent = {
    type?: "SUCCESS" | "PROGRESS" | "FAILED",
    task: TaskProps,
    progress?: number,
    message?: string,
    data?: any,
    error?: any
}
export type PartialTaskEvent = Pick<TaskEvent, "type" | "message" | "data" | "progress" | "error">
export type TaskEventDispatcher = (event: PartialTaskEvent) => void;
export type TaskExecutor = (dispatcher: TaskEventDispatcher, params: any) => Promise<boolean>
export type TaskProps = {
    taskId: string,
    name: string,
    params?: any,
    executor: TaskExecutor,
    [key: string]: any
}



/**
 * TaskQueue
 */
class TaskQueue {
    taskQueue: Queue<TaskProps>;
    progressEvent = new SlotEvent<TaskEvent>();
    constructor() {
        this.taskQueue = fastq(this.processJob, 5);
    }

    #dispatchTaskProgressEvent = (event: TaskEvent) => {
        this.progressEvent.emit(event);
    }

    private processJob = async (job: TaskProps, done: Done) => {
        const { executor, params } = job;
        this.#dispatchTaskProgressEvent({
            type: "PROGRESS",
            task: job,
            message: "Start task " + job.name
        });
        try {
            const result = await executor((event) => {
                this.#dispatchTaskProgressEvent({
                    type: event.type || "PROGRESS",
                    task: job,
                    data: event.data,
                    progress: event.progress,
                    error: event.error,
                    message: event.message
                });
            }, params);
            this.#dispatchTaskProgressEvent({
                type: "SUCCESS",
                task: job,
                data: result
            });
            done(null, result);
        } catch (error: any) {
            this.#dispatchTaskProgressEvent({
                type: "FAILED",
                task: job,
                error: error.message,
                message: error.message,
            });
            done(error);
        }
    }

    addTask(task: TaskProps) {
        this.taskQueue.push(task);
    }
}

export const taskQueue = new TaskQueue();