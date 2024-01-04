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
} from '../comfui-interfaces'

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void

import * as Y from "yjs";
import { WorkflowDocumentUtils, createNodeId } from './ydoc-utils';
import { PersistedFullWorkflow, PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, throttledUpdateDocument } from "../storage";

import { create } from 'zustand'
import { PromptResponse, createPrompt, getWidgetLibrary as getWidgets, sendPrompt } from '../comfyui-bridge/bridge';
import {
  writeWorkflowToFile,
} from '../comfyui-bridge/export-import';

import { getBackendUrl } from '../config'
import exifr from 'exifr'

import { uuid } from '../utils';

export type SelectionMode = "figma" | "default";
export interface AppState {
  counter: number
  clientId?: string
  slectionMode: SelectionMode
  // full workflow meta in storage
  persistedWorkflow: PersistedFullWorkflow | null;

  // workflow document store in yjs for undo redp
  doc: Y.Doc;
  undoManager?: Y.UndoManager;

  // editor state for rendering, update from Y.Doc
  nodes: Node[]
  edges: Edge[]
  graph: Record<NodeId, SDNode>
  widgets: Record<WidgetKey, Widget>
  widgetCategory: any;
  draggingAndResizing: boolean;
  isConnecting: boolean;
  connectingStartParams?: OnConnectStartParams & {valueType: string};

  // document mutation handler
  onSyncFromYjsDoc: () => void;
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
  onEdgeUpdateEnd: (ev: any, edge: Edge) => void;
  onAddNode: (widget: Widget, pos: XYPosition) => void
  onDuplicateNodes: (ids: NodeId[]) => void
  onChangeSelectMode: (mode: SelectionMode) => void;
  onSelectNodes: (ids: string[]) => void;

  nodeInProgress?: NodeInProgress
  promptError?: string
  previewedImageIndex?: number

