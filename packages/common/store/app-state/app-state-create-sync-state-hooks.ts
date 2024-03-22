import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import { throttledUpdateDocument } from "../../storage";
import _ from "lodash";
import { NODE_GROUP, NodeVisibleState, PersistedWorkflowDocument, UnknownWidget } from "../../types";

export default function createHook(set: AppStateSetter, get: AppStateGetter) {
  return {
    /**
     * Sync nodes and edges state from YJS Doc
     * for uno & redo, reload , load operations
     */
    onSyncFromYjsDoc: () => {
      set((st) => {
        const workflowMap = st.doc.getMap("workflow");
        const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
        const unknownWidgets = new Set<string>();
        throttledUpdateDocument({
          ...st.persistedWorkflow!,
          last_edit_time: +new Date(),
          snapshot: workflow
        });
  
        let state: AppState = { 
          ...st, 
          nodes: [], 
          edges: [],
          controlboard: workflow.controlboard
        }
        
        // add nodes
        for (const [key, node] of Object.entries(workflow.nodes)) {
          const widget = state.widgets[node.value.widget]
          if (widget !== undefined) {
            state = AppState.addNode(state, widget, node);
          } else {
            state = AppState.addNode(state, {
              ...UnknownWidget,
              name: node.value.widget,
              display_name: node.value.widget
            }, node);
            unknownWidgets.add(node.value.widget);
            // console.log(`Unknown widget ${node.value.widget}`)
          }
        }
        
        // add connections
        for (const connection of workflow.connections) {
          state = AppState.addConnection(state, connection)
        }    
        /**
         * modify nodes attributes according to node state
         * */ 
        state.nodes.forEach(item => {
          /**
           * toggle visible state
           */
          const nodeVisibleState = item.data.value.properties?.nodeVisibleState as NodeVisibleState || NodeVisibleState.Expaned;
          switch (nodeVisibleState) {
            case NodeVisibleState.Collapsed:
              item.width = 200;
              item.height = 40;
              break;
            default:
              break;
          }
  
          /**
           * check all node and group relations
           */
          const parentId = item.parentNode;
          if (parentId) {
            // edge case detection, 
            if (parentId === item.id) {
              item.parentNode = undefined;
            }
            const parentNode = state.graph[parentId];
            if (parentNode) {
              item.parentNode = parentId;
              const parentState = parentNode.properties?.nodeVisibleState as NodeVisibleState || NodeVisibleState.Expaned;
              switch (parentState) {
                case NodeVisibleState.Collapsed:
                  item.hidden = true;
                  item.selectable = false;
                  item.draggable = false;
                  // item.height = 20;
                  // item.width = 20;
                  item.position = {
                    x: 0,
                    y: 0
                  }
                  item.style = {
                    ...item.style,
                    width: 20,
                    height: 20,
                    visibility: 'hidden'
                  }
                  break;
                default:
                  // item.hidden = false;
                  break;
              }

              // add to parent's children
              if (parentNode.flowNode.data.children.indexOf(item.id) === -1) {
                parentNode.flowNode.data.children.push(item.id);
              }

            } else {
              item.parentNode = undefined;
            }
          }
        })

        /**
         * modify edge attributes according to node state
         *  */ 
        state.edges.forEach(edge => {
          const sourceNode = state.graph[edge.source];
          const targetNode = state.graph[edge.target];

          // sourceNode and parentNode are in the same container and the container is collapsed
          if (sourceNode.parent && targetNode.parent && sourceNode.parent === targetNode.parent) {
            const parentNode = state.graph[targetNode.parent];
            const nodeVisibleState = parentNode.properties?.nodeVisibleState as NodeVisibleState || NodeVisibleState.Expaned;
            if (nodeVisibleState === NodeVisibleState.Collapsed) {
              edge.hidden = true;
            }
          }

          // targetNode in a collapsed container
          if (targetNode && targetNode.parent && sourceNode.parent !== targetNode.parent) {
            const parentId = targetNode.parent;
            const parentNode = state.graph[targetNode.parent];
            if (parentNode && parentNode.widget === NODE_GROUP) {
              const nodeVisibleState = parentNode.properties?.nodeVisibleState as NodeVisibleState || NodeVisibleState.Expaned;
              if (nodeVisibleState === NodeVisibleState.Collapsed) {
                edge.target = parentId;
                edge.deletable = false;
                edge.focusable = false;
              }
            }
          }

          // sourceNode in a collapsed container
          if (sourceNode && sourceNode.parent && sourceNode.parent !== targetNode.parent) {
            const parentId = sourceNode.parent;
            const parentNode = state.graph[parentId];
            if (parentNode && parentNode.widget === NODE_GROUP) {
              const nodeVisibleState = parentNode.properties?.nodeVisibleState as NodeVisibleState || NodeVisibleState.Expaned;
              if (nodeVisibleState === NodeVisibleState.Collapsed) {
                edge.source = parentId;
                edge.deletable = false;
                edge.focusable = false;
              }
            }
          }
        });
  
        /**
         * Check is postive or is negative connection, and update graph
         */
        for (const connection of workflow.connections) {
          const sourceNode = state.graph[connection.source];
          const targetNode = state.graph[connection.target];
          const sourceOutputs = sourceNode.outputs;
          const targetInputs = targetNode.inputs;
          const output = sourceOutputs.find(output => output.name.toUpperCase() === connection.sourceHandle);
          const input = targetInputs.find(input => input.name.toUpperCase() === connection.targetHandle);
          const sourceGraphNode = state.graph[connection.source];
          if (output && input) {
            if (output.type === "CONDITIONING") {
              if (input.name === "negative") {
                sourceGraphNode.isNegative = true;
              } else if (input.name === "positive") {
                sourceGraphNode.isPositive = true;
              }
            }
          }
        }

        return {
          ...state,
          unknownWidgets
        }
      }, true)
    },
  }
}