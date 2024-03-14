import { SDSubFlowNode } from "./comfy-node.types"
import {type Node} from "reactflow";

export type SubFlowNodeWithControl = {
  sdnode: SDSubFlowNode,
  nodeControl: ControlBoardNodeConfig
}

/**
 * Controlboard Config Data
 */
export type ControlBoardConfig = {
  nodes: ControlBoardNodeConfig[];
  requirements?: ControlBoardShareRequirements
  shareAsSubflowConfig?: {
    description?: string;
    title?: string;
    nodes: ControlBoardSharedNodeConfig[]
  }
}

export type ControlBoardShareRequirements = {
  requiredModels: {
    modelHash: string;
    modelReferece: string;
    modelDownloadUrl: string;
    modelSaveLocation: string;
  }[];
  requiredExtensions: {
    extensionName: string;
    extensionGithubUrl: string;
  }[]
}

/**
 * Controlboard Node Config
 */
export type ControlBoardNodeConfig = {
  id: string;
  fields: string[];
  select: boolean;
}

export type ControlBoardSharedNodeConfig = {
  id: string;
  fields: string[];
  inputs: string[];
  outputs: string[];
  select: boolean;
}

export type ControlBoardNodeProps = {
  nodeControl?: ControlBoardNodeConfig;
  onChangeNodeControl?: (cfg: ControlBoardNodeConfig) => void;
  node: Node,
}
