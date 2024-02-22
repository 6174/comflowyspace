import config from "@comflowy/common/config";
import useWebSocket from "react-use-websocket";

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

  const onMessage = (ev: MessageEvent) => {
    console.log(onMessage);
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
    </div>
  )
}