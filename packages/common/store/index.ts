import { create } from 'zustand'
import { createPrompt, deleteFromQueue, getQueue, getWidgetLibrary as getWidgets, sendPrompt } from '../comfyui-bridge/bridge';
import {
  type QueueItem,
} from '../comfui-interfaces'
import {
  retrieveLocalWorkflow,
  saveLocalWorkflow,
  writeWorkflowToFile,
} from '../comfyui-bridge/persistence';

import { getBackendUrl } from '../config'
import exifr from 'exifr'

import {AppState} from "./appstate";
import Y from "yjs";
import { applyEdgeChanges, applyNodeChanges } from 'reactflow';
import { WorkflowDocument } from './workflow-doc';

export const useAppStore = create<AppState>((set, get) => ({
  doc: new Y.Doc(),
  // properties
  counter: 0,
  widgets: {},
  graph: {},
  nodes: [],
  edges: [],
  queue: [],
  gallery: [],
  /**
   * AppStore Initialization Entry 
   */
  onInit: async () => {
    setInterval(() => get().onPersistLocal(), 5000)
    const widgets = await getWidgets()
    set({ widgets })
    get().onLoadWorkflow(retrieveLocalWorkflow() ?? { data: {}, connections: [] })
  },
  // actions
  onNodesChange: (changes) => {
    set((st) => ({ nodes: applyNodeChanges(changes, st.nodes) }))
  },
  onEdgesChange: (changes) => {
    set((st) => ({ edges: applyEdgeChanges(changes, st.edges) }))
  },
  onConnect: (connection) => {
    set((st) => AppState.addConnection(st, connection))
  },
  onPropChange: (id, key, val) => {
    set((state) => ({
      graph: {
        ...state.graph,
        [id]: {
          ...state.graph[id],
          fields: {
            ...state.graph[id]?.fields,
            [key]: val,
          },
        },
      },
    }))
  },
  onPersistLocal: () => {
    saveLocalWorkflow(AppState.toPersisted(get()))
  },
  onAddNode: (widget, node, position, key) => {
    set((st) => AppState.addNode(st, widget, node, position, key))
  },
  onDeleteNode: (id) => {
    set(({ graph: { [id]: toDelete, ...graph }, nodes }) => ({
      // graph, // should work but currently buggy
      nodes: applyNodeChanges([{ type: 'remove', id }], nodes),
    }))
  },
  onDuplicateNode: (id) => {
    set((st) => {
      const item = st.graph[id]
      const node = st.nodes.find((n) => n.id === id)
      const position = node?.position
      const moved = position !== undefined ? { ...position, y: position.y + 100 } : undefined
      return AppState.addNode(st, st.widgets[item.widget], item, moved)
    })
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
  onLoadWorkflow: (workflow) => {
    set((st) => {
      let state: AppState = { ...st, nodes: [], edges: [], counter: 0, graph: {} }
      for (const [key, node] of Object.entries(workflow.data)) {
        const widget = state.widgets[node.value.widget]
        if (widget !== undefined) {
          state = AppState.addNode(state, widget, node.value, node.position, parseInt(key))
        } else {
          console.warn(`Unknown widget ${node.value.widget}`)
        }
      }
      for (const connection of workflow.connections) {
        state = AppState.addConnection(state, connection)
      }
      return state
    }, true)
  },
  /**
   * Everytime update yjs doc, recalculate nodes and edges
   */
  onYjsDocUpdate: () => {
    set((st) => {
      const workflowMap = st.doc.getMap("workflow");
      const workflow = workflowMap.toJSON() as WorkflowDocument;
      let state: AppState = { ...st, nodes: [], edges: [], graph: {} }
      for (const [key, node] of Object.entries(workflow.nodes)) {
        const widget = state.widgets[node.value.widget]
        if (widget !== undefined) {
          state = AppState.addNode(state, widget, node.value, node.position, parseInt(key))
        } else {
          console.warn(`Unknown widget ${node.value.widget}`)
        }
      }
      for (const connection of workflow.connections) {
        state = AppState.addConnection(state, connection)
      }
      return state
    }, true)
  },
  onSaveWorkflow: () => {
    writeWorkflowToFile(AppState.toPersisted(get()))
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