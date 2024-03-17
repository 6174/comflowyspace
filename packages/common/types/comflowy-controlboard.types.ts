import { SDNode } from "./comfy-node.types";
import {Node} from "reactflow";
import { ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput, Input } from "./comfy-props.types";
import { Widget } from "./comfy-widget.types";
/**
 * Controlboard Config Data
 */
export type ControlBoardConfig = {
  nodes: ControlBoardNodeConfig[];
  requirements?: ControlBoardShareRequirements
  shareAsSubflowConfig?: ShareAsSubflowConfig
}

export type ShareAsSubflowConfig = {
  shared: boolean;
  description?: string;
  title?: string;
  nodes: ControlBoardSubflowNodeConfig[]
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

export type ControlBoardSubflowNodeConfig = {
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

export type SubflowNodeWithControl = {
  id: string,
  sdnode: SDNode,
  title: string,
  nodeControl: ControlBoardNodeConfig,
  inputs: ComfyUIWorkflowNodeInput[],
  outputs: ComfyUIWorkflowNodeOutput[],
  widget: Widget,
  params: {
    property: string;
    input: Input;
  }[]
}
