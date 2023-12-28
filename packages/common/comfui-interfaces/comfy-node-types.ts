import { Widget, WidgetKey } from "./comfy-widget-types"
import { ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput } from "./comfy-workflow";
export const NODE_IDENTIFIER = 'sdNode';
export type NodeId = string

/**
 * Stable Diffusion Node Interface
 */
export interface SDNode {
  widget: WidgetKey
  fields: Record<PropertyKey, any>
  inputs: ComfyUIWorkflowNodeInput[]
  outputs: ComfyUIWorkflowNodeOutput[]
  images?: PreviewImage[]
  color?: string;
  bgcolor?: string;
  title?: string;
}

export interface PreviewImage {
  filename: string;
  subfolder? : string;
  type?: 'output'
}

export const SDNode = {
  fromWidget(widget: Widget): SDNode {
    return { 
      widget: widget.name, 
      fields: Widget.getDefaultFields(widget),
      inputs: [],
      outputs: [],
    }
  },
}

export interface NodeInProgress {
  id: NodeId
  progress: number
}

