import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
import { useEffect } from "react";
import { useAptabase } from "@aptabase/react";

export function InstallComfyUI() {
  const { trackEvent } = useAptabase();
  useEffect(() => {
    trackEvent('bootstrap-install-comfyui');
  }, []);
  return (
    <div className="InstallComfyUI">
      <BootstrapTask type={BootStrapTaskType.installComfyUI}/>
    </div>
  )
}