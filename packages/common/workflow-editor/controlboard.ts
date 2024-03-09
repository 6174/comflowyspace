import { type Node } from 'reactflow';
import { getNodeRenderInfo } from './node-rendering';
/**
 * Controlboard Config Data
 */
export type ControlBoardConfig = {
  nodes: ControlBoardNodeConfig[];
}

/**
 * Controlboard Node Config
 */
export type ControlBoardNodeConfig = {
  id: string;
  fields: string[];
  apiInputFields?: string[];
  apiInputFieldsNameMapping?: Record<string, string>;
  apiOutputFields?: string[];
  apiOutputFieldsNameMapping?: Record<string, string>;
}

export const ControlBoardUtils = {
  createControlboardInfoFromNodes(nodes: Node[]): ControlBoardConfig {
    const nodeList = nodes.map(node => {
      const {params, id} = getNodeRenderInfo(node as any);
      const fields = params.map(param => param.property);
      return {
        id,
        fields
      } as ControlBoardNodeConfig
    });
    return {
      nodes: nodeList
    }
  }
}

