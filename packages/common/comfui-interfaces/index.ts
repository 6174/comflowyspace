import { PreviewImage } from "./comfy-node-types";

export * from "./comfy-connection-types";
export * from "./comfy-flow-props-types";
export * from "./comfy-node-types";
export * from "./comfy-widget-types";

export interface GalleryItem {
  prompt?: string
  image: PreviewImage
}

export interface QueueItem {
  id: number
  prompts: string[]
  model?: string
  clientId?: string | undefined
}

export interface Queue {
  queue_running: QueueItem[]
  queue_pending: QueueItem[]
}
