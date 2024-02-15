import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
import { useAptabase } from "@aptabase/react";
import { useEffect } from "react";
export function InstallTorch() {
  const { trackEvent } = useAptabase();
  useEffect(() => {
    trackEvent('bootstrap-install-torch');
  }, []);
  return (
    <div className="InstallTorch">
      <BootstrapTask type={BootStrapTaskType.installTorch}/>
    </div>
  )
}