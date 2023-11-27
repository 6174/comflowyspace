/**
 * workflow document
 */
import { SDNode } from "@/comfui-interfaces";
import { uuid } from "@/utils";
import {NodeChange, EdgeChange, type Connection as FlowConnecton} from "reactflow";
import Y from "yjs";
import { AppState } from "./appstate";

type WorkflowNode = {
    id: string;
    value: SDNode;
    dimension: {
        width: number,
        height: number
    },
    position: {
        x: number,
        y: number
    }
}
type WorkflowConnection = ({id: string} & FlowConnecton)

export type WorkflowDocument = {
    id: string;
    title: string;
    nodes: Map<string, WorkflowNode>;
    connections: WorkflowConnection[];
}

const WorkflowDocumentUtils = {
    fromJson(json: any): Y.Doc {
        const doc = new Y.Doc();
        const workflowMap = doc.getMap("workflow");
        // set meta
        workflowMap.set("id", json.id || uuid());
        workflowMap.set('title', json.title || 'Untitled');

        // create nodes array
        const nodesMap = new Y.Map<WorkflowNode>();
        Object.entries(json.nodes || {}).forEach(([key, node]) => {
            nodesMap.set(key, node as WorkflowNode);
        });
        workflowMap.set("nodes", nodesMap);

        // create connections array
        const connectionsArray = new Y.Array<WorkflowConnection>();
        (json.connections || []).forEach((conn: any) => {
            connectionsArray.push(conn);  
        });
        workflowMap.set("connections", connectionsArray);

        return doc;
    },
    // https://reactflow.dev/api-reference/types/node-change
    // export type NodeChange =
    //   | NodeDimensionChange
    //   | NodePositionChange
    //   | NodeSelectionChange
    //   | NodeRemoveChange
    //   | NodeAddChange
    //   | NodeResetChange;
    onNodesChange: (doc: Y.Doc, changes: NodeChange[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const nodesMap = (workflowMap.get("nodes") as Y.Map<WorkflowNode>)
            changes.forEach(change => {
                switch (change.type) {
                    // add change is triggered by another method
                    // case "add":
                    //     workflowMap.get("nodes").set(change.id, change.node);
                    //     break;
                    case "dimensions":
                    case "position":
                        const key = change.type;
                        nodesMap.set(change.id, {
                            ...nodesMap.get(change.id)!,
                            [key]: (change as any)[key],
                        });
                        break;
                    case "remove":
                        nodesMap.delete(change.id);
                        break;
                    default:
                        break;
                }
            })
        });
        
    },
    //export type EdgeChange =
    //   | EdgeAddChange
    //   | EdgeRemoveChange
    //   | EdgeResetChange
    //   | EdgeSelectionChange;
    onEdgesChange: (doc: Y.Doc, changes: EdgeChange[]) => {
        const connectionsArray = (doc.getMap("workflow").get("connections") as Y.Array<WorkflowConnection>);
        doc.transact(() => {
            changes.forEach((change: EdgeChange)=> {
                switch (change.type) {
                    // case "add":
                    //     connectionsArray.push(change.connection);
                    //     break;
                    case "remove":
                        const index = connectionsArray.toArray().findIndex(conn => conn.id === change.id);
                        connectionsArray.delete(index);
                        break;
                    default:
                        break;
                }
            })
        });
    },
    onPropChange: (doc: Y.Doc, change: {
        id: string,
        key: string,
        value: any
    }) => {
        const workflowMap = doc.getMap("workflow");
        const nodesMap = (workflowMap.get("nodes") as Y.Map<WorkflowNode>)
        doc.transact(() => {
            nodesMap.set(change.id, {
                ...nodesMap.get(change.id)!,
                [change.key]: change.value,
            })
        });
    }
}

export {
    WorkflowDocumentUtils
}