import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import { type Edge, type Connection as FlowConnecton,   applyEdgeChanges,  OnConnectStartParams } from 'reactflow';
import { WorkflowDocumentUtils } from '../ydoc-utils';
import _ from "lodash";
import { NODE_REROUTE, Widget } from "../../types";

export default function createHook(set: AppStateSetter, get: AppStateGetter): Partial<AppState> {
  return {
    /**
     * connection stage
     * @param ev 
     * @param params 
     * @returns 
     */
    onConnectStart: (ev, params: OnConnectStartParams) => {
      console.log("on connect start", params);
      const st = get();
      if (!params.nodeId) {
        return;
      }

      const node = st.graph[params.nodeId];
      console.log("connecting node", params);
      const valueType = AppState.getValueTypeOfNodeSlot(st, node, params.handleId!, params.handleType!);

      set({
        connectingStartParams: {
          ...params,
          valueType
        }, isConnecting: true
      })
    },
    onConnectEnd: (ev) => {
      console.log("on connect end");
      set({ isConnecting: false, connectingStartParams: undefined })
    },
    onConnect: (connection: FlowConnecton) => {
      console.log("on connect", connection);
      const [validate, message] = validateEdge(get(), connection);
      if (!validate) {
        console.log("validate failed", message);
        return;
      }
      // remove old edge if exist
      // connect new edge
      const st = get();
      const { doc, onSyncFromYjsDoc } = st;
      const oldEdge = st.edges.find(edge => {
        return (
          edge.target === connection.target &&
          edge.targetHandle === connection.targetHandle
        )
      });
      if (oldEdge) {
        WorkflowDocumentUtils.onEdgesDelete(doc, [oldEdge.id]);
      }
      WorkflowDocumentUtils.addConnection(doc, connection);
      AppState.persistUpdateDoc(st, doc)
      onSyncFromYjsDoc();
    },
    /**
     * edit connected edge
     * @param changes 
     */
    onEdgesChange: (changes) => {
      set((st) => ({ edges: applyEdgeChanges(changes, st.edges) }))
    },
    onEdgeUpdate: (oldEdge: Edge, newConnection: FlowConnecton) => {
      console.log("on Edge Update", oldEdge, newConnection);
      const [validate, message] = validateEdge(get(), newConnection);
      if (!validate) {
        console.log("validate failed", message);
        return;
      }
      const st = get();
      const { doc, onSyncFromYjsDoc } = st;

      WorkflowDocumentUtils.onEdgeUpdate(doc, oldEdge, newConnection);

      onSyncFromYjsDoc();
    },
    onEdgesDelete: (changes: Edge[]) => {
      console.log("on Edge Delete");
      const { doc, onSyncFromYjsDoc } = get();
      WorkflowDocumentUtils.onEdgesDelete(doc, changes.map(edge => edge.id));
      onSyncFromYjsDoc();
    },
    onEdgeUpdateEnd: (ev: any, edge: Edge, success: boolean) => {
      console.log("on Edge Update End", edge);
    },
    onEdgeUpdateStart: () => {
      console.log("on Edge Update Start");
    },
  }
}

export function validateEdge(st: AppState, connection: FlowConnecton): [boolean, string] {
  const { source, sourceHandle, target, targetHandle } = connection;
  if (!source || !target) {
    return [false, "source or target is null"];
  }

  if (st.edges.find(edge =>
    edge.source === source &&
    edge.sourceHandle === sourceHandle &&
    edge.target === target &&
    edge.targetHandle === targetHandle)) {
    return [false, "edge already exist"];
  }

  let sourceNode = st.graph[source];
  const targetNode = st.graph[target];
  const sourceOutputs = sourceNode.outputs;
  const targetInputs = targetNode.inputs;

  if (targetNode.widget === NODE_REROUTE) {
    return [true, "success"];
  }

  /**
   * @TODO if source node is reroute，find the real source node and validate it
   */
  if (sourceNode.widget === NODE_REROUTE) {
    return [true, "success"];
    // const edge = st.edges.find(edge => {
    //   return edge.target === sourceNode.id
    // });
    // if (edge) {
    //   const realSource = edge.source;
    //   const realSourceNode = st.graph[realSource];
    //   sourceNode = realSourceNode;
    // } else {
    //   return [false, "source node is reroute but no real source node found"]
    // }
  }


  if (sourceHandle === "*" || targetHandle === "*") {
    return [true, "success"]
  }

  const output = sourceOutputs.find(output => output.name.toUpperCase() === sourceHandle);
  const input = targetInputs.find(input => input.name.toUpperCase() === targetHandle);

  if (Widget.isPrimitive(sourceNode.widget)) {
    if (input && ["INT", 'BOOL' , 'FLOAT','LIST', 'BOOLEAN', "COMBO", "STRING"].indexOf(input.type) >= 0) {
      return [true, "success"];
    } else {
      return [false, "output type not match, primitive node can only link to primitive field"]
    }
  }

  // console.log(sourceNode, targetNode, sourceOutputs, targetInputs, output, input, sourceHandle, targetHandle);

  if (!output) {
    return [false, "output is null"];
  }

  if (!input) {
    return [false, "input is null"]
  }
 
  if (output.type !== input.type) {
    return [false, "output type and input type not match"];
  }

  return [true, "success"];
}