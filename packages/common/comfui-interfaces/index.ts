export * from "./comfy-connection-types";
export * from "./comfy-flow-props-types";
export * from "./comfy-node-types";
export * from "./comfy-widget-types";

export interface GalleryItem {
  prompt?: string
  image: string
}

export interface QueueItem {
  id: number
  prompts: string[]
  model?: string
}
