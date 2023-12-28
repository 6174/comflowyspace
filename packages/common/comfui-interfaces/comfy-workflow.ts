import { FlowPropsKey } from "./comfy-flow-props-types";

interface Flags {
  pinned: boolean;
}

export type ComfyUIWorkflowNodeInput = {
  link?: number;
  name: string;
  type: FlowPropsKey | "*";
}

export type ComfyUIWorkflowNodeOutput = {
  links: number[];
  name: string;
  slot_index: number;
  type: string;
  shape?: number;
}

export type ComfyUIWorkflowNode = {
  id: number;
  type: string;
  pos: [number, number];
  size: [number, number];
  flags: Flags;
  order: number;
  mode: number;
  properties: any;
  widgets_values: string[];
  color: string;
  bgcolor: string;
  title?: string;
  inputs: ComfyUIWorkflowNodeInput[];
  outputs: ComfyUIWorkflowNodeOutput[];
}

// 每个 "link" 是一个数组，包含以下信息：
// 第一个元素是连接的 ID
// 第二个元素是源节点的 ID
// 第三个元素是源节点的输出插槽索引
// 第四个元素是目标节点的 ID
// 第五个元素是目标节点的输入插槽索引
// 第六个元素是连接的类型

export type ComfyUIWorkflowConnection = [number, number, number, number, number, FlowPropsKey];

export type ComfyUIWorkflowGroup = {
  title: string;
  bounding: [number, number, number, number];
  color: string;
}

export type ComfyUIWorkflow = {
  id?: string;
  title?: string;
  nodes: ComfyUIWorkflowNode[];
  links: ComfyUIWorkflowConnection[];
  groups: ComfyUIWorkflowGroup[];
  properties: any;
  widgets_values: string[];
  color: string;
  bgcolor: string;
  version: number;
  config: any;
  extra: any;
}