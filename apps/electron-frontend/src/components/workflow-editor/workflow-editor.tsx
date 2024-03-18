import * as React from 'react'
import styles from "./workflow-editor.style.module.scss";
import {useAppStore} from "@comflowy/common/store";
import ReactFlow, { Background, BackgroundVariant, Controls, NodeProps, OnConnectStartParams, Panel, SelectionMode, useStore, useStoreApi, Node, getNodesBounds} from 'reactflow';
import { NodeWrapper } from './reactflow-node/reactflow-node-wrapper';
import { NODE_IDENTIFIER } from './reactflow-node/reactflow-node';
import { WsController } from './websocket-controller/websocket-controller';
import { Input, NODE_GROUP, PersistedFullWorkflow, PersistedWorkflowDocument, SDNode, Widget } from '@comflowy/common/types';
import ReactflowBottomCenterPanel from './reactflow-bottomcenter-panel/reactflow-bottomcenter-panel';
import ReactflowTopLeftPanel from './reactflow-topleft-panel/reactflow-topleft-panel';
import ReactflowTopRightPanel from './reactflow-topright-panel/reactflow-topright-panel';
import { useRouter } from 'next/router';
import { documentDatabaseInstance } from '@comflowy/common/storage';
import { shallow } from 'zustand/shallow';
import ContextMenu from './reactflow-context-menu/reactflow-context-menu';
import { JSONDBClient } from '@comflowy/common/jsondb/jsondb.client';
import { copyNodes, pasteNodes } from './reactflow-clipboard';
import { ReactflowExtensionController } from '@/lib/extensions/extensions.controller';
import { WidgetTreeOnPanel, WidgetTreeOnPanelContext } from './reactflow-bottomcenter-panel/widget-tree/widget-tree-on-panel-click';
import { onEdgeUpdateFailed } from './reactflow-connecting';
import { useExtensionsState } from '@comflowy/common/store/extension-state';
import { message } from 'antd';
import { MissingWidgetsPopoverEntry } from './reactflow-missing-widgets/reactflow-missing-widgets';
import { GroupNode } from './reactflow-group/reactflow-group';
import { isRectContain } from "@comflowy/common/utils/math";

