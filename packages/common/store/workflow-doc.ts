/**
 * workflow document
 */
import { uuid } from "@/utils";
import {Node, Edge} from "reactflow";
import Y from "yjs";

export interface WorkflowDocument {
    id: string;
    title: string;
    nodes: Node[];
    edges: Edge[];
}

const WorkflowDocumentUtils = {
    fromJson(json: any): Y.Doc {
        const doc = new Y.Doc();
        const workflowMap = doc.getMap("workflow");
        workflowMap.set("id", json.id || uuid());
        workflowMap.set('title', json.title || 'Untitled');
        workflowMap.set('nodes', Y.Array.from(json.nodes));
        workflowMap.set('edges', Y.Array.from(json.edges));
        return doc;
    }
}

export {
    WorkflowDocumentUtils
}