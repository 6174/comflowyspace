/**
 * workflow document
 */
import { uuid } from "../utils";
import {NodeChange, EdgeChange, type Connection as FlowConnecton, Connection, XYPosition} from "reactflow";
import * as Y from "yjs";
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode } from "@/local-storage";

export const createNodeId = () => `node-${uuid()}`;
export const createConnectionId = () => `conn-${uuid()}`;

const WorkflowDocumentUtils = {
    fromJson(json: PersistedWorkflowDocument): Y.Doc {
        const doc = new Y.Doc();
        const workflowMap = doc.getMap("workflow");
        // set meta
        workflowMap.set("id", json.id || uuid());
        workflowMap.set('title', json.title || 'Untitled');

        // create nodes array
        const nodesMap = new Y.Map<PersistedWorkflowNode>();
        Object.entries(json.nodes || {}).forEach(([key, node]) => {
            nodesMap.set(key, {
                ...node,
                id: key
            } as PersistedWorkflowNode);
        });
        workflowMap.set("nodes", nodesMap);

        // create connections array
        const connectionsArray = new Y.Array<PersistedWorkflowConnection>();
        (json.connections || []).forEach((conn: PersistedWorkflowConnection) => {
            connectionsArray.push([{
                ...conn,
                id: conn.id || createConnectionId(),
            }]);  
        });
        workflowMap.set("connections", connectionsArray);
        return doc;
    },
    updateByJson(doc: Y.Doc, json: PersistedWorkflowDocument) {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            // create nodes array
            const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>);
            nodesMap.clear();
            Object.entries(json.nodes || {}).forEach(([key, node]) => {
                nodesMap.set(key, {
                    ...node,
                    id: key
                } as PersistedWorkflowNode);
            });
            // create connections array
            const connectionsArray = (workflowMap.get("connections") as Y.Array<PersistedWorkflowConnection>);
            connectionsArray.delete(0, connectionsArray.length);
            (json.connections || []).forEach((conn: PersistedWorkflowConnection) => {
                connectionsArray.push([{
                    ...conn,
                    id: conn.id || createConnectionId(),
                }]);  
            });
        });
    },
    toJson(doc: Y.Doc): PersistedWorkflowDocument {
        const workflowMap = doc.getMap("workflow");
        const json = workflowMap.toJSON();
        delete json.selectedNode;
        return json as PersistedWorkflowDocument;
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
            const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
            changes.forEach(change => {
                switch (change.type) {
                    // add change is triggered by another method
                    case "dimensions":
                        nodesMap.set(change.id, {
                            ...nodesMap.get(change.id)!,
                            "dimensions": change.dimensions,
                        });
                        break;
                    case "position":
                        const key = change.type;
                        nodesMap.set(change.id, {
                            ...nodesMap.get(change.id)!,
                            "position": change.position || nodesMap.get(change.id)!.position,
                        });
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
            const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
            ids.forEach(id => {
                nodesMap.delete(id);
                const connections = workflowMap.get("connections") as Y.Array<PersistedWorkflowConnection>;
                const connectionsToDelete: number[] = []
                connections.forEach((conn, index) => {
                    if (conn.source === id || conn.target === id) {
                        connectionsToDelete.push(index);
                    }
                });
                console.log("connections count", connectionsToDelete);
                connectionsToDelete.sort((a, b) => b - a);
                connectionsToDelete.forEach(index => {
                    connections.delete(index);
                });
            })
        });
    },
    onNodesAdd: (doc: Y.Doc, nodes: PersistedWorkflowNode[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
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
        const connectionsArray = (doc.getMap("workflow").get("connections") as Y.Array<PersistedWorkflowConnection>);
        doc.transact(() => {
            changes.forEach((change: EdgeChange)=> {
                let index: number;
                switch (change.type) {
                    case "select":
                        index = connectionsArray.toArray().findIndex(conn => conn.id === change.id);
                        const connection = connectionsArray.get(index)!;
                        connection.selected = change.selected;
                        break;
                    default:
                        break;
                }
            })
        });
    },
    onEdgesDelete: (doc: Y.Doc, ids: string[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const connectionsArray = (workflowMap.get("connections") as Y.Array<PersistedWorkflowConnection>);
            const rawArray = connectionsArray.toArray().map(conn => conn.id);
            const connectionsToDelete = ids.map(id => rawArray.indexOf(id));
            connectionsToDelete.sort((a, b) => b - a);
            connectionsToDelete.forEach(index => {
                connectionsArray.delete(index);
            });
        });
    },
    addConnection: (doc: Y.Doc, connection: Connection) => {
        const workflowMap = doc.getMap("workflow");
        const connectionsArray = (workflowMap.get("connections") as Y.Array<PersistedWorkflowConnection>);
        connectionsArray.push([{
            ...connection,
            id: "conn_" + uuid(),
        }])
    },
    onPropChange: (doc: Y.Doc, change: {
        id: string,
        key: string,
        value: any
    }) => {
        const workflowMap = doc.getMap("workflow");
        const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
        doc.transact(() => {
            const node = nodesMap.get(change.id)!
            const value = node.value || {};
            const fields = value.fields || {};
            nodesMap.set(change.id, {
                ...node,
                value: {
                    ...value,
                    fields: {
                        ...fields,
                        [change.key]: change.value,
                    }
                }
            })
        });
    }
}

export {
    WorkflowDocumentUtils
}