const nodeTypes = { 
  [NODE_IDENTIFIER]: NodeWrapper,
  [NODE_GROUP]: GroupNode
}
export default function WorkflowEditor() {
  /**
   * basic properties
   */
  const [inited, setInited] = React.useState(false);
  const ref = React.useRef(null);
  const storeApi = useStoreApi();
  const { id, watchedDoc } = useLiveDoc(inited);
  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);
  const onInitExtensionState = useExtensionsState((st) => st.onInit);
  const [toolsUIVisible, setToolsUIVisible] = React.useState(false);
  React.useEffect(() => {
    if (ref.current) {
      setToolsUIVisible(true);
    }
  }, [ref])

  const edgeUpdateSuccessful = React.useRef(true);
  const edgetConnectSuccessful = React.useRef(true);
  const edgeConnectingParams = React.useRef<OnConnectStartParams>(null);
  const edgeUpdating = React.useRef(false);

  /**
   * core behaviors
   */
  useCopyPaste(ref, reactFlowInstance);
  const { menu, setMenu, onSelectionContextMenu } = useWorkflowNodeContextMenu(ref);
  const { widgetTreeContext, setWidgetTreeContext, onPanelDoubleClick, onPanelClick } = useWorkflowPanelContextMenu(edgeUpdating);
  const { onNodeDrag, onNodeDragStart, onNodeDragStop, onSelectionChange} = useDragDropNode(ref);
  const { onPaneDragOver, onPaneDrop } = useDragDropToCreateNode(reactFlowInstance, setWidgetTreeContext);

  /**
   * app state
   */
  const { nodes, widgets, edges, inprogressNodeId, selectionMode, transform, onTransformStart, onTransformEnd, onConnectStart, onConnectEnd, onDeleteNodes, onEdgesDelete,onNodesChange, onEdgesChange, onEdgesUpdate, onEdgeUpdateStart, onEdgeUpdateEnd, onConnect, onInit, onNewClientId} = useAppStore((st) => ({
    nodes: st.nodes,
    widgets: st.widgets,
    edges: st.edges,
    selectionMode: st.slectionMode,
    onNewClientId: st.onNewClientId,
    onEdgesUpdate: st.onEdgeUpdate,
    onEdgeUpdateStart: st.onEdgeUpdateStart,
    onEdgeUpdateEnd: st.onEdgeUpdateEnd,
    onDeleteNodes: st.onDeleteNodes,
    onConnectStart: st.onConnectStart,
    onConnectEnd: st.onConnectEnd,
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
  }), shallow)

  /**
   * node and edge rendering 
   */
  const { nodesWithStyle, styledEdges } = useNodeAndEdgesWithStyle(nodes, edges, inprogressNodeId, transform);
  
  const tranformEnd = React.useCallback(() => {
    const transform = storeApi.getState().transform;
    onTransformEnd(transform[2]);
  }, []);

  const onPaneClick = React.useCallback(() => {
    tranformEnd();
    setMenu(null)
  }, [setMenu]);
  

  if (inited && watchedDoc && watchedDoc.deleted) {
    return <div>This doc is deleted</div>
  }

  return (
    <div className={styles.workflowEditor}>
      {id && id !== "" && <WsController clientId={id as string}/>}
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
        zoomOnDoubleClick={false}
        onDoubleClick={onPanelDoubleClick}
        onClick={onPanelClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onDeleteNodes}
        onEdgesDelete={onEdgesDelete}
        onEdgeUpdateStart={() => {
          edgeUpdateSuccessful.current = false;
          edgeUpdating.current = true;
          onEdgeUpdateStart();
        }}
        onEdgeUpdate={(oldEdge, newConnection) => {
          edgeUpdateSuccessful.current = true;
          onEdgesUpdate(oldEdge, newConnection);
        }}
        onEdgeUpdateEnd={(event: MouseEvent, edge) => {
          onEdgeUpdateEnd(event, edge, edgeUpdateSuccessful.current);
          if (!edgeUpdateSuccessful.current) {
            onEdgesDelete([edge]);
            const connectingParams = edgeConnectingParams.current;
            if (connectingParams) {
              onEdgeUpdateFailed({
                event,
                nodes,
                onConnect,
                widgets,
                setWidgetTreeContext,
                connectingParams
              })
            }
          }
          setTimeout(() => {
            edgeUpdating.current = false;
          }, 100)
        }}
        onConnectStart={(ev, params)=> {
          edgeConnectingParams.current = params;
          edgeUpdating.current = true;
          edgetConnectSuccessful.current = false;
          onConnectStart(ev, params); 
        }}
        onConnect={(connection) => {
          edgetConnectSuccessful.current = true;
          onConnect(connection);
        }}
        onConnectEnd={(ev: MouseEvent) => {
          onConnectEnd(ev);
          if (!edgetConnectSuccessful.current) {
            onEdgeUpdateFailed({
              event: ev,
              nodes,
              onConnect,
              widgets,
              setWidgetTreeContext,
              connectingParams: edgeConnectingParams.current
            })
          }
          setTimeout(() => {
            edgeConnectingParams.current = null;
            edgetConnectSuccessful.current = true;
            edgeUpdating.current = false;
          }, 100)
        }}
        onDrop={onPaneDrop}
        onDragOver={onPaneDragOver}
        onMoveStart={ev => {
          onTransformStart();
        }}
        onMoveEnd={tranformEnd}
        onPaneClick={onPaneClick}
        onNodeContextMenu={(ev, node) => {
          onSelectionContextMenu(ev, [node]);
        }}
        onSelectionContextMenu={onSelectionContextMenu}
        onPaneContextMenu={onPaneClick}
        {...useSelectionModeRelatedProps(selectionMode)}
        selectNodesOnDrag={false}
        onNodeDrag={onNodeDrag}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={(ev) => {
          /**
           * Track multiple node dragging
           */
          if (ev.nodes.length > 0) {
            onSelectionChange(ev);
          }
        }}
        onInit={async (instance) => {
          try {
            setReactFlowInstance(instance);
            await onInitExtensionState(false);
            await onInit(instance);
            if (id) {
              onNewClientId(id as string);
            }
            setInited(true);
          } catch(err) {
            message.error("App init failed: " + err.message);
          }
        }}
      >
        <Background variant={BackgroundVariant.Dots} />
        {toolsUIVisible && (
          <>
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
          </>
        )}
        {menu && <ContextMenu hide={onPaneClick} {...menu} />}
      </ReactFlow>
      <ReactflowExtensionController/>
      { widgetTreeContext && <WidgetTreeOnPanel context={widgetTreeContext}/>}
      <MissingWidgetsPopoverEntry/>
    </div>
  )
}

function useSelectionModeRelatedProps(selectionMode) {
  return selectionMode === "figma" ? {
    selectionOnDrag: true,
    panOnScroll: true,
    panOnDrag: [1, 2],
    selectionMode: SelectionMode.Partial
  } : {};
}

