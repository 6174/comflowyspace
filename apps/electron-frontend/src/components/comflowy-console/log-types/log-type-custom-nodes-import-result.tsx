import { ComflowyConsoleLog } from "@comflowy/common/types/comflowy-console.types";
import { MessageViewer } from "../message-viewer";
import { Log } from "./log";

/**
 * Log type for custom nodes import result
 */
export function LogTypeCustomNodesImportResult({log}: {log: ComflowyConsoleLog}) {
  const importSuccessExtensions = log.data.importSuccessExtensions || [];
  const importFailedExtensions = log.data.importFailedExtensions || [];
  return (
    <Log level={log.data.level} title={log.message.slice(0, 10)} className={`log-type-custom-nodes-import-result`}>
      <div>Custom nodes import result:</div>
      <div>Success: {importSuccessExtensions.length}</div>
      <MessageViewer message={log.message}/>
    </Log>
  )
}