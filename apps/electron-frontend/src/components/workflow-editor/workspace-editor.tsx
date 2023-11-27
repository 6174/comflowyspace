import * as React from 'react'
import styles from "./workspace-editor.style.module.scss";
import {useAppStore} from "@comflowy/common/store";
import { shallow } from 'zustand/shallow';
import ReactFlow, { Background, BackgroundVariant, Controls, Panel } from 'reactflow';
import { NodeContainer } from './reactflow-node/reactflow-node-container';
import { NODE_IDENTIFIER } from './reactflow-node/reactflow-node';
import { WsController } from './websocket-controller/websocket-controller';

const nodeTypes = { [NODE_IDENTIFIER]: NodeContainer }
export default function WorkflowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onInit } = useAppStore(
    (st) => ({
      nodes: st.nodes,
      edges: st.edges,
      onNodesChange: st.onNodesChange,
      onEdgesChange: st.onEdgesChange,
      onConnect: st.onConnect,
      onInit: st.onInit,
    }),
    shallow
  )

  return (
    <div className={styles.workflowEditor}>
      <WsController/>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete']}
        disableKeyboardA11y={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={() => {
          void onInit()
        }}
      >
        <Background variant={BackgroundVariant.Cross} />
        <Controls />
        <Panel position="bottom-center">
          {/* <ControlPanelContainer />
          <ImageViewContainer /> */}
        </Panel>
      </ReactFlow>
    </div>
  )
}
