import { ComflowyConsoleLog } from "@comflowy/common/types";
import { Log } from "./log";
import { useRouter } from "next/router";
import { useAppStore } from "@comflowy/common/store";
import { LogTypeDefault } from "./log-type-default";
import { openExternalURL } from '@/lib/electron-bridge';

/**
 * Log type for custom nodes import result
 */
export function LogTypeExecuteNodeError({log}: {log: ComflowyConsoleLog}) {
  const route = useRouter();
  const isWorkflowPage = route.pathname === "/app";
  // message UX in dashboard page
  if (!isWorkflowPage) {
    return <DashboardPageNodeError log={log} />
  }

  return <WorkflowPageNodeError log={log} />
}

import { useReactFlow, useStoreApi } from 'reactflow';

function WorkflowPageNodeError({ log }: { log: ComflowyConsoleLog }) {
  const { nodeId, workflowId } = log.data;
  const nodes = useAppStore(st => st.nodes);
  const router = useRouter();
  const currentWorkflowId = router.query.id;

  if (workflowId !== currentWorkflowId) {
    return null;
  }

  const node = nodes.find(n => n.id === nodeId);
  const { setViewport, setCenter, zoomIn, zoomOut } = useReactFlow();
  const storeApi = useStoreApi();

  if (!node) {
    return <LogTypeDefault log={log} />
  }

  const nodeTitle = node.data.value.title || node.data.widget?.name;
  // message UX in workflow page
  let $title = (
    <div className="title">
      <span>Node Error at: </span>
      <a className="node-id" onClick={ev => {
        const store = storeApi.getState();
        setCenter(node.position.x + (node.width || 100)/2, node.position.y + (node.height || 100) / 2, {
          zoom: 1,
          duration: 800
        })
        ev.preventDefault();
      }}>#{nodeTitle}</a>
    </div>
  )
  return (
    <Log log={log} level={log.data.level} title={$title} className={`log-type-node-error`}>
      <div className="full-messages">
        {log.message}
        <br />
        Please check: 
        <a 
        onClick={() => openExternalURL("https://www.comflowy.com/blog/comflowy-faq#extension")} 
        target="_blank"
        > Comflowy FAQ</a>
      </div>
    </Log>
  )
}

function DashboardPageNodeError({ log }: { log: ComflowyConsoleLog }) {
  return (
    <Log log={log} level={log.data.level} title={"Node Error"} className={`log-type-node-error`}>
      <div className="full-messages">
        {log.message}
      </div>
    </Log>
  )
}