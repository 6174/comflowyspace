/**
 * workflow document
 */
import { SDNode } from "@/comfui-interfaces";
import { uuid } from "../utils";
import {NodeChange, EdgeChange, type Connection as FlowConnecton, Connection, XYPosition} from "reactflow";
import Y from "yjs";

type WorkflowNode = {
    id: string;
    value: SDNode;
    dimension?: {
        width: number,
        height: number
    },
    position: XYPosition
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
    toJson(doc: Y.Doc): WorkflowDocument {
        const workflowMap = doc.getMap("workflow");
        return workflowMap.toJSON() as WorkflowDocument;
    },
    addConnection: (doc: Y.Doc, connection: Connection) => {
        const workflowMap = doc.getMap("workflow");
        const connectionsArray = (workflowMap.get("connections") as Y.Array<WorkflowConnection>);
        connectionsArray.push([{
            ...connection,
            id: "conn_" + uuid(),
        }])
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
    onNodesDelete: (doc: Y.Doc, ids: string[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const nodesMap = (workflowMap.get("nodes") as Y.Map<WorkflowNode>)
            ids.forEach(id => {
                nodesMap.delete(id);
                const connections = workflowMap.get("connections") as Y.Array<WorkflowConnection>;
                connections.forEach((conn, index) => {
                    if (conn.source === id || conn.target === id) {
                        connections.delete(index);
                    }
                })
            })
        });
    },
    onNodesAdd: (doc: Y.Doc, nodes: WorkflowNode[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const nodesMap = (workflowMap.get("nodes") as Y.Map<WorkflowNode>)
            nodes.forEach(node => {
                nodesMap.set(node.id, node);
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
            const node = nodesMap.get(change.id)!
            nodesMap.set(change.id, {
                ...node,
                value: {
                    ...node.value,
                    [change.key]: change.value,
                }
            })
        });
    }
}

export {
    WorkflowDocumentUtils
}