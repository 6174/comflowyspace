import { FlowPrimitiveType, Input } from "./comfy-flow-props-types";
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
  properties?: any
}

export interface PreviewImage {
  filename: string;
  subfolder? : string;
  type?: 'output'
}

export const SDNode = {
  fromWidget(widget: Widget): SDNode {
    const inputs = Object.entries(widget.input.required)
    .filter(([name, input]) => {
      return !Input.isParameterOrList(input)
    })
    .map(([name, input]) => {
      return {
        name: name,
        type: input[0] as any,
        link: undefined
      }
    });
    const outputs = widget.output.map((output, index) => {
      return {
        name: output,
        type: output,
        links: [],
        slot_index: index
      }
    });
    return { 
      widget: widget.name, 
      fields: Widget.getDefaultFields(widget),
      inputs: inputs,
      outputs: outputs,
    }
  },
  newPrimitiveNode(primitiveType: FlowPrimitiveType): SDNode {
    return {
      widget: 'PrimitiveNode',
      fields: {},
      inputs: [],
      outputs: [{
        name: primitiveType,
        type: primitiveType,
        links: [],
        slot_index: 0
      }],
    }
  },
  newRerouteNode(): SDNode {
    return {
      widget: 'RerouteNode',
      fields: {},
      inputs: [{
        name: "",
        type: "*",
      }],
      outputs: [{
        name: "",
        type: "*",
        slot_index: 0,
        links: [],
      }]
    }
  } 
}

export interface NodeInProgress {
  id: NodeId
  progress: number
}

