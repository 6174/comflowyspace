import * as Y from "yjs";
import exifr from 'exifr'
import { create } from 'zustand'
import { type Edge, type Node, type OnNodesChange, type OnEdgesChange, type OnConnect, type XYPosition, type Connection as FlowConnecton, addEdge, applyNodeChanges, OnEdgesDelete, applyEdgeChanges, OnEdgeUpdateFunc, OnConnectStart, OnConnectEnd, OnConnectStartParams, NodeChange, ReactFlowInstance, } from 'reactflow';
import { WorkflowDocumentUtils, createNodeId } from '../ydoc-utils';
import { type NodeId, type NodeInProgress, type PropertyKey, SDNode, Widget, type WidgetKey, NODE_IDENTIFIER, Connection, PreviewImage, UnknownWidget, ContrlAfterGeneratedValues, NODE_GROUP, PersistedFullWorkflow, PersistedWorkflowNode, PersistedWorkflowDocument, PersistedWorkflowConnection, SUBFLOW_WIDGET_TYPE_NAME, parseSubflowSlotId, NodeVisibleState } from '../../types'
import { throttledUpdateDocument } from "../../storage";
import { PromptResponse, createPrompt, sendPrompt } from '../../comfyui-bridge/prompt';
import { getWidgetLibrary as getWidgets } from '../../comfyui-bridge/bridge';
import { writeWorkflowToFile, } from '../../comfyui-bridge/export-import';
import { getBackendUrl } from '../../config'
import { uuid } from '../../utils';
import { SlotEvent } from '../../utils/slot-event';
import { ComfyUIExecuteError } from '../../types';
import { ComfyUIEvents } from '../../types';
import { comflowyConsoleClient } from '../../utils/comflowy-console.client';
import { ControlBoardConfig } from '../../types';
import { SubflowStoreType, useSubflowStore } from "../subflow-state";
import { staticCheckWorkflowErrors } from "../../workflow-editor/parse-workflow-errors";
import { getNodePositionInGroup, getNodePositionOutOfGroup, getValueTypeOfNodeSlot } from "../../utils/workflow";
import _ from "lodash";
export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void
export type SelectionMode = "figma" | "default";
export interface EditorEvent {
  type: string;
  data: any
}

export interface AppState {
  editorInstance?: ReactFlowInstance<any, any>,
  editorEvent: SlotEvent<EditorEvent>,
  counter: number
  clientId?: string
  slectionMode: SelectionMode
  transform: number
  transforming: boolean
  unknownWidgets: Set<string>;
  subflowStore: SubflowStoreType;
  // full workflow meta in storage
  persistedWorkflow: PersistedFullWorkflow | null;
  // workflow document store in yjs for undo redp
  doc: Y.Doc;
  undoManager?: Y.UndoManager;
  // editor state for rendering, update from Y.Doc
  nodes: Node[]
  edges: Edge[]
  controlboard?: ControlBoardConfig
  graph: Record<NodeId, SDNode>
  widgets: Record<WidgetKey, Widget>
  widgetCategory: any;
  draggingAndResizing: boolean;
  isConnecting: boolean;
  connectingStartParams?: OnConnectStartParams & { valueType: string };
  resetWorkflowEvent: SlotEvent<any>;
  nodeInProgress?: NodeInProgress
  promptError?: ComfyUIExecuteError
  previewedImageIndex?: number

  // group control
  draggingOverGroupId?: string;

  // document mutation handler
  onSyncFromYjsDoc: () => void;
  updateErrorCheck: () => void;
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onDeleteNodes: (changes: (Node | { id: string })[]) => void
  onEdgesDelete: OnEdgesDelete
  onNodeFieldChange: OnPropChange
  onNodePropertyChange: (id: NodeId, updates: Partial<SDNode["properties"]>) => void;
  onNodeAttributeChange: (id: string, updates: Record<string, any>) => void
  onDocAttributeChange: (updates: Record<string, any>) => void;

  // group control
  onAddNodeToGroup: (node: Node, group: Node) => void;
  onRemoveNodeFromGroup: (node: Node) => void;
  onDeleteGroup: (groupId: string) => void;

  // collpase and expand
  onChangeNodeVisibleState: (nodeId: string, state: NodeVisibleState) => void;

  onConnect: OnConnect
  onConnectStart: OnConnectStart
  onConnectEnd: OnConnectEnd
  onEdgeUpdate: OnEdgeUpdateFunc;
  onEdgeUpdateStart: () => void;
  onEdgeUpdateEnd: (ev: any, edge: Edge, success: boolean) => void;
  onAddNode: (widget: Widget, pos: XYPosition) => PersistedWorkflowNode
  onAddSubflowNode: (workflow: PersistedFullWorkflow, pos: XYPosition) => PersistedWorkflowNode
  onDuplicateNodes: (ids: NodeId[]) => void
  onChangeSelectMode: (mode: SelectionMode) => void;
  onSelectNodes: (ids: string[]) => void;
  onChangeControlBoard: (config: ControlBoardConfig) => void;

