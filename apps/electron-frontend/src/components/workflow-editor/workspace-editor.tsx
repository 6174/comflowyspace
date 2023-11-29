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
  const { nodes, widgets, edges, onNodesDelete, onAddNode, onEdgesDelete,onNodesChange, onEdgesChange, onLoadWorkflow, onConnect, onInit } = useAppStore()
  
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

  const onDragOver = React.useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);
  const onDrop = React.useCallback(
    async (event) => {
      event.preventDefault();

      const widgetType = event.dataTransfer.getData('application/reactflow');

      if (typeof widgetType === 'undefined' || !widgetType) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const widget = widgets[widgetType];
      if (widget) {
        await onAddNode(widget, position);
      } else {
        console.log('widget not found', widgetType);
      }
    },
    [reactFlowInstance],
  );

  return (
    <div className={styles.workflowEditor}>
      <WsController/>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        fitView
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        disableKeyboardA11y={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={async (instance) => {
          setReactFlowInstance(instance);
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
