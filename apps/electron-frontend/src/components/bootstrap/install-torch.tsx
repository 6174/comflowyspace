import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
export function InstallTorch() {
  return (
    <div className="InstallTorch">
      <BootstrapTask type={BootStrapTaskType.installTorch}/>
    </div>
  )
}