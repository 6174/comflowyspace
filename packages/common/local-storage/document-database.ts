import { PreviewImage, SDNode } from '@/comfui-interfaces';
import defaultWorkflow from '../templates/default-workflow';
import Dexie, { Table } from 'dexie';
import { XYPosition, Connection } from 'reactflow';
import { getWorkflowTemplate } from '../templates/templates';
import { uuid } from '../utils';
import { throttle } from 'lodash';

export type PersistedWorkflowNode = {
  id: string;
  value: SDNode;
  selected?: boolean;
  dimension?: {
      width: number,
      height: number
  },
  images?: PreviewImage[],
  position: XYPosition
}
export type PersistedWorkflowConnection = ({id: string, selected?: boolean} & Connection)

export type PersistedWorkflowDocument = {
  id: string;
  title: string;
  nodes: Record<string, PersistedWorkflowNode>;
  connections: PersistedWorkflowConnection[];
}

export type PersistedFullWorkflow = {
  title: string;
  id: string;
  thumbnail?: string;
  last_edit_time?: number;
  create_time: number;
  snapshot: Pick<PersistedWorkflowDocument, "nodes" | "connections" >; // json format
}

export class DocumentDatabase extends Dexie {
  documents!: Table<PersistedFullWorkflow>;
  constructor() {
    super("DocumentDB");

    this.version(1).stores({
      documents: "id, title, last_edit_time",
    });
  }

  async getDoclistFromLocal() {
    return this.documents
      .toArray();
  }

  async getDocFromLocal(id: string) {
    return this.documents.get(id);
  }

  async createDocToLocal(docMeta: PersistedFullWorkflow) {
    return this.documents.add(docMeta);
  }

  async updateDocToLocal(docMeta: PersistedFullWorkflow) {
    // console.log("save to local", docMeta);
    return this.documents.put(docMeta);
  }

  async removeDocToLocal(docId: string) {
    return this.documents.delete(docId);
  }

  async createDocFromTemplate(key: string = "default"): Promise<PersistedFullWorkflow> {
    const template = getWorkflowTemplate(key);
    const doc: PersistedFullWorkflow = {
      id: uuid(),
      title: "untitled",
      create_time: +(new Date()),
      snapshot: template
    }
    await this.documents.add(doc);
    return doc;
  }
}

export const documentDatabaseInstance = new DocumentDatabase();

export const throttledUpdateDocument = throttle(async (doc: PersistedFullWorkflow)=> {
  await documentDatabaseInstance.updateDocToLocal(doc);
}, 1000);

export function retrieveLocalWorkflow(): PersistedWorkflowDocument {
  return defaultWorkflow as any;
  // const item = localStorage.getItem(GRAPH_KEY)
  // return item === null ? defaultWorkflow : JSON.parse(item)
}

const GRAPH_KEY = 'graph'
export function saveLocalWorkflow(graph: PersistedWorkflowDocument): void {
  localStorage.setItem(GRAPH_KEY, JSON.stringify(graph))
}