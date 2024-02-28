import { track, trackNewUserBootstrapSuccess } from "@/lib/tracker";
import { useRemoteTask } from "@/lib/utils/use-remote-task";
import { getBackendUrl } from "@comflowy/common/config";
import {remoteLog} from "@comflowy/common/utils/remote-log";
import { BootStrapTaskType, useDashboardState } from "@comflowy/common/store/dashboard-state";
import { message } from "antd";
import { useCallback, useEffect } from "react";
export type BootstrapTaskProps = {
  type: BootStrapTaskType,
}
import * as Sentry from "@sentry/nextjs";

export function BootstrapTask(props: BootstrapTaskProps) {
  const { bootstrapTasks, setBootstrapTasks } = useDashboardState();
  const addBootstrapMessages = useDashboardState(state => state.addBootstrapMessage);
  const task = bootstrapTasks.find(task => task.type === props.type);
  const addBootstrapError = useDashboardState(state => state.addBootstrapError);
  const bootstrapMessages = useDashboardState(state => state.bootstrapMessages);
  const { startTask, error, success, running, messages } = useRemoteTask({
    api: getBackendUrl(`/api/add_bootstrap_task`),
    onMessage: (msg) => {
      if (msg.message) {
        addBootstrapMessages(msg.message);
      }

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

      if (msg.type === "FAILED" || msg.type === "ERROR" || msg.type === "TIMEOUT") {
        console.log("failed", msg);
        message.error(`Task ${msg.type.toLowerCase()}: ${msg.error || msg.message}`);
        const errorTypeName = `bootstrap-task-${task.title}-failed`
        addBootstrapError({
          title: `${task.title} failed`,
          type: errorTypeName,
          message: msg.error || msg.message,
          createdAt: +new Date(),
          data: {
            task,
            msg
          }
        });
        track(errorTypeName, {
          error: msg.error,
          messages: msg.error
        });
        remoteLog({
          type: errorTypeName,
          message: bootstrapMessages.join("\n")
        });
        const error = new Error(`
          Title: task.title failed.
          Logs: ${msg.error}
        `);
        Sentry.captureException(error);
      }

      if (msg.type === "TIMEOUT" && task.type === BootStrapTaskType.startComfyUI) {
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
    </div>
  )
}