function useNodeAndEdgesWithStyle(nodes, edges, inprogressNodeId, transform) {
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

  return {
    nodesWithStyle,
    styledEdges
  }

}

/**
 * workfow node context menu
 */

function useWorkflowNodeContextMenu(ref) {
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

  return {
    menu,
    setMenu,
    onSelectionContextMenu
  }
}

/**
 * workflow panel context menu
 */
function useWorkflowPanelContextMenu(edgeUpdating) {
  const [widgetTreeContext, setWidgetTreeContext] = React.useState<WidgetTreeOnPanelContext>();
  const onPanelDoubleClick = React.useCallback((ev: React.MouseEvent) => {
    const target = ev.target as HTMLElement;
    if (target.classList.contains("react-flow__pane")) {
      setWidgetTreeContext({
        position: {
          x: ev.clientX,
          y: ev.clientY
        },
        filter: (widget) => true,
        showCategory: true,
        onNodeCreated: () => {
          setWidgetTreeContext(null);
        }
      })
    }
  }, [setWidgetTreeContext]);

  const onPanelClick = React.useCallback((ev: React.MouseEvent) => {
    !edgeUpdating.current && setWidgetTreeContext(null)
  }, []);

  React.useEffect(() => {
    document.oncontextmenu = function () {
      return false;
    }
  }, []);
  return {
    widgetTreeContext,
    setWidgetTreeContext,
    onPanelDoubleClick,
    onPanelClick
  }
}

function useDragDropToCreateNode(reactFlowInstance, setWidgetTreeContext) {
  const widgets = useAppStore(st => st.widgets);
  const onAddNode = useAppStore(st => st.onAddNode);
  const onDragOver = React.useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);


  const onDrop = React.useCallback(
    async (event) => {
      event.preventDefault();
      try {
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
        setWidgetTreeContext(null);
      } catch (err) {
        console.log("drop error", err);
      }
    },
    [reactFlowInstance, widgets],
  );

  return {
    onPaneDragOver: onDragOver,
    onPaneDrop: onDrop
  }

}

/**
 * live doc
 */
