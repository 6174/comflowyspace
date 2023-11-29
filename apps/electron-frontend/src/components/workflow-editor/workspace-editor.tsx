import * as React from 'react'
import styles from "./workspace-editor.style.module.scss";
import {useAppStore} from "@comflowy/common/store";
import ReactFlow, { Background, BackgroundVariant, Controls, Panel } from 'reactflow';
import { NodeContainer } from './reactflow-node/reactflow-node-container';
import { NODE_IDENTIFIER } from './reactflow-node/reactflow-node';
import { WsController } from './websocket-controller/websocket-controller';
import { Input } from '@comflowy/common/comfui-interfaces';
import ReactflowBottomCenterPanel from './reactflow-bottomcenter-panel/reactflow-bottomcenter-panel';
import ReactflowTopLeftPanel from './reactflow-topleft-panel/reactflow-topleft-panel';
import ReactflowTopRightPanel from './reactflow-topright-panel/reactflow-topright-panel';
import { useRouter } from 'next/router';
import { documentDatabaseInstance } from '@comflowy/common/local-storage';

const nodeTypes = { [NODE_IDENTIFIER]: NodeContainer }
export default function WorkflowEditor() {
  const [inited, setInited] = React.useState(false);
  const { nodes, edges, onNodesChange, onEdgesChange, onLoadWorkflow, onConnect, onInit } = useAppStore()
  
  const styledEdges = edges.map(edge => {
    return {
      ...edge,
      style: {
        strokeWidth: 2.8,
        opacity: edge.selected ? 1 : .6,
        stroke: Input.getInputColor(edge.sourceHandle as any),
      },
    }
  });

  const router = useRouter();
  const {id} = router.query;

  React.useEffect(() => {
    if (id && inited) {
      documentDatabaseInstance.getDocFromLocal(id as string).then((doc) => {
        onLoadWorkflow(doc);
      })
    }
  }, [id, inited])

  return (
    <div className={styles.workflowEditor}>
      <WsController/>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        fitView
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete']}
        disableKeyboardA11y={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={async () => {
          await onInit();
          setInited(true);
        }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <Panel position="bottom-center">
          <ReactflowBottomCenterPanel/>
        </Panel>
        <Panel position="top-left">
          <ReactflowTopLeftPanel/>
        </Panel>
        <Panel position="top-right">
          <ReactflowTopRightPanel/>
        </Panel>
      </ReactFlow>
    </div>
  )
}
