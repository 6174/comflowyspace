import * as React from 'react'
import styles from "./workflow-editor.style.module.scss";
import {useAppStore} from "@comflowy/common/store";
import ReactFlow, { Background, BackgroundVariant, Controls, OnConnectStartParams, Panel, SelectionMode, useStore, useStoreApi } from 'reactflow';
import { NodeContainer } from './reactflow-node/reactflow-node-container';
import { NODE_IDENTIFIER } from './reactflow-node/reactflow-node';
import { WsController } from './websocket-controller/websocket-controller';
import { Input, SDNode, Widget } from '@comflowy/common/comfui-interfaces';
import ReactflowBottomCenterPanel from './reactflow-bottomcenter-panel/reactflow-bottomcenter-panel';
import ReactflowTopLeftPanel from './reactflow-topleft-panel/reactflow-topleft-panel';
import ReactflowTopRightPanel from './reactflow-topright-panel/reactflow-topright-panel';
import { useRouter } from 'next/router';
import { PersistedFullWorkflow, PersistedWorkflowDocument, documentDatabaseInstance } from '@comflowy/common/storage';
import { shallow } from 'zustand/shallow';
import { AsyncComfyUIProcessManager } from '../comfyui-process-manager/comfyui-process-manager-async';
import ContextMenu from './reactflow-context-menu/reactflow-context-menu';
import { JSONDBClient } from '@comflowy/common/jsondb/jsondb.client';
import { copyNodes, pasteNodes } from './reactflow-clipboard';

