import { PersistedWorkflowDocument } from "../types";
import ELK from 'elkjs/lib/elk.bundled.js';
/**
 * According to the workflow, layout the nodes, directly change the parameters
 * @param workflow 
 * @param options 
 */
export async function layoutWorkflow(workflow: PersistedWorkflowDocument, options: any) {
  const elk = new ELK();

  options = {
    ...options,
    'elk.algorithm': options.algorithm,
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '60'
  }

  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const inGroup = options?.['inGroup'];
  const nodes = Object.keys(workflow.nodes).map(nodeId => workflow.nodes[nodeId]);
  const elkGraph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map(node => ({
      id: node.id,
      width: node.dimensions?.width || 100,
      height: node.dimensions?.height || 100,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      labels: [{ text: node.id }]
    })),
    edges: workflow.connections.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  };

  const layout = await elk.layout(elkGraph);

  // Apply the new positions to the nodes
  layout.children?.forEach((elkNode: any) => {
    const node = workflow.nodes[elkNode.id];
    if (node) {
      node.position.x = elkNode.x;
      node.position.y = elkNode.y;
    }
  });
  
  return workflow;
} 