  onSubmit: () => Promise<PromptResponse>
  undo: () => void;
  redo: () => void;
  onTransformStart: () => void;
  onTransformEnd: (transform: number) => void;
  onResetFromPersistedWorkflow: (workflow: PersistedWorkflowDocument) => Promise<void>
  onInit: (editorInstance?: ReactFlowInstance<any, any>) => Promise<void>
  onPasteNodes: (nodes: PersistedWorkflowNode[]) => void;
  onLoadWorkflow: (persisted: PersistedFullWorkflow) => void
  onExportWorkflow: () => void
  onNewClientId: (id: string) => void
  onNodeInProgress: (id: NodeId, progress: number) => void
  onImageSave: (id: NodeId, images: PreviewImage[]) => void
  onLoadImageWorkflow: (image: string) => void
  onChangeDragingAndResizingState: (val: boolean) => void;
  onUpdateWidgets: () => Promise<void>;
}

export const AppState = {
  getValueTypeOfNodeSlot(st: AppState, node: SDNode, handleId: string, handleType: "source" | "target"): string {
    let valueType = "";

    if (node.widget === SUBFLOW_WIDGET_TYPE_NAME) {
      const subflowState = st.subflowStore.getState();
      const slotInfo = subflowState.getSubflowNodeSlotInfo(node.flowId!, handleId, handleType)
      const sdnode = slotInfo.sdnode;
      const { slotName } = parseSubflowSlotId(handleId!);
      valueType = getValueTypeOfNodeSlot(sdnode, slotName, handleType!);
    } else {
      valueType = getValueTypeOfNodeSlot(node, handleId!, handleType!);
    }

    return valueType;
  },
  getValidConnections(state: AppState): Connection[] {
    return state.edges.flatMap((e) =>
      e.sourceHandle !== undefined && e.sourceHandle !== null && e.targetHandle !== undefined && e.targetHandle !== null
        ? [{ source: e.source, sourceHandle: e.sourceHandle, target: e.target, targetHandle: e.targetHandle }]
        : []
    )
  },
  addNode(state: AppState, widget: Widget, node: PersistedWorkflowNode): AppState {
    const maxZ = state.nodes
      .map((n) => n.zIndex ?? 0)
      .concat([0])
      .reduce((a, b) => Math.max(a, b))

    const stateNode = state.nodes.find(sn => sn.id == node.id);
    const seedFieldName = Widget.findSeedFieldName(widget);
    const nodeValue: SDNode = node.value;
    if (seedFieldName) {
      nodeValue.fields = {
        control_after_generated: ContrlAfterGeneratedValues.Incremental,
        ...nodeValue.fields,
      }
    }

    const width = node.dimensions?.width;
    const height = node.dimensions?.height;
    const item: Node = {
      id: node.id + "",
      data: {
        widget,
        value: nodeValue,
        dimensions: node.dimensions,
        position: node.position,
        visibleState: node.value.properties?.nodeVisibleState || NodeVisibleState.Expaned
      },
      selected: stateNode?.selected,
      position: node.position ?? { x: 0, y: 0 },
      width,
      height,
      parentNode: node.value.parent,
      type: NODE_IDENTIFIER,
      zIndex: maxZ + 1
    }

    if (widget.name === NODE_GROUP) {
      item.zIndex = -1;
      item.type = NODE_GROUP;
    }

    return {
      ...state,
      nodes: applyNodeChanges([{ type: 'add', item }], state.nodes),
      graph: {
        ...state.graph,
        [node.id]: {
          ...node.value,
          isPositive: false,
          isNegative: false,
          images: state.graph[node.id]?.images || node.images || [],
        }
      }
    }
  },
  addConnection(state: AppState, connection: PersistedWorkflowConnection): AppState {
    return { ...state, edges: addEdge(connection, state.edges) }
  },
  toPersisted(state: AppState): PersistedWorkflowDocument {
    const { doc } = state;
    return WorkflowDocumentUtils.toJson(doc);
  },
  persistUpdateDoc: (state: AppState, doc: Y.Doc) => {
    const workflowMap = doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    throttledUpdateDocument({
      ...state.persistedWorkflow!,
      last_edit_time: +new Date(),
      snapshot: workflow
    });
  },
  attatchStaticCheckErrors(state: AppState, promptError?: ComfyUIExecuteError): AppState {
    // check all nodes are valid;
    promptError = promptError || state.promptError;
    const workflowMap = state.doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    const widgets = state.widgets;
    const staticErrors = staticCheckWorkflowErrors(widgets, workflow);
    const ret: ComfyUIExecuteError = {
      ...promptError,
      node_errors: {
        ...promptError?.node_errors,
        ...staticErrors.node_errors,
      }
    }
    return {
      ...state,
      promptError: ret
    }
  }
}

export type AppStateSetter = (partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: boolean | undefined) => void;
export type AppStateGetter = () => AppState;