import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
import { useAptabase } from "@aptabase/react";
import { useEffect } from "react";

export function InstallGit() {
  const { trackEvent } = useAptabase();
  useEffect(() => {
    trackEvent('bootstrap-install-git');
  }, []);
  return (
    <div className="InstallGit">
      <BootstrapTask type={BootStrapTaskType.installGit}/>
    </div>
  )
}