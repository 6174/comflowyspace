import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";

export function StartComfyUI() {
  return (
    <div className="StartComfyUI">
      <BootstrapTask type={BootStrapTaskType.startComfyUI}/>
    </div>
  )
}