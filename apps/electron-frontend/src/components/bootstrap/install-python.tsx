import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
export function InstallPython() {
  return (
    <div className="InstallPython">
      <BootstrapTask type={BootStrapTaskType.installPython}/>
    </div>
  )
}