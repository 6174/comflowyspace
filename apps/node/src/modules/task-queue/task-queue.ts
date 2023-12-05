import Queue from "bull";
import {SlotEvent} from "@comflowy/common/utils/slot-event";
export type TaskProps = {
    taskId: string,
    name: string,
    executor: (dispatcher: (event: TaskEvent) => void) => Promise<any>,
}

export type TaskProgressEvent = {
    type: "PROGRESS",
    taskId: string,
    name: string,
    progress: number,
    message: string
}

export type TaskResultEvent = {
    type: "RESULT",
    taskId: string,
    name: string,
    result: any
}

export type TaskEvent = TaskProgressEvent | TaskResultEvent;

/**
 * TaskQueue
 */
class TaskQueue {
    taskQueue: Queue.Queue<TaskProps>;
    progressEvent = new SlotEvent<TaskEvent>();
    constructor() {
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
        const { executor, taskId, name } = job.data;
        try {
          const result = await executor(this.#dispatchTaskProgressEvent);
          job.progress(100);
          this.#dispatchTaskProgressEvent({
            type: "RESULT",
            taskId,
            name,
            result
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