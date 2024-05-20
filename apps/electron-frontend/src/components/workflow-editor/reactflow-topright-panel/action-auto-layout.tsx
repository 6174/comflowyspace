import { useAppStore } from '@comflowy/common/store';
import { AppState } from '@comflowy/common/store/app-state';
import { NODE_GROUP, PersistedFullWorkflow, PersistedWorkflowDocument } from '@comflowy/common/types';
import { Button, Space } from 'antd';
import ELK from 'elkjs/lib/elk.bundled.js';
import _ from 'lodash';
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

  const onLayout = useCallback(({ direction, useInitialNodes = false, algorithm }) => {
    autoLayout({ direction, useInitialNodes, nodes, edges, onNodesChange, fitView, algorithm });
  }, [nodes, edges]);

  return (
    <div className="setting-item change-layout">
      <div className="setting-title">Graph Layout</div>
      <div className="setting-content">
        <Space>
          <Button size="small" onClick={() => onLayout({ direction: 'RIGHT', algorithm: 'rectpacking'})}>Rect Packing</Button>
          <Button size="small" onClick={() => onLayout({ direction: 'RIGHT', algorithm: 'layered' })}>Layered</Button>
          <Button size="small" onClick={() => onLayout({ direction: 'RIGHT', algorithm: 'box' })}>Box</Button>
          <Button size="small" onClick={() => onLayout({ direction: 'RIGHT', algorithm: 'mrtree' })}>Mrtree</Button>
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
  algorithm?: string;
  onNodesChange: AppState["onNodesChange"],
  fitView: () => void;
}) {
  const graph = _.cloneDeep(useAppStore.getState().graph);
  let changes: NodeChange[] = [];

  const elkOptions = {
    'elk.algorithm': options.algorithm,
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.spacing.nodeNode': '60'
  };

  const { direction, nodes, edges, onNodesChange, fitView } = options;
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
    const {layoutResult, nodeChanges} = await doLayout(groupNodes, groupEdges, true);
    changes = [...changes, ...nodeChanges]
    if (layoutResult) {
      const groupDimension = { width: layoutResult.width + 40, height: layoutResult.height + 60 }
      changes.push({
        id: groupNode.id,
        type: "dimensions",
        dimensions: groupDimension,
      })
      graph[groupNode.id].flowNode.width = groupDimension.width;
      graph[groupNode.id].flowNode.height = groupDimension.height;
    }
  }

  // second round layout all nodes;
  const { nodeChanges } = await doLayout(ns, es);

  changes = [...changes, ...nodeChanges];

  // fit view after all tasks done
  onNodesChange(changes);
  window.requestAnimationFrame(() => fitView());

  async function doLayout(ns, es, inGroup = false) {
    const ret = await getELKLayoutElements(ns, es, graph, {...opts, inGroup});
    if (!ret) {
      return
    }
    const { nodes: layoutedNodes } = ret;
    const nodeChanges = calculateChanges(layoutedNodes, inGroup);
    return {
      layoutResult: ret,
      nodeChanges
    };
  };
}

function calculateChanges(layoutedNodes, inGroup) {
  const changes: NodeChange[] = [];
  layoutedNodes.forEach((node) => {
    const { id, position, width, height, oldPosition } = node;
    if (oldPosition.x !== position.x || oldPosition.y !== position.y) {
      changes.push({
        id,
        type: 'position',
        position: inGroup ? {
          x: position.x + 20,
          y: position.y + 40
        } : position,
      });
    }
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
  const graphNode = graph[node.id].flowNode || node;
  const ret: any = {
    id: node.id,
    ...graphNode,
    oldPosition: graphNode.position,
    targetPosition: isHorizontal ? 'left' : 'top',
    sourcePosition: isHorizontal ? 'right' : 'bottom',
  }
  return ret;
}

