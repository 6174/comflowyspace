import config from "@comflowy/common/config";
import { captureEvent } from "@sentry/nextjs";
import useWebSocket from "react-use-websocket";
import { useComflowyConsoleState } from "./comflowy-console.state";
import { ComflowyConsoleLog, ComflowyConsoleLogTypes } from "@comflowy/common/types/comflowy-console.types";
import styles from "./comflowy-console.module.scss";
import { LogTypeDefault } from "./log-types/log-type-default";
import { LogTypeCustomNodesImportResult } from "./log-types/log-type-custom-nodes-import-result";
import { LogTypeCustomNodesImportInfo } from "./log-types/log-type-custom-node-import-info";
import { LogTypeExecuteNodeError } from "./log-types/log-type-node-error";
import { LogTypeLinearShapeError } from "./log-types/log-type-linear-shape-error";
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
  const addLogs = useComflowyConsoleState(st => st.addLogs);
  const updateEnv = useComflowyConsoleState(st => st.updateEnv);
  const onMessage = (ev: MessageEvent) => {
    const ret = ev.data;
    try {
      const data = JSON.parse(ev.data);
      switch (data.type) {
        case "SYNC_STATE":
          syncState(data.data);
          break;
        case "CREATE_LOG":
          addLogs(data.data);
          break;
        case "UPDATE_ENV":
          updateEnv(data.data);
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

  const reversedLogs = logs.slice().reverse();

  return (
    <div className={styles.comflowyConsole}>
      {reversedLogs.map(log => {
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
  let LogCO = LogTypeDefault;
  switch(log.data.type) {
    case ComflowyConsoleLogTypes.CUSTOM_NODES_IMPORT_RESULT:
      LogCO = LogTypeCustomNodesImportResult;
      break;
    case ComflowyConsoleLogTypes.EXTENSION_LOAD_INFO:
      LogCO = LogTypeCustomNodesImportInfo;
      break;
    case ComflowyConsoleLogTypes.EXECUTE_NODE_ERROR:
      // 你可能会根据错误信息的不同，区分展示的错误类型组件
      if (log.message.includes("RuntimeError")) {
        LogCO = LogTypeLinearShapeError; // 使用专门处理线性形状错误的组件
      } else {
        LogCO = LogTypeExecuteNodeError; // 其他执行节点错误用现有组件处理
      }
      break;
    default: 
      LogCO = LogTypeDefault;
      break;
  }
  return (
    <LogCO key={log.id}  log={log}/>
  )
}