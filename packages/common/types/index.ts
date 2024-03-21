import { PreviewImage } from "./comfy-props.types";

export * from "./comfy-connection.types";
export * from "./comfy-error.types";
export * from "./comfy-message.types";
export * from "./comfy-node.types";
export * from "./comfy-props.types";
export * from "./comfy-widget.types";
export * from "./comfy-workflow.types";
export * from "./comflowy-console.types";
export * from "./comfy-extensions.types";
export * from "./comflowy-controlboard.types";
export * from "./comflowy-bootstrap.types"

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
