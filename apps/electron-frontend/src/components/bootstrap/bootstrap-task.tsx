import { track, trackNewUserBootstrapSuccess } from "@/lib/tracker";
import { useRemoteTask } from "@/lib/utils/use-remote-task";
import { getBackendUrl } from "@comflowy/common/config";
import { BootStrapTaskType, useDashboardState } from "@comflowy/common/store/dashboard-state";
import { message } from "antd";
import { useCallback, useEffect } from "react";
import { LogViewer } from "ui/log-viewer/log-viewer";
export type BootstrapTaskProps = {
  type: BootStrapTaskType,
}
import * as Sentry from "@sentry/nextjs";

export function BootstrapTask(props: BootstrapTaskProps) {
  // const [messageApi, contextHolder] = message.useMessage();
  const { bootstrapTasks, setBootstrapTasks } = useDashboardState();
  const task = bootstrapTasks.find(task => task.type === props.type);
  const { startTask, error, success, running, messages } = useRemoteTask({
    api: getBackendUrl(`/api/add_bootstrap_task`),
    onMessage: (msg) => {
      if (msg.type === "SUCCESS") {
        if (task) {
          console.log("task success", task);
          message.success(task.title + " success");
          task.finished = true;
          setBootstrapTasks([...bootstrapTasks]);
          track(`bootstrap-task-${task.title}-success`);
          if (task.type === BootStrapTaskType.startComfyUI) {
            trackNewUserBootstrapSuccess()
          }
        }
      }

      if (msg.type === "FAILED") {
        message.error("Task failed: " + msg.error);
        track(`bootstrap-task-${task.title}-failed`, {
          error: msg.error,
          messages: msg.error
        });
        const error = new Error(`
                Title: task.title failed.
                Logs: ${msg.error}
            `);
        Sentry.captureException(error);
      }

      if (msg.type === "TIMEOUT" && task.type === BootStrapTaskType.startComfyUI) {
        message.error("Start ComfyUI timeout, check the comfyui process manager to find out what happened");
        task.finished = true;
        setBootstrapTasks([...bootstrapTasks]);
        track(`bootstrap-task-${task.title}-timeout`);
      }
    }
  });

  const startTaskAction = useCallback(() => {
    startTask({
      name: props.type
    });
  }, []);

  useEffect(() => {
    startTaskAction();
    track(`bootstrap-task-${props.type}-start`)
  }, [])

  return (
    <div className={props.type}>
      {/* {contextHolder} */}
      <div className="actions">
        {(success && task) ?
          (
            <div>{task?.title} success</div>
          ) : (
            null
          )
        }
      </div>
      <LogViewer messages={messages} oneline />
    </div>
  )
}