  onSubmit: () => Promise<PromptResponse>
  onResetFromPersistedWorkflow: (workflow: PersistedWorkflowDocument) => Promise<void>
  onInit: () => Promise<void>
  onLoadWorkflow: (persisted: PersistedFullWorkflow) => void
  onExportWorkflow: () => void
  onNewClientId: (id: string) => void
  onNodeInProgress: (id: NodeId, progress: number) => void
  onImageSave: (id: NodeId, images: PreviewImage[]) => void
  onLoadImageWorkflow: (image: string) => void
  onChangeDragingAndResizingState: (val: boolean) => void;
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
        value: nodeValue
      },
      selected: stateNode?.selected,
      position: node.position ?? { x: 0, y: 0 },
      width,
      height,
      style: {
        width,
        height
      },
      type: NODE_IDENTIFIER,
      zIndex: maxZ + 1,
    }
    return {
      ...state,
      nodes: applyNodeChanges([{ type: 'add', item }], state.nodes),
      graph: {
        ...state.graph,
        [node.id]: {
          ...node.value,
          images: state.graph[node.id]?.images || node.images || [],
        }
      }
    }
  },
  addConnection(state: AppState, connection: PersistedWorkflowConnection): AppState {
    const stateConnection = state.edges.find(edge => edge.id === connection.id);
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
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  persistedWorkflow: null,
  doc: new Y.Doc(),
  graph: {},
  nodes: [],
  edges: [],

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

  /**
   * AppStore Initialization Entry 
   */
  onInit: async () => {
    const widgets = await getWidgets()
    const widgetCategory = generateWidgetCategories(widgets);
    console.log("widgets", widgets);
    set({ widgets, widgetCategory })
  },
  /**
   * Sync nodes and edges state from YJS Doc
   * for uno & redo, reload , load operations
   */
  onSyncFromYjsDoc: () => {
    set((st) => {
      const workflowMap = st.doc.getMap("workflow");
      const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;

      throttledUpdateDocument({
        ...st.persistedWorkflow!,
        last_edit_time: +new Date(),
        snapshot: workflow
      });

      let state: AppState = { ...st, nodes: [], edges: [] }
      for (const [key, node] of Object.entries(workflow.nodes)) {
        const widget = state.widgets[node.value.widget]
        if (widget !== undefined) {
          state = AppState.addNode(state, widget, node);
        } else {
          state = AppState.addNode(state, {
            ...UnknownWidget,
            name: node.value.widget
          }, node);
          console.log(`Unknown widget ${node.value.widget}`)
        }
      }
      for (const connection of workflow.connections) {
        state = AppState.addConnection(state, connection)
      }
      return {
        ...state,
      }
    }, true)
  },
  /**
   * Mutation actions
   * @param changes 
   */
  onNodesChange: (changes) => {
    set((st) => {
      return {
        nodes: applyNodeChanges(changes, st.nodes)
      }
    })
    const st = get();
    const {doc} = st;
    WorkflowDocumentUtils.onNodesChange(doc, changes);
    AppState.persistUpdateDoc(st, doc)
  },
  onChangeDragingAndResizingState: (value: boolean) => {
    set({ draggingAndResizing: value })
  },
  onConnect: (connection: FlowConnecton) => {
    console.log("on connect");
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
    const st = get();
    const { doc } = st;
    WorkflowDocumentUtils.onEdgesChange(doc, changes);
    AppState.persistUpdateDoc(st, doc)
  },
  onEdgeUpdateStart: ()=> {
    console.log("on Edge Update Start");
  },
  onEdgeUpdate: (oldEdge: Edge, newConnection: FlowConnecton) => {
    console.log("on Edge Update");
    const [validate, message] = validateEdge(get(), newConnection);
    if (!validate) {
      console.log("validate failed", message);
      return;
    }

    const st = get();
    const { doc, onSyncFromYjsDoc } = st;

    const oldConnectEdge = st.edges.find(edge => {
      return (
        edge.target === newConnection.target &&
        edge.targetHandle === newConnection.targetHandle
      )
    });
    if (oldConnectEdge) {
      WorkflowDocumentUtils.onEdgesDelete(doc, [oldConnectEdge.id]);
    }
    WorkflowDocumentUtils.onEdgeUpdate(doc, oldEdge, newConnection);

    onSyncFromYjsDoc();
  },
  onEdgeUpdateEnd: (ev: any, edge: Edge) => {
    console.log("on Edge Update End");
  },
  onConnectStart: (ev, params: OnConnectStartParams) => {
    console.log("on connect start");
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
    WorkflowDocumentUtils.onNodesAdd(doc, [{
      id: createNodeId(),
      position,
      value: node
    }]);
    onSyncFromYjsDoc();
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
        value: item
      }
    })
    const doc = st.doc;
    WorkflowDocumentUtils.onNodesAdd(doc, newItems);
    st.onSyncFromYjsDoc();
    st.onSelectNodes(newItems.map(item => item.id));
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
  },
  /**
   * reset workflow from another document
   * @param workflow 
   */
  onResetFromPersistedWorkflow: async (workflow: PersistedWorkflowDocument): Promise<void> => {
    const st = get();
    WorkflowDocumentUtils.updateByJson(st.doc, workflow)
    st.onSyncFromYjsDoc();
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

    console.log("prompt response:", res);
    set({ promptError: res.error })
    return res
  },
  onNewClientId: (id) => {
    set({ clientId: id })
  },
  onNodeInProgress: (id, progress) => {
    set({ nodeInProgress: { id, progress } })
  },
  onImageSave: (id, images) => {
    const last_edit_time = +new Date();

    // sync to state
    set((st) => ({
      persistedWorkflow: {
        ...st.persistedWorkflow!,
        last_edit_time,
        gallery: [
          ...st.persistedWorkflow?.gallery || [],
          ...images || []
        ].reverse()
      },
      graph: {
        ...st.graph,
        [id]: { ...st.graph[id], images },
      },
    }))

    // sync to storage
    const st = get();
    WorkflowDocumentUtils.onImageSave(get().doc, id, images);
    const workflowMap = st.doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    throttledUpdateDocument({
      ...st.persistedWorkflow!,
      last_edit_time,
      gallery: [
        ...st.persistedWorkflow?.gallery || [],
        ...images || []
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