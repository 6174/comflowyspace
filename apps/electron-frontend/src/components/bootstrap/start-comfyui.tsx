import { BootStrapTaskType } from "@comflowy/common/store/dashboard-state";
import { BootstrapTask } from "./bootstrap-task";
import { useEffect } from "react";
import { useAptabase } from "@aptabase/react";

export function StartComfyUI() {
  const { trackEvent } = useAptabase();
  useEffect(() => {
    trackEvent('bootstrap-start-comfyui');
  }, []);
  return (
    <div className="StartComfyUI">
      <BootstrapTask type={BootStrapTaskType.startComfyUI}/>
    </div>
  )
}