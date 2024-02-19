import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";

export function InstallConda() {
  return (
    <div className="InstallConda">
      <BootstrapTask type={BootStrapTaskType.installConda}/>
    </div>
  )
}