import * as React from 'react'
import styles from "./workspace-editor.style.module.scss";
import {useAppStore} from "@comflowy/common/store";
import ReactFlow, { Background, BackgroundVariant, Controls, Panel, useStore } from 'reactflow';
import { NodeContainer } from './reactflow-node/reactflow-node-container';
import { NODE_IDENTIFIER } from './reactflow-node/reactflow-node';
import { WsController } from './websocket-controller/websocket-controller';
import { Input, Widget } from '@comflowy/common/comfui-interfaces';
import ReactflowBottomCenterPanel from './reactflow-bottomcenter-panel/reactflow-bottomcenter-panel';
import ReactflowTopLeftPanel from './reactflow-topleft-panel/reactflow-topleft-panel';
import ReactflowTopRightPanel from './reactflow-topright-panel/reactflow-topright-panel';
import { useRouter } from 'next/router';
import { documentDatabaseInstance } from '@comflowy/common/local-storage';
import { shallow } from 'zustand/shallow';
import { AsyncComfyUIProcessManager } from '../comfyui-process-manager/comfyui-process-manager-async';

const nodeTypes = { [NODE_IDENTIFIER]: NodeContainer }
export default function WorkflowEditor() {
  const [inited, setInited] = React.useState(false);
  const { nodes, widgets, edges, onNodesDelete, onAddNode, onEdgesDelete,onNodesChange, onEdgesChange, onLoadWorkflow, onConnect, onInit, onChangeDragingAndResizingState} = useAppStore((st) => ({
    nodes: st.nodes,
    widgets: st.widgets,
    edges: st.edges,
    onNodesDelete: st.onNodesDelete,
    onAddNode: st.onAddNode,
    onEdgesDelete: st.onEdgesDelete,
    onNodesChange: st.onNodesChange,
    onEdgesChange: st.onEdgesChange,
    onLoadWorkflow: st.onLoadWorkflow,
    onConnect: st.onConnect,
    onInit: st.onInit,
    onChangeDragingAndResizingState: st.onChangeDragingAndResizingState,
  }), shallow)
  const transform  = useStore((st => {
    return st.transform[2]
  }));


  const styledEdges = edges.map(edge => {
    return {
      ...edge,
      style: {
        strokeWidth: 2.8 / transform,
        opacity: edge.selected ? 1 : .6,
        stroke: Input.getInputColor([edge.sourceHandle] as any),
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
    checkWebGLStatus();
  }, [id, inited])

  const onDragOver = React.useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);
  const onDrop = React.useCallback(
    async (event) => {
      event.preventDefault();
      const rawWidgetInfo = event.dataTransfer.getData('application/reactflow');
      const widgetInfo = JSON.parse(rawWidgetInfo) as Widget;
      const widgetType = widgetInfo.name;
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
      await onAddNode(widgetInfo, position);
    },
    [reactFlowInstance, widgets],
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
        onNodeDragStart={ev => {
          console.log("drag start");
          onChangeDragingAndResizingState(true);
        }}
        onNodeDragStop={ev => {
          console.log("drag end");
          onChangeDragingAndResizingState(false);
        }}
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
      <AsyncComfyUIProcessManager/>
    </div>
  )
}

function checkWebGLStatus() {
  var canvas = document.createElement('canvas');
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (gl && gl instanceof WebGLRenderingContext) {
    console.log('WebGL is enabled');
  } else {
    console.log('WebGL is disabled');
  }
}