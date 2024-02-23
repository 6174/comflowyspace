import config from "@comflowy/common/config";
import { captureEvent } from "@sentry/nextjs";
import useWebSocket from "react-use-websocket";
import { useComflowyConsoleState } from "./comflowy-console.state";
import { ComflowyConsoleLog } from "@comflowy/common/types/comflowy-console.types";

/**
 * Comflowy Console Component
 * 1) start a websocket connetion with backend console module , and sync state from backend 
 * 2) list all logs in the console state(need to consider vitual scroll container for performance consideration)
 *    - render log by log type
 * 3) support logs filters 
 *    - by workflowId
 *    - by log level 
 *    - by time range
 *    - by keyword
 */
export default function ComlowyConsole() {
  const syncState = useComflowyConsoleState(st => st.syncState);
  const logs = useComflowyConsoleState(st => st.consoleState.logs);
  const onMessage = (ev: MessageEvent) => {
    const ret = ev.data;
    try {
      const data = JSON.parse(ev.data);
      switch (data.type) {
        case "SYNC_STATE":
          syncState(data.data);
          break;
        case "CREATE_LOG":
          break;
      }
    } catch(err) {
      console.log("parse error", err);
      // captureEvent(err);
    }
  }

  const socketUrl = `ws://${config.host}/ws/console`;
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    onMessage,
    onOpen: () => console.log('opened console ws'),
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <div className="comflowy-console">
      Comflowy-console
      {logs.map(log => {
        return <ConsoleLog log={log} key={log.id}/>
      })}
    </div>
  )
}

/**
 * Console log item
 * @param param0 
 * @returns 
 */
function ConsoleLog({log}: {log: ComflowyConsoleLog}) {
  return (
    <div key={log.id}>
      {log.message}
    </div>
  )
}