import { ComflowyConsoleLog } from "@comflowy/common/types/comflowy-console.types";
import { MessageViewer } from "../message-viewer";
import { Log } from "./log";

/**
 * Log type for custom nodes import result
 */
export function LogTypeDefault({ log }: { log: ComflowyConsoleLog }) {
  return (
    <Log log={log} title={log.message} className={`log-type-default`}>
      {/* <MessageViewer message={log.message} /> */}
    </Log>
  )
}