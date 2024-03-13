import { ComflowyConsoleLog } from "@comflowy/common/types";
import { openExternalURL } from '@/lib/electron-bridge';
import { Log } from "./log";

/**
 * Log type for custom nodes import result
 */
export function LogTypeCustomNodesImportInfo({log}: {log: ComflowyConsoleLog}) {
  if (log.data.level !== "error") {
    return (
      <Log log={log}  level={log.data.level} title={"Load custom node success"} className={`log-type-custom-nodes-import-info`}>
        <div className="full-messages">
          {log.message}
        </div>
      </Log>
    )
  }

  return (
    <Log log={log} level={log.data.level} title={"Load custom node failed"} className={`log-type-custom-nodes-import-info`}>
      <div className="full-messages">
        {log.message}
        <br />
        Please check: 
      <a 
        onClick={() => openExternalURL("https://www.comflowy.com/advanced/how-to-install-comfyui-extension")} 
        target="_blank"
        > How to install ComfyUI extension?</a>
      </div>
    </Log>
  )
}