function useLiveDoc(inited) {
  const onLoadWorkflow = useAppStore(st => st.onLoadWorkflow);
  const router = useRouter();
  const { id } = router.query;
  const watchedDoc = JSONDBClient.useLiveDoc<PersistedFullWorkflow | null>({
    collectionName: "workflows",
    documentId: id as string,
    queryFn: async () => {
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
  }, [id, inited])
  return {id, watchedDoc}
}


/**
  * node drag enter and leave on group node
  * https://pro-examples.reactflow.dev/dynamic-grouping
  */
function useDragDropNode(ref) {
  const mousedownRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const selectionNodesRef = React.useRef<Node[]>([]);
  
  const onMouseDown = React.useCallback(() => {
    console.log("mousedown", mousedownRef.current)
    mousedownRef.current = true;
  }, []);

  const onSelectionChange = React.useCallback((ev) => {
    const selectionNodes = (ev.nodes || []) as Node[];
    if (mousedownRef.current && selectionNodes.length > 0) {
      // if any of the selection node is a group type node, do nothing
      if (selectionNodes.find(n => n.type === NODE_GROUP)) {
        return
      }

      draggingRef.current = true;
      selectionNodesRef.current = selectionNodes

      // calculate the bound for all nodes;
      const bound = getNodesBounds(selectionNodes)
      const nodes = useAppStore.getState().nodes;
      const groupNodes = nodes.filter(n => n.type === NODE_GROUP);
      const groupNode = groupNodes.find(n => {
        return isRectContain(getNodesBounds([n]), bound);
      });

      if (groupNode) {
        useAppStore.setState({
          draggingOverGroupId: groupNode.id
        })
      } else {
        useAppStore.setState({
          draggingOverGroupId: null
        })
      }
    }
  }, []);
  
  const onMouseUp = React.useCallback(() => {
    console.log("mouseup");
    mousedownRef.current = false;
    const selectionNodes = selectionNodesRef.current;
    if (draggingRef.current && selectionNodes.length > 0) {
      draggingRef.current = false;
      const st = useAppStore.getState();
      // if this id exist, all nodes is over the group
      const draggingOverGroupId = st.draggingOverGroupId;

      useAppStore.setState({
        draggingOverGroupId: null
      });

      selectionNodes.forEach(node => {
        const sdnode = node.data.value as SDNode;
        /**
         * if node already in a group, then do nothing
         */
        if (sdnode.parent && sdnode.parent === draggingOverGroupId) {
          return;
        }

        /**
         * if node already in a group, and current dragging over group is null, then remove the node from the group
        */
        if (sdnode.parent && !draggingOverGroupId) {
          const draggingOverGroup = st.nodes.find(n => n.id === sdnode.parent);
          getNodePositionOutOfGroup(node, draggingOverGroup);
          st.onNodeAttributeChange(node.id, {
            parent: null,
            position: {
              x: node.position.x + draggingOverGroup.position.x,
              y: node.position.y + draggingOverGroup.position.y
            }
          });
          return;
        }

        /**
         * if node is not in a group, and current dragging over group is not null, then add the node to the group
         */
        if (!sdnode.parent && draggingOverGroupId) {
          const draggingOverGroup = st.nodes.find(n => n.id === draggingOverGroupId);
          const realPosition = getNodePositionInGroup(node, draggingOverGroup);
          console.log("realPosition", realPosition);
          st.onNodeAttributeChange(node.id, {
            parent: draggingOverGroupId,
            position: realPosition
            // position: {
            //   x: 0,//node.position.x - draggingOverGroup.position.x,
            //   y: 0//node.position.y - draggingOverGroup.position.y
            // }
          });
          return;
        }
      })
    }
    
  }, []);


  React.useEffect(() => {
    if (ref.current) {
      const dom = document.body;
      dom.addEventListener("mousedown", onMouseDown, true);
      dom.addEventListener("mouseup", onMouseUp, true);
      return () => {
        dom.removeEventListener("mousedown", onMouseDown, true);
        dom.removeEventListener("mouseup", onMouseUp, true);
      }
    }
  }, [ref, onMouseDown, onMouseUp]);

  const onNodeDragStart = React.useCallback((ev: React.MouseEvent, node: Node) => {
  }, []);

  const onNodeDrag = React.useCallback((ev: React.MouseEvent, node: Node) => {
    onSelectionChange({
      nodes: [node]
    })
  }, []);

  const onNodeDragStop = React.useCallback((ev: React.MouseEvent, node: Node) => {
    onMouseUp();
  }, []);

  return {
    onNodeDragStart,
    onSelectionChange,
    onNodeDrag,
    onNodeDragStop
  }

  function getNodePositionInGroup(node: Node, containerNode: Node) {
    const nodePosition = node.position ?? { x: 0, y: 0 };
    const nodeWidth = node.width ?? 0;
    const nodeHeight = node.height ?? 0;
    const containerWidth = containerNode.width ?? 0;
    const containerHeight = containerNode.height ?? 0;

    // 计算 node 节点在 containerNode 节点内的 x 坐标
    if (nodePosition.x < containerNode.position.x) {
      nodePosition.x = 0;
    } else if (nodePosition.x + nodeWidth > containerNode.position.x + containerWidth) {
      nodePosition.x = containerWidth - nodeWidth;
    } else {
      nodePosition.x = nodePosition.x - containerNode.position.x;
    }

    // 计算 node 节点在 containerNode 节点内的 y 坐标
    if (nodePosition.y < containerNode.position.y) {
      nodePosition.y = 0;
    } else if (nodePosition.y + nodeHeight > containerNode.position.y + containerHeight) {
      nodePosition.y = containerHeight - nodeHeight;
    } else {
      nodePosition.y = nodePosition.y - containerNode.position.y;
    }

    return nodePosition;
  }

  function getNodePositionOutOfGroup(node: Node, containerNode: Node) {
    const nodePosition = node.position ?? { x: 0, y: 0 };
    nodePosition.x = nodePosition.x + containerNode.position.x;
    nodePosition.y = nodePosition.y + containerNode.position.y;
    return nodePosition;
  }
}

/**
 * Keyboard Event handler 
 */
function useCopyPaste(ref, reactFlowInstance) {
  const onKeyPresshandler = React.useCallback((ev: KeyboardEvent) => {
    const metaKey = ev.metaKey;
    switch (ev.code) {
      case "KeyC":
        break;
      case "KeyV":
        break;
      case "KeyZ":
        if (metaKey && !ev.shiftKey) {
          undo();
        }
        if (metaKey && ev.shiftKey) {
          redo();
        }
        break;
      default:
        break;
    }

    function undo() {
      const undo = useAppStore.getState().undo;
      undo();
    }

    function redo() {
      const redo = useAppStore.getState().redo;
      redo();
    }
  }, []);

  const onCopy = React.useCallback((ev: ClipboardEvent) => {
    if ((ev.target as HTMLElement)?.className === "node-error") {
      return;
    }
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
}