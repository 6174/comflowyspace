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
    Connection
  } from '../comfui-interfaces'
import { PersistedGraph, PersistedNode } from '../comfyui-bridge/persistence'

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void

import Y from "yjs";

export interface AppState {
    counter: number
    clientId?: string
    
    // workflow document store in yjs
    doc: Y.Doc;
    
    // old storage structure
    nodes: Node[]
    edges: Edge[]
    graph: Record<NodeId, SDNode>
    widgets: Record<WidgetKey, Widget>
    
    // document mutation handler
    onYjsDocUpdate: () => void;
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onPropChange: OnPropChange
    onAddNode: (widget: Widget, node?: SDNode, pos?: XYPosition, key?: number) => void
    onDeleteNode: (id: NodeId) => void
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
    onDeleteFromQueue: (id: number) => Promise<void>
    onInit: () => Promise<void>
    onLoadWorkflow: (persisted: PersistedGraph) => void
    onSaveWorkflow: () => void
    onPersistLocal: () => void
    onNewClientId: (id: string) => void
    onQueueUpdate: () => Promise<void>
    onNodeInProgress: (id: NodeId, progress: number) => void
    onImageSave: (id: NodeId, images: string[]) => void
    onPreviewImage: (id: number) => void
    onPreviewImageNavigate: (next: boolean) => void
    onHideImagePreview: () => void
    onLoadImageWorkflow: (image: string) => void
  }

  export const AppState = {
    getValidConnections(state: AppState): Connection[] {
      return state.edges.flatMap((e) =>
        e.sourceHandle !== undefined && e.sourceHandle !== null && e.targetHandle !== undefined && e.targetHandle !== null
          ? [{ source: e.source, sourceHandle: e.sourceHandle, target: e.target, targetHandle: e.targetHandle }]
          : []
      )
    },
    addNode(state: AppState, widget: Widget, node?: SDNode, position?: XYPosition, key?: number): AppState {
      const nextKey = key !== undefined ? Math.max(key, state.counter + 1) : state.counter + 1
      const id = nextKey.toString()
      const maxZ = state.nodes
        .map((n) => n.zIndex ?? 0)
        .concat([0])
        .reduce((a, b) => Math.max(a, b))
      const item = {
        id,
        data: widget,
        position: position ?? { x: 0, y: 0 },
        type: NODE_IDENTIFIER,
        zIndex: maxZ + 1,
      }
      return {
        ...state,
        nodes: applyNodeChanges([{ type: 'add', item }], state.nodes),
        graph: { ...state.graph, [id]: node ?? SDNode.fromWidget(widget) },
        counter: nextKey,
      }
    },
    addConnection(state: AppState, connection: FlowConnecton): AppState {
      return { ...state, edges: addEdge(connection, state.edges) }
    },
    toPersisted(state: AppState): PersistedGraph {
      const data: Record<NodeId, PersistedNode> = {}
      for (const node of state.nodes) {
        const value = state.graph[node.id]
        if (value !== undefined) {
          data[node.id] = { value, position: node.position }
        }
      }
  
      return {
        data,
        connections: AppState.getValidConnections(state),
      }
    },
  }