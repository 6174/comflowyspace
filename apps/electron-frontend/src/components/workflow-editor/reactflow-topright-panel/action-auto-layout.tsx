import { useAppStore } from '@comflowy/common/store';
import { AppState } from '@comflowy/common/store/app-state';
import { NODE_GROUP } from '@comflowy/common/types';
import { Button, Space } from 'antd';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useCallback } from 'react';
import { Edge, Node, NodeChange, useReactFlow } from 'reactflow';
const elk = new ELK();

/**
 * auto layout reactflow nodes
 * @returns 
 */
export function AutoLayoutSettings() {
  const nodes = useAppStore(st => st.nodes);
  const edges = useAppStore(st => st.edges);
  const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
    // 'org.eclipse.elk.nodeSize.options': 'PORTS'
    'org.eclipse.elk.nodeSize.constraints': 'MINIMUM_SIZE'
  };

  const onNodesChange = useAppStore(st => st.onNodesChange);

  const { fitView } = useReactFlow();

  const onLayout = useCallback(({ direction, useInitialNodes = false }: { direction: string; useInitialNodes: boolean;}) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = nodes;
      const es = edges;

      const graph = useAppStore.getState().graph;
      getELKLayoutElements(ns, es, graph, opts).then((ret) => {
        if (!ret) {
          return
        }
        const { nodes: layoutedNodes } = ret;
        onNodesChange(calculateChanges());
        window.requestAnimationFrame(() => fitView());
        function calculateChanges() {
          const changes: NodeChange[] = [];
          layoutedNodes.forEach((node) => {
            const { id, position, width, height } = node;
            const oldNodeInfo = graph[id];
            if (oldNodeInfo.flowNode.position.x !== position.x || oldNodeInfo.flowNode.position.y !== position.y) {
              changes.push({
                id,
                type: 'position',
                position,
              });
            }

            if (oldNodeInfo.flowNode.width !== width || oldNodeInfo.flowNode.height !== height) {
              changes.push({
                id,
                type: 'dimensions',
                dimensions: { width, height },
              });
            }
          });
          return changes;
        }
      });
    },
    [nodes, edges]
  );
  
  return (
    <div className="setting-item change-layout">
      <div className="setting-title">Graph Layout</div>
      <div className="setting-content">
        <Space>
          <Button size="small" onClick={() => onLayout({ direction: 'RIGHT', useInitialNodes: false })}>Horizontal Layout</Button>
          <Button size="small" onClick={() => onLayout({ direction: 'DOWN', useInitialNodes: false })}>Vertical Layout</Button>
        </Space>
      </div>
    </div>
  )
}

/**
 * Turn nodes to ELK layout elments, consider react flow node has parentNode relation ship
 */
function getELKLayoutElements(nodes: Node[], edges: Edge[], graph: AppState["graph"], options: any) {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';

  const elkNodes = nodes.filter(n => !n.parentNode).map(node => {
    return flowNodeToLayoutNode(node, isHorizontal, graph);   
  });

  const elkEdges = edges.map(edge => {
    const sourceNode = graph[edge.source].flowNode;
    const targetNode = graph[edge.target].flowNode;
    let sourceId = edge.source;
    let targetId = edge.target;

    if (sourceNode.parentNode && sourceNode.parentNode !== targetNode.parentNode) {
      sourceId = sourceNode.parentNode;
    }
    if (targetNode.parentNode && targetNode.parentNode !== sourceNode.parentNode) {
      targetId = targetNode.parentNode;
    }

    if (sourceNode.parentNode && sourceNode.parentNode === targetNode.parentNode) {
      return null
    }

    return {
      id: edge.id,
      sources: [sourceId],
      targets: [targetId],
    }
  }).filter(edge => !!edge);

  const elkLayoutGraph ={
    id: 'root',
    children: elkNodes,
    edges: elkEdges,
    layoutOptions: options,
  };

  return elk.layout(elkLayoutGraph).then(layoutedGraph => {
    return {
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }
  }).catch(console.error);;
}

function flowNodeToLayoutNode(node: Node, isHorizontal, graph: AppState["graph"]) {
  const ret: any = {
    id: node.id,
    ...node,
    targetPosition: isHorizontal ? 'left' : 'top',
    sourcePosition: isHorizontal ? 'right' : 'bottom',
  }

  if (node.type === NODE_GROUP) {
    const children = node.data?.children || [];
    // ret.children = children.map((childId) => {
    //   return graph[childId].flowNode
    // }).map((child) => {
    //   return flowNodeToLayoutNode(child, isHorizontal, graph)
    // });
  }

  return ret;
}