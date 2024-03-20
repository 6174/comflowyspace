import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import { throttledUpdateDocument } from "../../storage";
import _ from "lodash";
import { NodeVisibleState, PersistedWorkflowDocument, UnknownWidget } from "../../types";

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
  
        for (const connection of workflow.connections) {
          state = AppState.addConnection(state, connection)
        }
  
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
                  // item.hidden = true;
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
            } else {
              item.parentNode = undefined;
            }
          }
        })
  
        // console.log("render", state.nodes.map( node => node.position));
  
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