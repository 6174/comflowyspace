import { useRemoteTask } from "@/lib/utils/use-remote-task";
import { getBackendUrl } from "@comflowy/common/config";
import { BootStrapTaskType, useDashboardState } from "@comflowy/common/store/dashboard-state";
import { Button, message } from "antd";
import { useCallback, useEffect } from "react";
import {LogViewer} from "ui/log-viewer/log-viewer";

export type BootstrapTaskProps = {
  type: BootStrapTaskType,
}

export function BootstrapTask(props: BootstrapTaskProps) {
  const {loading, bootstrapTasks, setBootstrapTasks} = useDashboardState();
  const task = bootstrapTasks.find(task => task.type === props.type);
  const {startTask, error, success, running, messages} = useRemoteTask({
      api: getBackendUrl(`/api/add_bootstrap_task`),
      onMessage: (msg) => {
        console.log(msg);
        if (msg.type === "SUCCESS") {
          message.success("Extension installed successfully");
          if (task) {
            task.finished = true;
            setBootstrapTasks([...bootstrapTasks]);
          }
        }
        if (msg.type === "FAILED") {
          message.error("Task failed: " + msg.error);
        }
      }
  });
  
  const startTaskAction = useCallback(() => {
    startTask({
      name: props.type 
    });
  }, []);

  return (
    <div className={props.type}>
      <div className="description">
        {task.description}
      </div>
      <div className="actions">
        {success ? 
          (
            <div>{task.title} success</div>
          ) : (
            <Button loading={running} onClick={ev => {
              startTaskAction();
            }}>{task.title}</Button>
          )
        }
      </div>
      <LogViewer messages={messages}/>
    </div>
  )
}