import * as Y from "yjs";
import { type Edge, type Node, type OnNodesChange, type OnEdgesChange, type OnConnect, type XYPosition, type Connection as FlowConnecton, addEdge, applyNodeChanges, OnEdgesDelete, OnEdgeUpdateFunc, OnConnectStart, OnConnectEnd, OnConnectStartParams, ReactFlowInstance, EdgeTypes} from 'reactflow';
import { WorkflowDocumentUtils } from '../ydoc-utils';
import { type NodeId, type NodeInProgress, type PropertyKey, SDNode, Widget, type WidgetKey, NODE_IDENTIFIER, Connection, PreviewImage, UnknownWidget, ContrlAfterGeneratedValues, NODE_GROUP, PersistedFullWorkflow, PersistedWorkflowNode, PersistedWorkflowDocument, PersistedWorkflowConnection, SUBFLOW_WIDGET_TYPE_NAME, parseSubflowSlotId, NodeVisibleState, ComfyUIErrorTypes } from '../../types'
import { throttledUpdateDocument } from "../../storage";
import { PromptResponse } from '../../comfyui-bridge/prompt';
import { SlotEvent } from '../../utils/slot-event';
import { ComfyUIExecuteError } from '../../types';
import { ControlBoardConfig } from '../../types';
import { SubflowStoreType } from "../subflow-state";
import { staticCheckWorkflowErrors } from "../../workflow-editor/parse-workflow-errors";
import { getValueTypeOfNodeSlot } from "../../utils/workflow";
import _ from "lodash";

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void
export type SelectionMode = "figma" | "default";
export type EdgeType = "straight" | "step" | "smoothstep" | "bezier";
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
  edgeType: EdgeType
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
  graph: Record<NodeId, (SDNode & {id: string, flowNode: Node})>
  widgets: Record<WidgetKey, Widget>
  widgetCategory: any;
  draggingAndResizing: boolean;
  isConnecting: boolean;
  connectingStartParams?: OnConnectStartParams & { valueType: string };
  resetWorkflowEvent: SlotEvent<any>;
  nodeInProgress?: NodeInProgress
  promptError?: ComfyUIExecuteError
  previewedImageIndex?: number
  blobPreview?: { blobUrl: string, nodeId: string }

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

  // bypass node
  onChangeNodeBypass: (nodeId: string, bypass: boolean) => void;

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
  onChangeEdgeType: (type: EdgeType) => void;
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
  onNodeInProgress: (id: NodeId | undefined, progress?: number) => void
  onImageSave: (id: NodeId, images: PreviewImage[]) => void
  onBlobPreview: (id: NodeId, blobUrl: string) => void;
  onLoadImageWorkflow: (image: string) => void
  onChangeDragingAndResizingState: (val: boolean) => void;
  onUpdateWidgets: () => Promise<void>;
  onUpdateGallery: (images: PreviewImage[]) => void;
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
        visibleState: node.value.properties?.nodeVisibleState || NodeVisibleState.Expaned,
        children: []
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
        [item.id]: {
          ...node.value,
          id: item.id,
          isPositive: false,
          isNegative: false,
          images: state.graph[node.id]?.images || node.images || [],
          flowNode: item
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

    // remove all ComfyUIErrorTypes.widget_not_found type errors in prompt.node_errors,
    // because these errors will be update in next step
    const node_errors = promptError?.node_errors || {};
    for (const nodeId in node_errors) {
      const nodeError = node_errors[nodeId];
      if (nodeError.errors) {
        nodeError.errors = nodeError.errors.filter(err => err.type !== ComfyUIErrorTypes.widget_not_found);
      }
      if (!nodeError.errors || nodeError.errors.length === 0) {
        delete node_errors[nodeId];
      }
    }

    const staticErrors = staticCheckWorkflowErrors(widgets, workflow);

    // mix staticErrors and old node_errors
    for (const nodeId in staticErrors.node_errors) {
      if (node_errors[nodeId]) {
        node_errors[nodeId].errors = node_errors[nodeId].errors.concat(staticErrors.node_errors[nodeId].errors);
      } else {
        node_errors[nodeId] = staticErrors.node_errors[nodeId];
      }
    }

    const ret: ComfyUIExecuteError = {
      ...promptError,
      node_errors
    }

    return {
      ...state,
      promptError: ret
    }
  }
}

export type AppStateSetter = (partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: boolean | undefined) => void;
export type AppStateGetter = () => AppState;