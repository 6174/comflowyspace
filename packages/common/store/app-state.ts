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
  Dimensions,
  NodeChange,
  applyEdgeChanges,
} from 'reactflow';
import {
  type GalleryItem,
  type QueueItem,
  type NodeId,
  type NodeInProgress,
  type PropertyKey,
  SDNode,
  type Widget,
  type WidgetKey,
  NODE_IDENTIFIER,
  Connection,
  PreviewImage
} from '../comfui-interfaces'

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void

import * as Y from "yjs";
import { TemporaryNodeState, WorkflowDocumentUtils, createNodeId } from './ydoc-utils';
import { DocumentDatabase, PersistedFullWorkflow, PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, documentDatabaseInstance, retrieveLocalWorkflow, saveLocalWorkflow, throttledUpdateDocument } from "../local-storage";

import { create } from 'zustand'
import { createPrompt, deleteFromQueue, getQueue, getWidgetLibrary as getWidgets, sendPrompt } from '../comfyui-bridge/bridge';
import {
  writeWorkflowToFile,
} from '../comfyui-bridge/export-import';

import { getBackendUrl } from '../config'
import exifr from 'exifr'

import { uuid } from '../utils';

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

  // document mutation handler
  onSyncFromYjsDoc: () => void;
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onNodesDelete: OnNodesDelete
  onEdgesDelete: OnEdgesDelete
  onPropChange: OnPropChange
  onAddNode: (widget: Widget, pos: XYPosition) => void
  onDuplicateNode: (id: NodeId) => void

  // job queue
  queue: QueueItem[]

  // gallery
  gallery: GalleryItem[]

  nodeInProgress?: NodeInProgress
  promptError?: string
  previewedImageIndex?: number
  onConnect: OnConnect

  onSubmit: () => Promise<void>
  onResetFromPersistedWorkflow: (workflow: PersistedWorkflowDocument) => Promise<void>
  onDeleteFromQueue: (id: number) => Promise<void>
  onInit: () => Promise<void>
  onLoadWorkflow: (persisted: PersistedFullWorkflow) => void
  onExportWorkflow: () => void
  onNewClientId: (id: string) => void
  onQueueUpdate: () => Promise<void>
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
      id: node.id,
      data: {
        widget,
        value: node.value
      },
      selected: stateNode?.selected,
      position: node.position ?? { x: 0, y: 0 },
      style: {
        width: node.dimensions?.width,
        height: node.dimensions?.height,
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
    return { ...state, edges: addEdge(connection, state.edges) }
  },
  toPersisted(state: AppState): PersistedWorkflowDocument {
    const { doc } = state;
    return WorkflowDocumentUtils.toJson(doc);
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

  // properties
  counter: 0,
  widgets: {},
  widgetCategory: {},
  queue: [],
  gallery: [],
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
      console.log("nodes", workflow.nodes["2"]);

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
          console.warn(`Unknown widget ${node.value.widget}`)
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
    const st = get();
    set((st) => {
      return {
        nodes: applyNodeChanges(changes, st.nodes)
      }
    })

    // if (!st.draggingAndResizing) {
      const { doc} = get();
      WorkflowDocumentUtils.onNodesChange(doc, changes);
      const workflowMap = doc.getMap("workflow");
      const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
      throttledUpdateDocument({
        ...st.persistedWorkflow!,
        last_edit_time: +new Date(),
        snapshot: workflow
      });
    // }
  },
  onChangeDragingAndResizingState: (value: boolean) => {
    set({ draggingAndResizing: value })
  },
  onEdgesChange: (changes) => {
    set((st) => ({ edges: applyEdgeChanges(changes, st.edges) }))
    const { doc } = get();
    WorkflowDocumentUtils.onEdgesChange(doc, changes);
  },
  onNodesDelete: (changes: Node[]) => {
    const { doc, onSyncFromYjsDoc, } = get();
    WorkflowDocumentUtils.onNodesDelete(doc, changes.map(node => node.id));
    onSyncFromYjsDoc();
  },
  onEdgesDelete: (changes: Edge[]) => {
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.onEdgesDelete(doc, changes.map(edge => edge.id));
    onSyncFromYjsDoc();
  },
  onConnect: (connection: FlowConnecton) => {
    // console.log("on connet");
    const { doc, onSyncFromYjsDoc } = get();
    WorkflowDocumentUtils.addConnection(doc, connection);
    onSyncFromYjsDoc();
    // set((st) => AppState.addConnection(st, connection))
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
    console.log("duplicated node")
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
  },
  onDeleteFromQueue: async (id) => {
    await deleteFromQueue(id)
    await get().onQueueUpdate()
  },
  onNewClientId: (id) => {
    set({ clientId: id })
  },
  onQueueUpdate: async () => {
    set({ queue: await getQueueItems(get().clientId) })
  },
  onNodeInProgress: (id, progress) => {
    set({ nodeInProgress: { id, progress } })
  },
  onImageSave: (id, images) => {
    WorkflowDocumentUtils.onImageSave(get().doc, id, images);
    set((st) => ({
      ...st,
      graph: {
        ...st.graph,
        [id]: { ...st.graph[id], images },
      },
    }))
    get().onSyncFromYjsDoc();
  },
  onLoadImageWorkflow: (image) => {
    void exifr.parse(getBackendUrl(`/view/${image}`)).then((res) => {
      get().onLoadWorkflow(JSON.parse(res.workflow))
    })
  },
}));

async function getQueueItems(clientId?: string): Promise<QueueItem[]> {
  const history = await getQueue()
  // hacky way of getting the queue
  const queue = history.queue_running
    .concat(history.queue_pending)
    .filter(([i, id, graph, client]) => client.client_id === clientId)
    .map(([i, id, graph]) => {
      const prompts = Object.values(graph).flatMap((node) =>
        node.class_type === 'CLIPTextEncode' && node.inputs.text !== undefined ? [node.inputs.text] : []
      )
      const checkpoint = Object.values(graph).find((node) => node.class_type.startsWith('CheckpointLoader'))
      const model = checkpoint?.inputs?.ckpt_name
      return { id, prompts, model }
    })
  return queue
}

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