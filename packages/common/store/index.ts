import { create } from 'zustand'
import { createPrompt, deleteFromQueue, getQueue, getWidgetLibrary as getWidgets, sendPrompt } from '../comfyui-bridge/bridge';
import {
  SDNode,
  type QueueItem,
  Widget,
} from '../comfui-interfaces'
import {
  retrieveLocalWorkflow,
  saveLocalWorkflow,
  writeWorkflowToFile,
} from '../comfyui-bridge/persistence';

import { getBackendUrl } from '../config'
import exifr from 'exifr'

import {AppState} from "./appstate";
import * as Y from "yjs";
import { Connection, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import { PersistedWorkflowDocument, WorkflowDocumentUtils } from './workflow-doc';
import { uuid } from '../utils';

export const useAppStore = create<AppState>((set, get) => ({
  doc: new Y.Doc(),
  graph: {},
  nodes: [],
  edges: [],
  // properties
  counter: 0,
  widgets: {},
  queue: [],
  gallery: [],
  /**
   * AppStore Initialization Entry 
   */
  onInit: async () => {
    setInterval(() => get().onPersistLocal(), 5000)
    const widgets = await getWidgets()
    set({ widgets })
    get().onLoadWorkflow(retrieveLocalWorkflow() ?? { id:"__empty", title: "untitiled", nodes: {} as any, connections: [] })
  },
  /**
   * Everytime update yjs doc, recalculate nodes and edges
   */
  onYjsDocUpdate: () => {
    set((st) => {
      const workflowMap = st.doc.getMap("workflow");
      const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
      let state: AppState = { ...st, nodes: [], edges: [], graph: {} }
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
    console.log("nodes change", changes);
    const {doc, onYjsDocUpdate} = get();
    WorkflowDocumentUtils.onNodesChange(doc, changes);
    onYjsDocUpdate();
  },
  onEdgesChange: (changes) => {
    console.log("edges change", changes);
    // set((st) => ({ edges: applyEdgeChanges(changes, st.edges) }))
    const {doc, onYjsDocUpdate} = get();
    WorkflowDocumentUtils.onEdgesChange(doc, changes);
    onYjsDocUpdate();
  },
  onConnect: (connection: Connection) => {
    console.log("on connet");
    const {doc, onYjsDocUpdate} = get();
    WorkflowDocumentUtils.addConnection(doc, connection);
    onYjsDocUpdate();
    // set((st) => AppState.addConnection(st, connection))
  },
  onDeleteNode: (id) => {
    console.log("delete node")
    const {doc, onYjsDocUpdate} = get();
    WorkflowDocumentUtils.onEdgesChange(doc, [{
      type: 'remove', id
    }]);
    onYjsDocUpdate();
    // set(({ graph: { [id]: toDelete, ...graph }, nodes }) => ({
    //   // graph, // should work but currently buggy
    //   nodes: applyNodeChanges([{ type: 'remove', id }], nodes),
    // }))
  },
  onPropChange: (id, key, value) => {
    console.log("change prop")
    const {doc, onYjsDocUpdate} = get();
    WorkflowDocumentUtils.onPropChange(doc, {
      id,
      key,
      value
    });
    onYjsDocUpdate();
  },
  onAddNode: (widget: Widget, node: SDNode, position) => {
    console.log("add node")
    const {doc, onYjsDocUpdate} = get();
    WorkflowDocumentUtils.onNodesAdd(doc, [{
      id: "node-" + uuid(),
      position,
      value: node
    }]);
    onYjsDocUpdate();

  },
  onDuplicateNode: (id) => {
    console.log("duplicated node")
    const st = get();
    const item = st.graph[id]
    const node = st.nodes.find((n) => n.id === id)
    const position = node?.position
    const moved = position !== undefined ? { ...position, y: position.y + 100 } : {x: 0, y: 0}
    const doc = st.doc;
    WorkflowDocumentUtils.onNodesAdd(doc, [{
      id: "node-" + uuid(),
      position: moved,
      value: item
    }])
    st.onYjsDocUpdate();
  },
  /**
   * Workflow load & persisted
   * @param workflow 
   */
  onLoadWorkflow: (workflow) => {
    const st = get();
    const doc = WorkflowDocumentUtils.fromJson(workflow as any);
    set(st => {
      return {
        ...st,
        doc,      
      }
    });
    st.onYjsDocUpdate();
  },
  onSaveWorkflow: () => {
    writeWorkflowToFile(AppState.toPersisted(get()))
  },
  onPersistLocal: () => {
    saveLocalWorkflow(AppState.toPersisted(get()))
  },
  onSubmit: async () => {
    const state = get()
    const graph = AppState.toPersisted(state)
    const res = await sendPrompt(createPrompt(graph, state.widgets, state.clientId))
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
    set((st) => ({
      gallery: st.gallery.concat(images.map((image) => ({ image }))),
      graph: {
        ...st.graph,
        [id]: { ...st.graph[id], images },
      },
    }))
  },
  onPreviewImage: (index) => {
    set({ previewedImageIndex: index })
  },
  onPreviewImageNavigate: (next) => {
    set((st) => {
      if (st.previewedImageIndex === undefined) {
        return {}
      }
      const idx = next ? st.previewedImageIndex - 1 : st.previewedImageIndex + 1
      return idx < 0 || idx === st.gallery.length ? {} : { previewedImageIndex: idx }
    })
  },
  onHideImagePreview: () => {
    set({ previewedImageIndex: undefined })
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