import {
  type Edge,
  type Node,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  type XYPosition,
  type Connection as FlowConnecton,
  OnEdgesDelete,
  applyEdgeChanges,
  OnEdgeUpdateFunc,
  OnConnectStart,
  OnConnectEnd,
  OnConnectStartParams,
  NodeChange,
  ReactFlowInstance,
} from 'reactflow';
import {
  type NodeId,
  type NodeInProgress,
  type PropertyKey,
  SDNode, Widget,
  type WidgetKey,
  NODE_IDENTIFIER,
  Connection,
  PreviewImage,
  UnknownWidget,
  ContrlAfterGeneratedValues,
  NODE_GROUP,
} from '../comfui-interfaces'

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void

import * as Y from "yjs";
import { WorkflowDocumentUtils, createNodeId } from './ydoc-utils';
import { PersistedFullWorkflow, PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, throttledUpdateDocument } from "../storage";
import { PromptResponse, createPrompt, sendPrompt } from '../comfyui-bridge/prompt';
import { create } from 'zustand'
import { getWidgetLibrary as getWidgets } from '../comfyui-bridge/bridge';
import {
  writeWorkflowToFile,
} from '../comfyui-bridge/export-import';

import { getBackendUrl } from '../config'
import exifr from 'exifr'

import { uuid } from '../utils';
import { SlotEvent } from '../utils/slot-event';
import { ComfyUIErrorTypes, ComfyUIExecuteError } from '../comfui-interfaces/comfy-error-types';
import { ComfyUIEvents } from '../comfui-interfaces/comfy-event-types';
import { comflowyConsoleClient } from '../utils/comflowy-console.client';
import { ControlBoardConfig } from '../workflow-editor/controlboard';

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
  connectingStartParams?: OnConnectStartParams & {valueType: string};

  resetWorkflowEvent: SlotEvent<any>;
  // document mutation handler
  onSyncFromYjsDoc: () => void;
  updateErrorCheck: () => void;
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onDeleteNodes: (changes: (Node | { id: string })[]) => void
  onEdgesDelete: OnEdgesDelete
  onNodeFieldChange: OnPropChange
  onNodeAttributeChange: (id: string, updates: Record<string, any>) => void
  onDocAttributeChange: (updates: Record<string, any>) => void

  onConnect: OnConnect
  onConnectStart: OnConnectStart
  onConnectEnd: OnConnectEnd
  onEdgeUpdate: OnEdgeUpdateFunc;
  onEdgeUpdateStart: () => void;
  onEdgeUpdateEnd: (ev: any, edge: Edge, success: boolean) => void;
  onAddNode: (widget: Widget, pos: XYPosition) => PersistedWorkflowNode
  onDuplicateNodes: (ids: NodeId[]) => void
  onChangeSelectMode: (mode: SelectionMode) => void;
  onSelectNodes: (ids: string[]) => void;
  onChangeControlBoard: (config: ControlBoardConfig) => void;

  nodeInProgress?: NodeInProgress
  promptError?: ComfyUIExecuteError
  previewedImageIndex?: number

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
        position: node.position
      },
      selected: stateNode?.selected,
      position: node.position ?? { x: 0, y: 0 },
      width,
      height,
      type: NODE_IDENTIFIER,
      zIndex: maxZ + 1,
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
  attatchStaticCheckErrors(state: AppState, error?: ComfyUIExecuteError): AppState {
    // check all nodes are valid;
    let flowError: ComfyUIExecuteError | undefined = error || state.promptError || {
      error: {
        message: ""
      },
      node_errors: {}
    }
    let findError = !!error;
    const workflowMap = state.doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    const widgets = state.widgets;
    Object.keys(workflow.nodes).forEach(id => {
      const node = workflow.nodes[id];
      const sdnode = node.value;
      const widget = widgets[sdnode.widget];
      const error = flowError!.node_errors[id] || { errors: [] };

      if (["Reroute", "PrimitiveNode"].indexOf(sdnode.widget) >= 0) {
        return;
      }

      // clean old errors 
      error.errors = error.errors.filter(err => {
        return err.type !== ComfyUIErrorTypes.widget_not_found && err.type !== ComfyUIErrorTypes.image_not_in_list;
      });

      // check widget exist
      if (!widget) {
        error.errors.push({
          type: ComfyUIErrorTypes.widget_not_found,
          message: `Widget \`${sdnode.widget}\` not found`,
          details: `${sdnode.widget}`,
          extra_info: {
            widget: sdnode.widget
          }
        });
        findError = true;
        flowError!.node_errors[id] = error as any;
      }

      if (widget && widget.name === "LoadImage") {
        const image = sdnode.fields.image;
        const options = widget.input.required.image[0] as [string];
        const parsedImage = image.split('/');
        // if parsedImage length > 1 , it is a image from temporary storage
        if (options.indexOf(image) < 0 && parsedImage.length === 1) {
          error.errors.push({
            type: ComfyUIErrorTypes.image_not_in_list,
            message: `Image ${image} not in list`,
            details: `[ ${options.join(", ")} ]`,
          });
          findError = true;
          flowError!.node_errors[id] = error;
        }
      }
    });

    if (!findError) {
      flowError = undefined;
    } else {
      console.log("final Error", flowError);
    }

    return  {
      ...state,
      promptError: flowError
    }
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  transform: 1, 
  transforming: false,
  persistedWorkflow: null,
  doc: new Y.Doc(),
  editorEvent: new SlotEvent<EditorEvent>(),
  resetWorkflowEvent: new SlotEvent<any>(),
  graph: {},
  nodes: [],
  edges: [],
  unknownWidgets: new Set<string>(),

  // temporary state
  slectionMode: "default",
  nodeSelection: [],
  edgeSelection: [],
  draggingAndResizing: false,
  isConnecting: false,

  // properties
  counter: 0,
  widgets: {},
  widgetCategory: {},

  onTransformStart: () => {
    set({
      transforming: true
    })
  },

  onTransformEnd: (transform:number) => {
    set({
      transform,
      transforming: false
    })
  },

  undo: () => {
    const st = get();
    const { undoManager } = st;
    if (undoManager && undoManager.canUndo()) {
      undoManager.undo();
      st.onSyncFromYjsDoc();
    }
  },
  redo: () => {
    const st = get();
    const { undoManager } = st;
    if (undoManager && undoManager.canRedo()) {
      undoManager.redo();
      st.onSyncFromYjsDoc();
    }
  },

  /**
   * AppStore Initialization Entry 
   */
  onInit: async (editorInstance?: ReactFlowInstance<any, any>) => {
    const widgets = await getWidgets();
    const widgetCategory = generateWidgetCategories(widgets);
    console.log("widgets", widgets);
    set({ 
      widgets, 
      widgetCategory
    })
    if (editorInstance) {
      set({
        editorInstance
      })
    }
  },
  onUpdateWidgets: async () => {
    const widgets = await getWidgets();
    const widgetCategory = generateWidgetCategories(widgets);
    set({ 
      widgets, 
      widgetCategory
    })
  },
  /**
   * Sync nodes and edges state from YJS Doc
   * for uno & redo, reload , load operations
   */
  onSyncFromYjsDoc: () => {
    set((st) => {
      const workflowMap = st.doc.getMap("workflow");
      const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
      const unknownWidgets = new Set<string>();
      throttledUpdateDocument({
        ...st.persistedWorkflow!,
        last_edit_time: +new Date(),
        snapshot: workflow
      });

      let state: AppState = { 
        ...st, 
        nodes: [], 
        edges: [],
        controlboard: workflow.controlboard
      }

      for (const [key, node] of Object.entries(workflow.nodes)) {
        const widget = state.widgets[node.value.widget]
        if (widget !== undefined) {
          state = AppState.addNode(state, widget, node);
        } else {
          state = AppState.addNode(state, {
            ...UnknownWidget,
            name: node.value.widget,
            display_name: node.value.widget
          }, node);
          unknownWidgets.add(node.value.widget);
          // console.log(`Unknown widget ${node.value.widget}`)
        }
      }

      for (const connection of workflow.connections) {
        state = AppState.addConnection(state, connection)
      }

      /**
       * Check is postive or is negative connection, and update graph
       */
      for (const connection of workflow.connections) {
        const sourceNode = state.graph[connection.source];
        const targetNode = state.graph[connection.target];
        const sourceOutputs = sourceNode.outputs;
        const targetInputs = targetNode.inputs;
        const output = sourceOutputs.find(output => output.name.toUpperCase() === connection.sourceHandle);
        const input = targetInputs.find(input => input.name.toUpperCase() === connection.targetHandle);
        const sourceGraphNode = state.graph[connection.source];
        if (output && input) {
          if (output.type === "CONDITIONING") {
            if (input.name === "negative") {
              sourceGraphNode.isNegative = true;
            } else if (input.name === "positive") {
              sourceGraphNode.isPositive = true;
            }
          }
        }
      }
      return {
        ...state,
        unknownWidgets
      }
    }, true)
  },
  /**
   * Mutation actions
   * @param changes 
   */
  onNodesChange: (changes) => {
    set((st) => {
      const nodes = applyNodeChanges(changes, st.nodes)
      changes.forEach(change => {
        if (change.type === "dimensions") {
          const node = nodes.find(node => node.id === change.id);
          const {dimensions} = change
          if (node && dimensions) {
            node.data.dimensions = dimensions
          }
        }
      });
      return {
        nodes
      }
    })
    const st = get();
    const {doc} = st;
    WorkflowDocumentUtils.onNodesChange(doc, changes);
    AppState.persistUpdateDoc(st, doc)
  },
  onChangeControlBoard: (config: ControlBoardConfig) => {
    set((st) => {
      return {
        ...st,
        controlboard: config
      }
    })
    const st = get();
    const {doc} = st;
    WorkflowDocumentUtils.updateControlBoard(doc, config);
    AppState.persistUpdateDoc(st, doc)
  },
  onChangeDragingAndResizingState: (value: boolean) => {
    set({ draggingAndResizing: value })
  },
  onConnect: (connection: FlowConnecton) => {
    console.log("on connect", connection);
    const [validate, message] = validateEdge(get(), connection);
    if (!validate) {
      console.log("validate failed", message);
      return;
    }
    // remove old edge if exist
    // connect new edge
    const st = get();
    const { doc, onSyncFromYjsDoc } = st;
    const oldEdge = st.edges.find(edge => {
      return (
        edge.target === connection.target && 
        edge.targetHandle === connection.targetHandle
      )
    });
    if (oldEdge) {
      WorkflowDocumentUtils.onEdgesDelete(doc, [oldEdge.id]);
    }
    WorkflowDocumentUtils.addConnection(doc, connection);
    AppState.persistUpdateDoc(st, doc)
    onSyncFromYjsDoc();
  },
  onEdgesChange: (changes) => {
    console.log("on edge change", changes);
    set((st) => ({ edges: applyEdgeChanges(changes, st.edges) }))
    // all edge changes are catched in other methods
    // const st = get();
    // const { doc } = st;
    // WorkflowDocumentUtils.onEdgesChange(doc, changes);
    // AppState.persistUpdateDoc(st, doc)
  },
  onEdgeUpdateStart: ()=> {
    console.log("on Edge Update Start");
  },
  onEdgeUpdate: (oldEdge: Edge, newConnection: FlowConnecton) => {
    console.log("on Edge Update", oldEdge, newConnection);
    const [validate, message] = validateEdge(get(), newConnection);
    if (!validate) {
      console.log("validate failed", message);
      return;
    }

    const st = get();
    const { doc, onSyncFromYjsDoc } = st;

    WorkflowDocumentUtils.onEdgeUpdate(doc, oldEdge, newConnection);

    onSyncFromYjsDoc();
  },
  onEdgeUpdateEnd: (ev: any, edge: Edge, success: boolean) => {
    console.log("on Edge Update End", edge);
  },
  onConnectStart: (ev, params: OnConnectStartParams) => {
    console.log("on connect start", params);
    const st = get();
    if (!params.nodeId) {
      return;
    }

    const node = st.graph[params.nodeId];
    let valueType = "";
    if (params.handleType === "source") {
      const output = node.outputs.find(output => output.name.toUpperCase() === params.handleId);
      if (output) {
        valueType = output.type;
      }
    } else {
      const input = node.inputs.find(input => input.name.toUpperCase() === params.handleId);
      if (input) {
        valueType = input.type;
      }
    }
    set({ connectingStartParams: {
      ...params,
      valueType
    }, isConnecting: true })
  },
  onConnectEnd: (ev) => {
    console.log("on connect end");
    set({ isConnecting: false, connectingStartParams: undefined })
  },
  onDeleteNodes: (changes: (Node | {id: string})[]) => {
    console.log("on Node Delete");
    const { doc, onSyncFromYjsDoc, } = get();
    WorkflowDocumentUtils.onDeleteNodes(doc, changes.map(node => node.id));
    onSyncFromYjsDoc();
  },
  onEdgesDelete: (changes: Edge[]) => {
    console.log("on Edge Delete");
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onEdgesDelete(doc, changes.map(edge => edge.id));
    onSyncFromYjsDoc();
  },
  onNodeFieldChange: (id, key, value) => {
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onNodeFieldChange(doc, {
      id,
      key,
      value
    });
    onSyncFromYjsDoc();
    set(AppState.attatchStaticCheckErrors(get()));
  },
  onNodeAttributeChange: (id: string, updates) => {
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onNodeAttributeChange(doc, {
      id,
      updates
    });
    onSyncFromYjsDoc();
  },
  onAddNode: (widget: Widget, position: XYPosition) => {
    const node = SDNode.fromWidget(widget);
    const { doc, onSyncFromYjsDoc } = get();
    const persistNode = {
      id: createNodeId(),
      position,
      dimensions: {
        width: 240,
        height: 80
      },
      value: node
    }

    WorkflowDocumentUtils.onNodesAdd(doc, [persistNode]);
    onSyncFromYjsDoc();
    return persistNode
  },
  onDuplicateNodes: (ids) => {
    console.log("on duplicated nodes")
    const st = get();
    const newItems = ids.map(id => {
      const item = st.graph[id]
      const node = st.nodes.find((n) => n.id === id)
      const position = node?.position
      const moved = position !== undefined ? { ...position, y: position.y + 100 } : { x: 0, y: 0 }
      return {
        id: "node-" + uuid(),
        selected: true,
        position: moved,
        dimensions: node?.data.dimensions,
        value: item
      }
    })
    const doc = st.doc;
    WorkflowDocumentUtils.onNodesAdd(doc, newItems);
    st.onSyncFromYjsDoc();
    st.onSelectNodes(newItems.map(item => item.id));
  },
  onPasteNodes: (nodes: PersistedWorkflowNode[]) => {
    const st = get();
    const doc = st.doc;
    WorkflowDocumentUtils.onNodesAdd(doc, nodes);
    st.onSyncFromYjsDoc();
    st.onSelectNodes(nodes.map(item => item.id));
  },
  onSelectNodes: (ids: string[]) => {
    const changes: NodeChange[] = ids.map((id) => ({ id, selected: true , type: "select"}));
    get().onNodesChange(changes);
  },
  /**
   * Workflow load & persisted
   * @param workflow 
   */
  onLoadWorkflow: (workflow) => {
    const st = get();
    const doc = WorkflowDocumentUtils.fromJson({
      id: workflow.id,
      title: workflow.title,
      nodes: workflow.snapshot.nodes,
      connections: workflow.snapshot.connections
    });
    console.log("load workflow", workflow);
    set(st => {
      return {
        ...st,
        persistedWorkflow: workflow,
        undoManager: new Y.UndoManager(doc.getMap("workflow")),
        doc,
      }
    });
    st.onSyncFromYjsDoc();

    set(AppState.attatchStaticCheckErrors(get()));
  },
  updateErrorCheck: () => {
    set(AppState.attatchStaticCheckErrors(get()));
  },
  /**
   * reset workflow from another document
   * @param workflow 
   */
  onResetFromPersistedWorkflow: async (workflow: PersistedWorkflowDocument): Promise<void> => {
    console.log("Reset workflow", workflow);
    
    set({
      nodes: [],
      edges: [],
      graph: {},
    });

    setTimeout(() => {
      const st = get();
      WorkflowDocumentUtils.updateByJson(st.doc, workflow)
      st.onSyncFromYjsDoc();
      set(AppState.attatchStaticCheckErrors(get()));
    }, 10);
  },
  onExportWorkflow: () => {
    writeWorkflowToFile(AppState.toPersisted(get()))
  },
  onSubmit: async () => {
    const state = get();
    const docJson = WorkflowDocumentUtils.toJson(state.doc);
    const prompt = createPrompt(docJson, state.widgets, state.clientId);
    const res = await sendPrompt(prompt);

    // update control_after_generated node
    const onNodeFieldChange = state.onNodeFieldChange;
    const MAX_VALUE = 18446744073709551615;
    state.nodes.forEach(node => {
      const widget = node.data.widget as Widget;
      const sdnode = node.data.value as SDNode;
      const seedFieldName = Widget.findSeedFieldName(widget);
      if (seedFieldName) {
        const control_after_generated = sdnode.fields.control_after_generated;
        const oldSeed = sdnode.fields[seedFieldName];
        let newSeed = oldSeed;
        switch (control_after_generated) {
          case "randomnized":
          case ContrlAfterGeneratedValues.Randomnized:
            newSeed = Math.random() * MAX_VALUE;
            break;
          case ContrlAfterGeneratedValues.Incremental:
            newSeed = Math.min(MAX_VALUE, oldSeed + 1);
            break;
          case ContrlAfterGeneratedValues.Decremental:
            newSeed = Math.max(-1, oldSeed - 1);
          default:
            break;
        }
        onNodeFieldChange(node.id, seedFieldName, newSeed);
      }
    });

    const newState = AppState.attatchStaticCheckErrors(get(), res.error)
    set(newState);
    if (newState.promptError?.error || newState.promptError?.node_errors) {
      comflowyConsoleClient.comfyuiExecuteError(docJson, newState.promptError);
    }

    return res
  },
  onNewClientId: (id) => {
    set({ clientId: id })
  },
  onNodeInProgress: (id, progress) => {
    set({ nodeInProgress: { id, progress } })
  },
  onImageSave: (id, images) => {
    const nodes = get().nodes; 
    const node = nodes.find(node => node.id === id);
    // preview image and other temp state
    if (!node || node?.data?.widget.name !== "SaveImage") {
      set((st) => ({
        graph: {
          ...st.graph,
          [id]: { ...st.graph[id], images },
        },
      }))
      return;
    }
    
    // presistent save image to gallery
    console.log("saved image", node, images);
    const last_edit_time = +new Date();
    // sync to state
    set((st) => ({
      persistedWorkflow: {
        ...st.persistedWorkflow!,
        last_edit_time,
        gallery: [
          ...st.persistedWorkflow?.gallery || [],
          ...images.reverse() || []
        ].reverse()
      },
      graph: {
        ...st.graph,
        [id]: { ...st.graph[id], images },
      },
    }))

    // sync to storage
    const st = get();
    st.editorEvent.emit({
      type: ComfyUIEvents.ImageSave,
      data: {
        id,
        images
      }
    });
    WorkflowDocumentUtils.onImageSave(get().doc, id, images);
    const workflowMap = st.doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    throttledUpdateDocument({
      ...st.persistedWorkflow!,
      last_edit_time,
      gallery: [
        ...st.persistedWorkflow?.gallery || [],
        ...images.reverse() || []
      ].reverse(),
      snapshot: workflow
    });
  },
  onLoadImageWorkflow: (image) => {
    void exifr.parse(getBackendUrl(`/view/${image}`)).then((res) => {
      get().onLoadWorkflow(JSON.parse(res.workflow))
    })
  },
  onChangeSelectMode: (mode: SelectionMode) => {
    set({ slectionMode: mode })
  },
  onDocAttributeChange: (updates: any) => {
    const last_edit_time = +new Date();
    set((st) => ({
      persistedWorkflow: {
        ...st.persistedWorkflow,
        ...updates,
        last_edit_time: +new Date(),
      }
    }));
    const st = get();
    throttledUpdateDocument({
      ...st.persistedWorkflow!,
      ...updates,
      last_edit_time,
    });
  }
}));


