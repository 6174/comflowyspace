import fastq from "fastq";
import type { queue as Queue, done as Done} from "fastq";

import { SlotEvent } from "@comflowy/common/utils/slot-event";
export type TaskEventDispatcher = (event: Pick<TaskEvent, "message" | "data" | "progress" | "error">) => void;
export type TaskExecutor = (dispatcher: TaskEventDispatcher, params: any) => Promise<any>
export type TaskProps = {
    taskId: string,
    name: string,
    params?: any,
    executor: TaskExecutor,
    [key: string]: any
}

export type TaskEvent = {
    type: "RESULT" | "PROGRESS",
    task: TaskProps,
    progress?: number,
    message?: string,
    data?: any,
    error?: any
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
        console.log("start process job", job);
        const { executor, params } = job;
        try {
            const result = await executor((event) => {
                if (event.message) {
                    console.log("PROGRESS: ", event.message);
                }
                this.#dispatchTaskProgressEvent({
                    type: "PROGRESS",
                    task: job,
                    data: event.data,
                    progress: event.progress,
                    error: event.error,
                    message: event.message
                });
            }, params);
            this.#dispatchTaskProgressEvent({
                type: "RESULT",
                task: job,
                data: result
            });
            done(result);
        } catch (error: any) {
            console.error(`Job failed: ${error}`);
            this.#dispatchTaskProgressEvent({
                type: "RESULT",
                task: job,
                error: error.message
            });
            done(null);
        }
    }

    addTask(task: TaskProps) {
        this.taskQueue.push(task);
    }
}

export const taskQueue = new TaskQueue();