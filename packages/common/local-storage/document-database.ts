import { SDNode } from '@/comfui-interfaces';
import defaultWorkflow from '../default/default-workflow';
import Dexie, { Table } from 'dexie';
import { XYPosition, Connection } from 'reactflow';

export type PersistedWorkflowNode = {
  id: string;
  value: SDNode;
  dimension?: {
      width: number,
      height: number
  },
  position: XYPosition
}
export type PersistedWorkflowConnection = ({id: string} & Connection)

export type PersistedWorkflowDocument = {
  id: string;
  title: string;
  nodes: Map<string, PersistedWorkflowNode>;
  connections: PersistedWorkflowConnection[];
}

export type PersistedFullWorkflow = {
  title: string;
  id: string;
  thumbnail: string;
  last_edit_date: number;
  snapshot: string; // json format
}

export class DocumentDatabase extends Dexie {
  documents!: Table<PersistedFullWorkflow>;
  constructor() {
    super("DocumentDB");

    this.version(1).stores({
      documents: "id, title, last_edit_date",
    });
  }

  async getDoclistFromLocal() {
    return this.documents.toArray();
  }

  async getDocFromLocal(id: string) {
    return this.documents.get(id);
  }

  async createDocToLocal(docMeta: PersistedFullWorkflow) {
    return this.documents.add(docMeta);
  }

  async updateDocToLocal(docMeta: PersistedFullWorkflow) {
    return this.documents.put(docMeta);
  }

  async removeDocToLocal(docId: string) {
    return this.documents.delete(docId);
  }
}

export const documentDatabaseInstance = new DocumentDatabase();

export function retrieveLocalWorkflow(): PersistedWorkflowDocument {
  return defaultWorkflow as any;
  // const item = localStorage.getItem(GRAPH_KEY)
  // return item === null ? defaultWorkflow : JSON.parse(item)
}

const GRAPH_KEY = 'graph'
export function saveLocalWorkflow(graph: PersistedWorkflowDocument): void {
  localStorage.setItem(GRAPH_KEY, JSON.stringify(graph))
}