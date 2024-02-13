import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
import { useEffect } from "react";
import { useAptabase } from "@aptabase/react";
export function InstallPython() {
  const { trackEvent } = useAptabase();
  useEffect(() => {
    trackEvent('bootstrap-install-python');
  }, []);
  return (
    <div className="InstallPython">
      <BootstrapTask type={BootStrapTaskType.installPython}/>
    </div>
  )
}