import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";

export function InstallComfyUI() {
  return (
    <div className="InstallComfyUI">
      <BootstrapTask type={BootStrapTaskType.installComfyUI}/>
    </div>
  )
}