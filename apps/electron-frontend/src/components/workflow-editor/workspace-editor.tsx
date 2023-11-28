import * as React from 'react'
import styles from "./workspace-editor.style.module.scss";
import {useAppStore} from "@comflowy/common/store";
import { shallow } from 'zustand/shallow';
import ReactFlow, { Background, BackgroundVariant, Controls, Panel } from 'reactflow';
import { NodeContainer } from './reactflow-node/reactflow-node-container';
import { NODE_IDENTIFIER } from './reactflow-node/reactflow-node';
import { WsController } from './websocket-controller/websocket-controller';
import { Input } from '@comflowy/common/comfui-interfaces';
import ReactflowBottomCenterPanel from './reactflow-bottomcenter-panel/reactflow-bottomcenter-panel';
import ReactflowTopLeftPanel from './reactflow-topleft-panel/reactflow-topleft-panel';
import ReactflowTopRightPanel from './reactflow-topright-panel/reactflow-topright-panel';

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
  
  const styledEdges = edges.map(edges => {
    return {
      ...edges,
      style: {
        strokeWidth: 2.8,
        opacity: .6,
        stroke: Input.getInputColor(edges.sourceHandle as any),
      },
    }
  })
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
        onInit={() => {
          void onInit()
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
