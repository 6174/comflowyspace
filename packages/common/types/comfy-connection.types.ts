import { ComfyUIID, FlowPropsKey } from "./comfy-props.types";

export type PersistedWorkflowConnection = { 
  id: string, 
  source: string, 
  target: string, 
  sourceHandle: string, 
  targetHandle: string, 
  handleType?: string, 
  selected?: boolean 
} & Connection;

export interface Connection {
  source: string
  sourceHandle: string
  target: string
  targetHandle: string,
  targetHandleType?: string
}

// 每个 "link" 是一个数组，包含以下信息：
// 第一个元素是连接的 ID
// 第二个元素是源节点的 ID
// 第三个元素是源节点的输出插槽索引
// 第四个元素是目标节点的 ID
// 第五个元素是目标节点的输入插槽索引
// 第六个元素是连接的类型
export type ComfyUIWorkflowConnection = [ComfyUIID, ComfyUIID, number, ComfyUIID, number, FlowPropsKey];