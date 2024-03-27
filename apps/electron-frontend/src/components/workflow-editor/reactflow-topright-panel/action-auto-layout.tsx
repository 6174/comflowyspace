import { useAppStore } from '@comflowy/common/store';
import { AppState } from '@comflowy/common/store/app-state';
import { NODE_GROUP } from '@comflowy/common/types';
import { Button, Space } from 'antd';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useCallback } from 'react';
import { Edge, Node, NodeChange, useReactFlow } from 'reactflow';

/**
 * auto layout reactflow nodes
 * @returns 
 */
export function AutoLayoutSettings() {
  const nodes = useAppStore(st => st.nodes);
  const edges = useAppStore(st => st.edges);

  const onNodesChange = useAppStore(st => st.onNodesChange);

  const { fitView } = useReactFlow();

  const onLayout = useCallback(({ direction, useInitialNodes = false }) => {
    autoLayout({ direction, useInitialNodes, nodes, edges, onNodesChange, fitView });
  }, [nodes, edges]);

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


export async function autoLayout(options: {
  direction: string; 
  useInitialNodes: boolean;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: AppState["onNodesChange"],
  fitView: () => void;
}) {
  const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '60',
    // 'org.eclipse.elk.nodeSize.options': 'PORTS'
    'org.eclipse.elk.nodeSize.constraints': 'MINIMUM_SIZE'
  };

  const { direction, useInitialNodes, nodes, edges, onNodesChange, fitView } = options;
  const opts = { 'elk.direction': direction, ...elkOptions };
  const ns = nodes;
  const es = edges;

  // layout nodes in group first 
  const groupNodes = ns.filter(n => n.type === NODE_GROUP);

  // first round layout group nodes
  for (const groupNode of groupNodes) {
    const children = groupNode.data?.children || [];
    const groupNodes = children.map((childId) => {
      return nodes.find(n => n.id === childId);
    });
    const groupEdges = edges.filter(edge => {
      return children.includes(edge.source) && children.includes(edge.target);
    })
    const ret = await doLayout(groupNodes, groupEdges, true);
    if (ret) {
      const changes: NodeChange[] = [];
      // // All children create a shift move to the right bottom
      // ret.nodes.forEach((node) => {
      //   const { id, position } = node;
      //   changes.push({
      //     id,
      //     type: 'position',
      //     position: {
      //       x: position.x + 20,
      //       y: position.y + 40,
      //     }
      //   });
      // });

      changes.push({
        id: groupNode.id,
        type: "dimensions",
        dimensions: { width: ret.width + 40, height: ret.height + 60 },
      })

      onNodesChange(changes);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // second round layout all nodes;
  await doLayout(ns, es);

  // fit view after all tasks done
  window.requestAnimationFrame(() => fitView());

  async function doLayout(ns, es, inGroup = false) {
    const graph = useAppStore.getState().graph;
    ns = ns.map(n => graph[n.id].flowNode);
    const ret = await getELKLayoutElements(ns, es, graph, {...opts, inGroup});
    if (!ret) {
      return
    }
    const { nodes: layoutedNodes } = ret;
    onNodesChange(calculateChanges(layoutedNodes, graph, inGroup));
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ret;
  };
}

function calculateChanges(layoutedNodes, graph, inGroup) {
  const changes: NodeChange[] = [];
  layoutedNodes.forEach((node) => {
    const { id, position, width, height } = node;
    const oldNodeInfo = graph[id];
    if (oldNodeInfo.flowNode.position.x !== position.x || oldNodeInfo.flowNode.position.y !== position.y) {
      changes.push({
        id,
        type: 'position',
        position: inGroup ? {
          x: position.x + 20,
          y: position.y + 40
        } : position,
      });
    }
    // if (oldNodeInfo.flowNode.width !== width || oldNodeInfo.flowNode.height !== height) {
    //   changes.push({
    //     id,
    //     type: 'dimensions',
    //     dimensions: { width, height },
    //   });
    // }
  });
  return changes;
}


/**
 * Turn nodes to ELK layout elments, consider react flow node has parentNode relation ship
 */
function getELKLayoutElements(
  nodes: Node[], 
  edges: Edge[], 
  graph: AppState["graph"], 
  options: any
  ) {
  const elk = new ELK();
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const inGroup = options?.['inGroup'];

  const elkNodes = (inGroup ? nodes : nodes.filter(n => !n.parentNode)).map(node => {
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

    if (!inGroup) {
      if (sourceNode.parentNode && sourceNode.parentNode === targetNode.parentNode) {
        return null
      }
    }

    return {
      id: edge.id,
      sources: [sourceId],
      targets: [targetId],
    }
  }).filter(edge => !!edge);

  const elkLayoutGraph ={
    id: 'root',
    padding: { // Add padding here
      'top': 20,
      'bottom': 20,
      'left': 20,
      'right': 20
    },
    children: elkNodes,
    edges: elkEdges,
    layoutOptions: options,
  };

  return elk.layout(elkLayoutGraph).then(layoutedGraph => {
    return {
      ...layoutedGraph,
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

  // if (node.type === NODE_GROUP) {
    // const children = node.data?.children || [];
    // ret.children = children.map((childId) => {
    //   return graph[childId].flowNode
    // }).map((child) => {
    //   return flowNodeToLayoutNode(child, isHorizontal, graph)
    // });

    // // Calculate group size based on children
    // const minX = Math.min(...ret.children.map(child => child.x));
    // const minY = Math.min(...ret.children.map(child => child.y));
    // const maxX = Math.max(...ret.children.map(child => child.x + child.width));
    // const maxY = Math.max(...ret.children.map(child => child.y + child.height));

    // ret.width = maxX - minX;
    // ret.height = maxY - minY;
  // }

  return ret;
}