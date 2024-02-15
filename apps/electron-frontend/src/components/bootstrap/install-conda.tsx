import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
import { useEffect } from "react";
import { useAptabase } from "@aptabase/react";

export function InstallConda() {
  const { trackEvent } = useAptabase();
  useEffect(() => {
    trackEvent('bootstrap-install-conda');
  }, []);
  return (
    <div className="InstallConda">
      <BootstrapTask type={BootStrapTaskType.installConda}/>
    </div>
  )
}