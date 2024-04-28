import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import { WorkflowDocumentUtils, createNodeId } from '../ydoc-utils';
import { uuid } from '../../utils';
import { getNodePositionInGroup, getNodePositionOutOfGroup } from "../../utils/workflow";
import _ from "lodash";
import { NODE_GROUP, NodeId, NodeVisibleState, PersistedFullWorkflow, PersistedWorkflowNode, SDNode, Widget } from "../../types";
import {Node, NodeChange, XYPosition, applyNodeChanges} from "reactflow";

export default function createHook(set: AppStateSetter, get: AppStateGetter): Partial<AppState> {
  return {
    onChangeNodeBypass: (nodeId: string, bypass: boolean) => {
      const st = get();
      st.onNodeAttributeChange(nodeId, {
        bypass
      });
    },
    onChangeNodeVisibleState: (nodeId: string, state: NodeVisibleState) => {
      const st = get();
      const node = st.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new Error("nodeId does not exist")
      }
      const id = node.id;
      const dimensions = node.data.dimensions;
      const nodeSize = node.data.value.properties?.nodeSize || [dimensions.width, dimensions.height];
      switch (state) {
        case NodeVisibleState.Collapsed:
          st.onNodePropertyChange(id, {
            nodeVisibleState: state,
            nodeSize: [dimensions.width, dimensions.height]
          });
          break;
        case NodeVisibleState.Expaned:
          st.onNodePropertyChange(id, {
            nodeVisibleState: state
          });
          st.onNodesChange([{
            type: "dimensions",
            dimensions: {
              width: nodeSize[0],
              height: nodeSize[1]
            },
            id
          }])
          break;
      }
    },
    onAddNodeToGroup: (node: Node, group: Node) => {
      const st = get();
      st.onNodeAttributeChange(node.id, {
        parent: group.id,
      });
      const realPosition = getNodePositionInGroup(node, group);
      st.onNodesChange([{
        type: "position",
        position: realPosition,
        id: node.id
      }]);
    },
    onRemoveNodeFromGroup: (node: Node) => {
      const st = get();
      if (!node.parentNode) {
        return;
      }
      const groupNode = st.nodes.find(n => n.id === node.parentNode);
      if (groupNode) {
        st.onNodeAttributeChange(node.id, {
          parent: null
        });
        const realPosition = getNodePositionOutOfGroup(node, groupNode);
        st.onNodesChange([{
          type: "position",
          position: realPosition,
          id: node.id
        }]);
      }
    },
    onAddSubflowNode: (workflow: PersistedFullWorkflow, position: XYPosition) => {
      const node = SDNode.newSubflowNode(workflow.id);
      node.title = workflow.title;
      const { doc, onSyncFromYjsDoc } = get();
      const persistNode = {
        id: createNodeId(),
        position,
        dimensions: {
          width: 240,
          height: 80
        },
        value: node
      }
      WorkflowDocumentUtils.onNodesAdd(doc, [persistNode]);
      onSyncFromYjsDoc();
      return persistNode
    },
    onDuplicateNodes: (ids) => {
      console.log("on duplicated nodes")
      const st = get();
      const newItems = ids.map(id => {
        const item = st.graph[id]
        const node = st.nodes.find((n) => n.id === id)
        const position = node?.position
        const moved = position !== undefined ? { ...position, y: position.y + 100 } : { x: 0, y: 0 }
        return {
          id: "node-" + uuid(),
          selected: true,
          position: moved,
          dimensions: node?.data.dimensions,
          value: item
        }
      })
      const doc = st.doc;
      WorkflowDocumentUtils.onNodesAdd(doc, newItems);
      st.onSyncFromYjsDoc();
      st.onSelectNodes(newItems.map(item => item.id));
    },
    onPasteNodes: (nodes: PersistedWorkflowNode[]) => {
      const st = get();
      const doc = st.doc;
      WorkflowDocumentUtils.onNodesAdd(doc, nodes);
      st.onSyncFromYjsDoc();
      st.onSelectNodes(nodes.map(item => item.id));
    },
    onSelectNodes: (ids: string[]) => {
      const changes: NodeChange[] = ids.map((id) => ({ id, selected: true, type: "select" }));
      get().onNodesChange(changes);
    },
    onAddNode: (widget: Widget, position: XYPosition) => {
      const node = SDNode.fromWidget(widget);
      const { doc, onSyncFromYjsDoc } = get();
      const persistNode = {
        id: createNodeId(),
        position,
        dimensions: {
          width: 240,
          height: 80
        },
        value: node
      }

      WorkflowDocumentUtils.onNodesAdd(doc, [persistNode]);
      onSyncFromYjsDoc();
      return persistNode
    },
    /**
     * Mutation actions
     * @param changes 
     */
    onNodesChange: (changes) => {
      set((st) => {
        const nodes = applyNodeChanges(changes, st.nodes)
        changes.forEach(change => {
          if (change.type === "dimensions") {
            const node = nodes.find(node => node.id === change.id);
            const { dimensions } = change
            if (node && dimensions) {
              node.data.dimensions = dimensions
            }
          }
        });
        return {
          nodes
        }
      })
      const st = get();
      const { doc } = st;
      WorkflowDocumentUtils.onNodesChange(doc, changes);
      AppState.persistUpdateDoc(st, doc)
    },
    onDeleteNodes: (changes: (Node | { id: string })[]) => {
      console.log("on Node Delete");
      const { doc, onSyncFromYjsDoc, nodes } = get();

      /**
       * find group node & it's child nodes
       */
      let nodeIdsToDelete = changes.map(change => change.id);
      const groupNodes = changes.map(change => {
        const nodeId = change.id;
        const node = nodes.find(node => node.id === nodeId);
        return node;
      }).filter(node => node?.type === NODE_GROUP);

      groupNodes.forEach(groupNode => {
        const groupNodes = nodes.filter(node => node.parentNode === groupNode!.id);
        const groupNodeIds = groupNodes.map(node => node.id);
        nodeIdsToDelete = nodeIdsToDelete.concat(groupNodeIds);
      });

      nodeIdsToDelete = _.uniq(nodeIdsToDelete);

      WorkflowDocumentUtils.onDeleteNodes(doc, nodeIdsToDelete);

      onSyncFromYjsDoc();
    },
    onNodeFieldChange: (id, key, value) => {
      const { doc, onSyncFromYjsDoc, updateErrorCheck } = get();
      WorkflowDocumentUtils.onNodeFieldChange(doc, {
        id,
        key,
        value
      });
      onSyncFromYjsDoc();
      updateErrorCheck();
    },
    onNodePropertyChange: (id: NodeId, updates: Partial<SDNode["properties"]>) => {
      const st = get();
      st.onNodeAttributeChange(id, {
        properties: {
          ...st.graph[id].properties || {},
          ...updates
        }
      });
    },
    onNodeAttributeChange: (id: string, updates) => {
      const st = get();
      const { doc, onSyncFromYjsDoc } = get();
      WorkflowDocumentUtils.onNodeAttributeChange(doc, {
        id,
        updates
      });
      AppState.persistUpdateDoc(st, doc);
      onSyncFromYjsDoc();
    },
  }
}