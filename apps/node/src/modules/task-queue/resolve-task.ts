import { TaskEvent, TaskEventDispatcher, TaskExecutor, TaskProps } from "./task-queue";

export const TASK_MAP: Record<string, TaskExecutor> = {
    "download_url": downloadURLTask
}

const EMPTY_TASK =  (dispatchEvent: TaskEventDispatcher) => {
    console.log("empty task");
};

export function resolveTask(taskProps: TaskProps) {
    taskProps.executor = TASK_MAP[taskProps.name] || EMPTY_TASK;
}


export async function downloadURLTask(dispatch: TaskEventDispatcher, params: any) {
    console.log("download url task", params);
}