const nodeTypes = { [NODE_IDENTIFIER]: NodeContainer }
export default function WorkflowEditor() {
  const [inited, setInited] = React.useState(false);
  const { nodes, widgets, edges, inprogressNodeId, selectionMode, transform, onTransformStart, onTransformEnd, onConnectStart, onConnectEnd, onDeleteNodes, onAddNode, onEdgesDelete,onNodesChange, onEdgesChange, onEdgesUpdate, onEdgeUpdateStart, onEdgeUpdateEnd, onLoadWorkflow, onConnect, onInit, onChangeDragingAndResizingState} = useAppStore((st) => ({
    nodes: st.nodes,
    widgets: st.widgets,
    edges: st.edges,
    selectionMode: st.slectionMode,
    onEdgesUpdate: st.onEdgeUpdate,
    onEdgeUpdateStart: st.onEdgeUpdateStart,
    onEdgeUpdateEnd: st.onEdgeUpdateEnd,
    onDeleteNodes: st.onDeleteNodes,
    onConnectStart: st.onConnectStart,
    onConnectEnd: st.onConnectEnd,
    onAddNode: st.onAddNode,
    onEdgesDelete: st.onEdgesDelete,
    onNodesChange: st.onNodesChange,
    onEdgesChange: st.onEdgesChange,
    onLoadWorkflow: st.onLoadWorkflow,
    onTransformEnd: st.onTransformEnd,
    onTransformStart: st.onTransformStart,
    transform: st.transform,
    onConnect: st.onConnect,
    inprogressNodeId: st.nodeInProgress?.id,
    onInit: st.onInit,
    onChangeDragingAndResizingState: st.onChangeDragingAndResizingState,
  }), shallow)

  // @TODO performance issue when zooming
  // const transform  = useStore((st => {
  //   return st.transform[2]
  // }));
  
  const nodesWithStyle = nodes.map(node => {
    return {
      ...node,
      style: {
        ...node.style,
        width: node.width,
        height: node.height
      }
    }
  });

  const styledEdges = edges.map(edge => {
    return {
      ...edge,
      animated: edge.source === inprogressNodeId,
      style: {
        strokeWidth: 2.5 / transform,
        opacity: edge.selected ? 1 : .6,
        stroke: Input.getInputColor([edge.sourceHandle] as any),
      },
    }
  });

  const router = useRouter();
  const {id} = router.query;

  const watchedDoc = JSONDBClient.useLiveJSONDB<PersistedFullWorkflow | null>({
    collectionName: "workflows",
    documentId: id as string,
    queryFn: async() => {
      if (!id) {
        return null;
      }
      return await documentDatabaseInstance.getDoc(id as string)
    }
  });

  React.useEffect(() => {
    if (id && inited) {
      documentDatabaseInstance.getDoc(id as string).then(doc => {
        doc && !doc.deleted && onLoadWorkflow(doc);
      }).catch(err => {
        console.log(err);
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

  const ref = React.useRef(null);
  const [menu, setMenu] = React.useState(null);
  const onSelectionContextMenu = React.useCallback(
    (event, nodes) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        nodes,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu],
  );

  const tranformEnd = () => {
    const transform = storeApi.getState().transform;
    onTransformEnd(transform[2]);
  }

  const onPaneClick = React.useCallback(() => {
    tranformEnd();
    setMenu(null)
  }, [setMenu]);
  
  const selectionModeProps = selectionMode === "figma" ? {
    selectionOnDrag: true,
    panOnScroll: true,
    panOnDrag: [1, 2],
    selectionMode: SelectionMode.Partial
  }  : {};

  const storeApi = useStoreApi();


  const onKeyPresshandler = React.useCallback((ev: KeyboardEvent) => {
    // console.log("key press");
    const metaKey = ev.metaKey;
    switch (ev.code) {
      case "KeyC": 
        break;
      case "KeyV":
        break;
      default: 
        break;
    }
  }, []);

  const onCopy = React.useCallback((ev: ClipboardEvent) => {
    const state = useAppStore.getState();
    const selectedNodes = state.nodes.filter(node => node.selected);
    const workflowMap = state.doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    copyNodes(selectedNodes.map((node) => {
      const id = node.id;
      return workflow.nodes[id];
    }), ev);

    if (ev.type === "cut") {
      // do something with cut
    }
  }, [])

  const onPaste = React.useCallback((ev: ClipboardEvent) => {
    pasteNodes(ev);
  }, [reactFlowInstance])

  React.useEffect(() => {
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('keydown', onKeyPresshandler);
    return () => {
      document.removeEventListener('keydown', onKeyPresshandler);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      document.removeEventListener('paste', onPaste);
    }
  }, [ref])


  if (inited && watchedDoc && watchedDoc.deleted) {
    return <div>This doc is deleted</div>
  }

  return (
    <div className={styles.workflowEditor}>
      <WsController/>
      <ReactFlow
        ref={ref}
        nodes={nodesWithStyle}
        edges={styledEdges}
        maxZoom={10}
        minZoom={.1}
        fitView
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        disableKeyboardA11y={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onDeleteNodes}
        onEdgesDelete={onEdgesDelete}
        onEdgeUpdate={onEdgesUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onDrop={onDrop}
        onMoveStart={ev => {
          onTransformStart();
        }}
        onMoveEnd={tranformEnd}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodeContextMenu={(ev, node) => {
          onSelectionContextMenu(ev, [node]);
        }}
        onSelectionContextMenu={onSelectionContextMenu}
        onPaneContextMenu={onPaneClick}
        {...selectionModeProps}
        onNodeDragStart={ev => {
          onChangeDragingAndResizingState(true);
        }}
        onNodeDragStop={ev => {
          onChangeDragingAndResizingState(false);
        }}
        onInit={async (instance) => {
          setReactFlowInstance(instance);
          await onInit(instance);
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
        {menu && <ContextMenu hide={onPaneClick} {...menu} />}
      </ReactFlow>
      <AsyncComfyUIProcessManager/>
    </div>
  )
}

function checkWebGLStatus() {
  // var canvas = document.createElement('canvas');
  // var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  // if (gl && gl instanceof WebGLRenderingContext) {
  //   console.log('WebGL is enabled');
  // } else {
  //   console.log('WebGL is disabled');
  // }
}