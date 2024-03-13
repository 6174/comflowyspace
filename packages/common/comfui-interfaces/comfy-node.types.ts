import { XYPosition } from "reactflow";
import { ComfyUIID, FlowPrimitiveType, Input, PreviewImage } from "./comfy-props.types";
import { Widget, WidgetKey } from "./comfy-widget.types"
import { ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput } from "./comfy-props.types";
export const NODE_IDENTIFIER = 'sdNode';
export const NODE_GROUP = 'Group';
export type NodeId = string

/**
 * Stable Diffusion Node Store in database
 */
export type PersistedWorkflowNode = {
  id: string;
  value: SDNode;
  selected?: boolean;
  dimensions?: {
    width: number,
    height: number
  },
  images?: PreviewImage[],
  position: XYPosition
}

/**
 * Stable Diffusion Node Type
 */
export interface SDNode {
  id?: NodeId;
  widget: WidgetKey
  fields: Record<PropertyKey, any>
  inputs: ComfyUIWorkflowNodeInput[]
  outputs: ComfyUIWorkflowNodeOutput[]
  images?: PreviewImage[]
  color?: string;
  bgcolor?: string;
  title?: string;
  properties?: any;
  isPositive?: boolean;
  isNegative?: boolean;
  flowId?: string;
}

/**
 * Stable Diffusion Flow Node Type
 */
export interface SDFlowNode {
  id?: NodeId;
  widget: 'Flow';
  // inputs & outputs are dynamic fetched from the subworkflow and mixed with custom input outpt config
  flowId: string;
  // field values setted by the user
  // field_key: `${NODE_ID}__${FLOW_ID}__${NODE_ID}__${FILELD_NAME}`
  fields: Record<PropertyKey, any>;
  custom_fields?: string[];
  custom_inputs?: string[];
  custom_outputs?: string[];
  images?: PreviewImage[];
  color?: string;
  bgcolor?: string;
  title?: string;
  properties?: any;
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


/**
 * Original ComfyUIWorkflowNode Data Structure
 */
export type ComfyUIWorkflowNode = {
  id: ComfyUIID;
  type: string;
  pos: [number, number];
  size: [number, number];
  flags?: {
    pinned: boolean;
  };
  order?: number;
  mode: number;
  properties: any;
  widgets_values: string[];
  color: string;
  bgcolor: string;
  title?: string;
  inputs: ComfyUIWorkflowNodeInput[];
  outputs: ComfyUIWorkflowNodeOutput[];
}


export type ComfyUIWorkflowGroup = {
  title: string;
  bounding: [number, number, number, number];
  color: string;
}
