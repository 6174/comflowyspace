/**
 * workflow document
 */
import { uuid } from "../utils";
import {NodeChange, EdgeChange, type Connection as FlowConnecton, Connection, XYPosition, Dimensions, Edge} from "reactflow";
import * as Y from "yjs";
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode } from "../types";
import { NodeId, PreviewImage } from "../types";
import { ControlBoardConfig } from "../workflow-editor/controlboard";

export const createNodeId = () => `node-${uuid()}`;
export const createConnectionId = () => `conn-${uuid()}`;

export type TemporaryNodeState =  Record<NodeId, {
    position?: XYPosition,
    dimensions?: Dimensions
}>;

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

        if (json.controlboard) {
            workflowMap.set("controlboard", json.controlboard);
        }
        return doc;
    },
    updateControlBoard(doc: Y.Doc, controlboard: ControlBoardConfig) {
        const workflowMap = doc.getMap("workflow");
        workflowMap.set("controlboard", controlboard);
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
    onSyncupTemporaryState(doc: Y.Doc, temporaryNodeStates: TemporaryNodeState) {
        doc.transact(() => {
            const workflowMap = doc.getMap("workflow");
            const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
            Object.entries(temporaryNodeStates || {}).forEach(([key, node]) => {
                const {position, dimensions} = node;
                if (position) {
                    nodesMap.set(key, {
                        ...nodesMap.get(key)!,
                        position,
                    });
                }
                if (dimensions) {
                    nodesMap.set(key, {
                        ...nodesMap.get(key)!,
                        dimensions,
                    });
                }
            });
        })
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
                        // console.log("change dimension", change);
                        if (change.dimensions) {
                            nodesMap.set(change.id, {
                                ...nodesMap.get(change.id)!,
                                "dimensions": change.dimensions,
                            });
                        }
                        break;
                    case "position":
                        if (change.position) {
                            nodesMap.set(change.id, {
                                ...nodesMap.get(change.id)!,
                                "position": change.position,
                            });
                        }
                        break;
                    default:
                        break;
                }
            })
        }); 
    },
    onImageSave: (doc: Y.Doc, id: string, images: PreviewImage[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
            nodesMap.set(id, {
                ...nodesMap.get(id)!,
                "images": images,
            });
        }); 
    },
    onDeleteNodes: (doc: Y.Doc, ids: string[]) => {
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
        // const connectionsArray = (doc.getMap("workflow").get("connections") as Y.Array<PersistedWorkflowConnection>);
        // doc.transact(() => {
        //     changes.forEach((change: EdgeChange)=> {
        //         let index: number;
        //         switch (change.type) {
        //             case "select":
        //                 // index = connectionsArray.toArray().findIndex(conn => conn.id === change.id);
        //                 // const connection = connectionsArray.get(index)!;
        //                 // if (connection) {
        //                 //     connection.selected = change.selected;
        //                 // }
        //                 break;
        //             default:
        //                 break;
        //         }
        //     })
        // });
    },
    onEdgeUpdate: (doc: Y.Doc, oldEdge: Edge, newConnection: FlowConnecton) => {
        const connectionsArray = (doc.getMap("workflow").get("connections") as Y.Array<PersistedWorkflowConnection>);
        doc.transact(() => {
            const index = connectionsArray.toArray().findIndex(conn => conn.id === oldEdge.id);
            const connection = connectionsArray.get(index)!;
            if (connection) {
                connection.source = newConnection.source!;
                connection.sourceHandle = newConnection.sourceHandle!;
                connection.target = newConnection.target!;
                connection.targetHandle = newConnection.targetHandle!;
            }
        });
    },
    onEdgesDelete: (doc: Y.Doc, ids: string[]) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            const connectionsArray = (workflowMap.get("connections") as Y.Array<PersistedWorkflowConnection>);
            const rawArray = connectionsArray.toArray().slice().reverse();
            const length = connectionsArray.length;
            rawArray.forEach((item, index) => {
                if (ids.includes(item.id)) {
                    connectionsArray.delete(length - 1 - index);
                }
            })

        });
    },
    addConnection: (doc: Y.Doc, connection: Connection) => {
        const workflowMap = doc.getMap("workflow");
        const connectionsArray = (workflowMap.get("connections") as Y.Array<PersistedWorkflowConnection>);
        connectionsArray.push([{
            ...connection as any,
            id: "conn_" + uuid(),
        }])
    },
    onNodeFieldChange: (doc: Y.Doc, change: {
        id: string,
        key: string,
        value: any
    }) => {
        const workflowMap = doc.getMap("workflow");
        const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>)
        doc.transact(() => {
            const node = nodesMap.get(change.id)!
            const value = node.value || {} as any;
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
    },
    onNodeAttributeChange: (doc: Y.Doc, change: {
        id: string,
        updates: Record<string, any>
    }) => {
        const workflowMap = doc.getMap("workflow");
        const nodesMap = (workflowMap.get("nodes") as Y.Map<PersistedWorkflowNode>) 
        doc.transact(() => {
            const node = nodesMap.get(change.id)!
            const value = node.value || {} as any;
            nodesMap.set(change.id, {
                ...node,
                value: {
                    ...value,
                    ...change.updates
                }
            })
        });
    },
    onAttributeChange: (doc: Y.Doc, changes: Record<string, any>) => {
        const workflowMap = doc.getMap("workflow");
        doc.transact(() => {
            Object.entries(changes).forEach(([key, value]) => {
                if (["title", "id", "last_edit_time", "create_time"].includes(key)) {
                    workflowMap.set(key, value);
                }
            })
        })
    }
}

export {
    WorkflowDocumentUtils
}