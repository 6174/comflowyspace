import { ComflowyConsoleLog } from "@comflowy/common/types/comflowy-console.types";
import { MessageViewer } from "../message-viewer";
import { Log } from "./log";

/**
 * Log type for custom nodes import result
 */
export function LogTypeDefault({ log }: { log: ComflowyConsoleLog }) {
  return (
    <Log level={log.data.level} title={log.message.slice(0, 10)} className={`log-type-default`}>
      <MessageViewer message={log.message} />
    </Log>
  )
}