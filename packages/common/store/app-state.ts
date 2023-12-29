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
  OnNodesDelete,
  OnEdgesDelete,
  applyEdgeChanges,
  updateEdge,
  OnEdgeUpdateFunc,
  OnConnectStart,
  OnConnectEnd,
  OnConnectStartParams,
} from 'reactflow';
import {
  type QueueItem,
  type NodeId,
  type NodeInProgress,
  type PropertyKey,
  SDNode,
  type Widget,
  type WidgetKey,
  NODE_IDENTIFIER,
  Connection,
  PreviewImage,
  UnknownWidget,
  Queue
} from '../comfui-interfaces'

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void

import * as Y from "yjs";
import { TemporaryNodeState, WorkflowDocumentUtils, createNodeId } from './ydoc-utils';
import { DocumentDatabase, PersistedFullWorkflow, PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, documentDatabaseInstance, retrieveLocalWorkflow, saveLocalWorkflow, throttledUpdateDocument } from "../local-storage";

import { create } from 'zustand'
import { PromptResponse, createPrompt, deleteFromQueue, getQueueApi, getWidgetLibrary as getWidgets, sendPrompt } from '../comfyui-bridge/bridge';
import {
  writeWorkflowToFile,
} from '../comfyui-bridge/export-import';

import { getBackendUrl } from '../config'
import exifr from 'exifr'

import { uuid } from '../utils';
import { validate } from 'uuid';

export interface AppState {
  counter: number
  clientId?: string

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
  connectingStartParams?: OnConnectStartParams;

  // document mutation handler
  onSyncFromYjsDoc: () => void;
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onNodesDelete: OnNodesDelete
  onEdgesDelete: OnEdgesDelete
  onPropChange: OnPropChange

  onConnect: OnConnect
  onConnectStart: OnConnectStart
  onConnectEnd: OnConnectEnd
  onEdgeUpdate: OnEdgeUpdateFunc;
  onEdgeUpdateStart: () => void;
  onEdgeUpdateEnd: (ev: any, edge: Edge) => void;
  onAddNode: (widget: Widget, pos: XYPosition) => void
  onDuplicateNode: (id: NodeId) => void

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
    const item: Node = {
      id: node.id + "",
      data: {
        widget,
        value: node.value
      },
      selected: stateNode?.selected,
      position: node.position ?? { x: 0, y: 0 },
      width: node.dimensions?.width,
      height: node.dimensions?.height,
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
    set((st) => ({edges: addEdge(connection, st.edges)}))
    const st = get();
    const { doc } = st;
    WorkflowDocumentUtils.addConnection(doc, connection);
    AppState.persistUpdateDoc(st, doc)
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

    set((st) => ({ edges: updateEdge(oldEdge, newConnection, st.edges)}))
    const st = get();
    const { doc } = st;
    WorkflowDocumentUtils.onEdgeUpdate(doc, oldEdge, newConnection);
    AppState.persistUpdateDoc(st, doc)
  },
  onEdgeUpdateEnd: (ev: any, edge: Edge) => {
    console.log("on Edge Update End");
  },
  onConnectStart: (ev, params: OnConnectStartParams) => {
    console.log("on connect start");
    set({ connectingStartParams: params, isConnecting: true })
  },
  onConnectEnd: (ev) => {
    console.log("on connect end");
    set({ isConnecting: false, connectingStartParams: undefined })
  },
  onNodesDelete: (changes: Node[]) => {
    console.log("on Node Delete");
    const { doc, onSyncFromYjsDoc, } = get();
    WorkflowDocumentUtils.onNodesDelete(doc, changes.map(node => node.id));
    onSyncFromYjsDoc();
  },
  onEdgesDelete: (changes: Edge[]) => {
    console.log("on Edge Delete");
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onEdgesDelete(doc, changes.map(edge => edge.id));
    onSyncFromYjsDoc();
  },
  onPropChange: (id, key, value) => {
    console.log("change prop", id, key, value);
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onPropChange(doc, {
      id,
      key,
      value
    });
    onSyncFromYjsDoc();
  },
  onAddNode: (widget: Widget, position: XYPosition) => {
    console.log("on Add Node");
    const node = SDNode.fromWidget(widget);
    console.log("add node")
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onNodesAdd(doc, [{
      id: createNodeId(),
      position,
      value: node
    }]);
    onSyncFromYjsDoc();
  },
  onDuplicateNode: (id) => {
    console.log("on duplicated node")
    const st = get();
    const item = st.graph[id]
    const node = st.nodes.find((n) => n.id === id)
    const position = node?.position
    const moved = position !== undefined ? { ...position, y: position.y + 100 } : { x: 0, y: 0 }
    const doc = st.doc;
    WorkflowDocumentUtils.onNodesAdd(doc, [{
      id: "node-" + uuid(),
      position: moved,
      value: item
    }])
    st.onSyncFromYjsDoc();
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
    // sync to state
    set((st) => ({
      ...st,
      persistedWorkflow: {
        ...st.persistedWorkflow!,
        gallery: [
          ...st.persistedWorkflow?.gallery || [],
          ...images || []
        ]
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
      last_edit_time: +new Date(),
      gallery: [
        ...st.persistedWorkflow?.gallery || [],
        ...images || []
      ],
      snapshot: workflow
    });
  },
  onLoadImageWorkflow: (image) => {
    void exifr.parse(getBackendUrl(`/view/${image}`)).then((res) => {
      get().onLoadWorkflow(JSON.parse(res.workflow))
    })
  },
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

  const sourceNode = st.graph[source];
  const targetNode = st.graph[target];
  const sourceOutputs = sourceNode.outputs;
  const targetInputs = targetNode.inputs;

  const output = sourceOutputs.find(output => output.name === sourceHandle);
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