/**
 * Code generated by GPT
 * @param widgets 
 * @returns 
 */
function generateWidgetCategories(widgets: Record<string, Widget>) {
  const categories = {};

  Object.keys(widgets).forEach((key) => {
    const widget = widgets[key];
    const categoryPath = widget.category.split('/');

    let currentCategory: any = categories;

    categoryPath.forEach((category, index) => {
      if (!currentCategory[category]) {
        currentCategory[category] = {};
      }

      if (index === categoryPath.length - 1) {
        currentCategory[category][key] = widget;
      }

      currentCategory = currentCategory[category];
    });
  });

  return categories;
};

export function validateEdge(st: AppState, connection: FlowConnecton): [boolean, string] {
  const { source, sourceHandle, target, targetHandle} = connection;
  if (!source || !target) {
    return [false, "source or target is null"];
  }

  if (st.edges.find(edge => 
    edge.source === source && 
    edge.sourceHandle === sourceHandle && 
    edge.target === target && 
    edge.targetHandle === targetHandle)) {
    return [false, "edge already exist"];
  }

  const sourceNode = st.graph[source];
  const targetNode = st.graph[target];
  const sourceOutputs = sourceNode.outputs;
  const targetInputs = targetNode.inputs;

  const output = sourceOutputs.find(output => output.name.toUpperCase() === sourceHandle);
  const input = targetInputs.find(input => input.name.toUpperCase() === targetHandle);
  // console.log(sourceNode, targetNode, sourceOutputs, targetInputs, output, input, sourceHandle, targetHandle);

  if (!output || !input) {
    return [false, "output or input is null"];
  }

  if (output.type !== input.type) {
    return [false, "output type and input type not match"];
  }

  return [true, "success"];
}


const PINNED_WIDGET_KEY = "pinnedWidgets";
export function getPinnedWidgetsFromLocalStorage(): string[] {
  try {
    const rawData = localStorage.getItem(PINNED_WIDGET_KEY);
    if (rawData) {
      return JSON.parse(rawData);
    }
  } catch (err) {
    console.log("parse pinned widget error", err);
  }
  return  []
}

export function setPinnedWidgetsToLocalStorage(pinnedWidgets: string[]) {
  try {
    localStorage.setItem(PINNED_WIDGET_KEY, JSON.stringify(pinnedWidgets));
  } catch (err) {
    console.log("set pinned widget error", err);
  }
}