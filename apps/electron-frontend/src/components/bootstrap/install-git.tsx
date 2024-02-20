import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";

export function InstallGit() {
  return (
    <div className="InstallGit">
      <BootstrapTask type={BootStrapTaskType.installGit}/>
    </div>
  )
}