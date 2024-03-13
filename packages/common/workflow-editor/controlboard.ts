import { type Node } from 'reactflow';
import { getNodeRenderInfo } from './node-rendering';
import { SDNode } from '../comfui-interfaces';

/**
 * Controlboard Config Data
 */
export type ControlBoardConfig = {
  nodes: ControlBoardNodeConfig[];
  requirements?: ControlBoardShareRequirements
  shareAsNodeConfig?: {
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

export const ControlBoardUtils = {
  createControlboardInfoFromNodes(nodes: Node[]): ControlBoardConfig {
    const nodeList = nodes.map(ControlBoardUtils.createControlboardInfoFromNode);
    return {
      nodes: nodeList
    }
  },
  createControlboardInfoFromNode(node: Node): ControlBoardNodeConfig {
    const { params, id } = getNodeRenderInfo(node as any);
    const fields = params.map(param => param.property);
    return {
      id,
      fields,
      select: true
    } as ControlBoardNodeConfig
  },

  getNodesToRender(controlboardConfig: ControlBoardConfig | undefined, nodes: Node[], graph?: Record<string, SDNode>): ControlBoardNodeProps[] {
    const nodesToRender: ControlBoardNodeProps[] = [];

    /**
     * if do not have config: 
     *  - render all nodes
     * else:
     *  - render all nessessary nodes
     */
    if (!controlboardConfig) {
      ControlBoardUtils.autoSortNodes(nodes, graph).forEach(node => {
        nodesToRender.push({
          node
        });
      })
    } else {
      (controlboardConfig?.nodes || []).forEach(nodeControl => {
        const node = nodes.find(n => n.id === nodeControl.id);
        if (node) {
          nodesToRender.push({
            nodeControl,
            node
          })
        }
      });
    }
    return nodesToRender;
  },
  autoSortNodes(nodes: Node[], graph: Record<string, SDNode> = {}): Node[] {
    return nodes.sort((a, b) => {
      return getPriority(b) - getPriority(a);
    });

    function getPriority(node: Node): number {
      const name = (node.data.widget.name + node.data.widget.display_name).toLowerCase()
      const isPositive = graph[node.id]?.isPositive;
      const isNegative = graph[node.id]?.isNegative;
      if (name.includes('cliptextencod')) {
        if (isPositive) {
          return 11;
        }
        return 10;
      }
      if (name.includes('loadimage')) {
        return 9;
      }
      if (name.includes('checkpoint')) {
        return 8;
      }
      if (name.includes('lora')) {
        return 7;
      }
      if (name.includes('sampler')) {
        return 4;
      }
      return 0;
    }
  }
}

