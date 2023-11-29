import { Widget, WidgetKey } from "./comfy-widget-types"
export const NODE_IDENTIFIER = 'sdNode';
export type NodeId = string

/**
 * Stable Diffusion Node Interface
 */
export interface SDNode {
  widget: WidgetKey
  fields: Record<PropertyKey, any>
  images?: string[],
}

export const SDNode = {
  fromWidget(widget: Widget): SDNode {
    return { widget: widget.name, fields: Widget.getDefaultFields(widget) }
  },
}

export interface NodeInProgress {
    id: NodeId
    progress: number
  }