import { ComflowyConsoleLog } from "@comflowy/common/types/comflowy-console.types";
import { Log } from "./log";

/**
 * Log type for custom nodes import result
 */
export function LogTypeCustomNodesImportInfo({log}: {log: ComflowyConsoleLog}) {
  if (log.data.level !== "error") {
    <Log level={log.data.level} title={log.message} className={`log-type-custom-nodes-import-info`}>
    </Log>
  }

  return (
    <Log level={log.data.level} title={"Load custom node failed"} className={`log-type-custom-nodes-import-info`}>
      <div className="full-messages">
        {log.message}
      </div>
    </Log>
  )
}