import { NodeProps, XYPosition } from "reactflow";
import { ComfyUIID, FlowPrimitiveType, Input, PreviewImage } from "./comfy-props.types";
import { Widget, WidgetKey } from "./comfy-widget.types"
import { ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput } from "./comfy-props.types";
import { SubflowNodeWithControl } from "./comflowy-controlboard.types";
import { PersistedFullWorkflow } from "./comfy-workflow.types";
export const NODE_IDENTIFIER = 'sdNode';
export const NODE_GROUP = 'Group';
export type NodeId = string

export enum GroupNodeState {
  Collapsed = "collpased",
  Expaned = "expaned",
  CollapsedAsNode = "collapsedAsNode"
}

export type WorkflowNodeProps = NodeProps<{
  widget: Widget;
  value: SDNode;
}>

export type WorkflowNodeRenderInfo = {
  title: string;
  widget: Widget;
  params: { property: string, input: Input }[];
  inputs: ComfyUIWorkflowNodeInput[];
  outputs: ComfyUIWorkflowNodeOutput[];
  nodeColor: string;
  nodeBgColor: string;
}

export type SubflowNodeRenderingInfo = {
  nodesWithControlInfo: SubflowNodeWithControl[],
  title: string,
  description: string,
  inputs: (ComfyUIWorkflowNodeInput & {id: string, widget: Widget, sdnode: SDNode, nodeId: string})[],
  outputs: (ComfyUIWorkflowNodeOutput & { id: string, widget: Widget, sdnode: SDNode, nodeId: string })[],
  params: { property: string; input: Input; title: string; id: string, name: string, widget: Widget, sdnode: SDNode, nodeId: string }[],
  doc: PersistedFullWorkflow
}

/**
 * Stable Diffusion Node Store in database
 */
export type PersistedWorkflowNode = {
  id: NodeId;
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
  widget: WidgetKey;
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
  custom_fields?: string[];
  custom_inputs?: string[];
  custom_outputs?: string[];
  flowId?: string;
  parent?: NodeId;
}

export const SUBFLOW_WIDGET_TYPE_NAME = 'Subflow'

export const SDNode = {
  /**
   * @param workflowId 
   */
  newSubflowNode: (workflowId: string): SDNode => {
    return {
      widget: SUBFLOW_WIDGET_TYPE_NAME,
      inputs: [],
      outputs: [],
      fields: {},
      images: [],
      flowId: workflowId
    }
  },
  /**
   * create from a widget
   * @param widget 
   * @returns 
   */
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
