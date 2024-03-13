import defaultWorkflow from '../templates/default-workflow';
import { getWorkflowTemplate } from '../templates/templates';
import { uuid } from '../utils';
import { throttle } from 'lodash';
import { JSONDBClient } from '../jsondb/jsondb.client';
import { ComfyUIWorkflow, PersistedFullWorkflow, PersistedWorkflowDocument } from '../comfui-interfaces';
import { comfyUIWorkflowToPersistedWorkflowDocument } from '../comfyui-bridge/export-import';
import { useAppStore } from '../store/app-state';

export class JSONDBDatabase {
  documents: JSONDBClient<PersistedFullWorkflow>
  constructor() {
    this.documents = new JSONDBClient<PersistedFullWorkflow>("workflows");
  }

  async getDocs(): Promise<PersistedFullWorkflow[]> {
    const ret = await this.documents.getDocuments();
    if (ret.success) {
      return ret.data
    } else {
      throw new Error("Get docs failed" + ret.error);
    }
  }

  async getDoc(id: string): Promise<PersistedFullWorkflow> {
    const ret = await this.documents.getDocument(id);
    if (ret.success) {
      return ret.data
    } else {
      throw new Error("Get Doc failed: " + ret.error);
    }
  }

  async createDoc(docMeta: PersistedFullWorkflow) {
    const ret = await this.documents.createDocument(docMeta.id, docMeta);
    if (!ret.success) {
      throw new Error("Create Doc failed: " + ret.error);
    }
  }

  async updateDoc(docMeta: PersistedFullWorkflow) {
    const ret = await this.documents.updateDocument(docMeta.id, docMeta);
    if (!ret.success) {
      throw new Error("Update failed" + ret.error);
    }
  }

  async deleteDocSoft(docId: string) {
    const ret = await this.documents.updateDocument(docId, { 
      deleted: true,
      deleted_time: +(new Date())
    });
    if (!ret.success) {
      throw new Error("Delete failed: " + ret.error);
    }
  }

  async deleteDoc(docId: string) {
    const ret = await this.documents.deleteDocument(docId);
    if (!ret.success) {
      throw new Error("Delete failed_: " + ret.error);
      
    }
  }

  async createDocFromTemplate(key: string = "default"): Promise<PersistedFullWorkflow> {
    const template = getWorkflowTemplate(key);
    const doc: PersistedFullWorkflow = {
      id: uuid(),
      title: template.title || "untitled",
      create_at: +(new Date()),
      snapshot: template
    }
    await this.createDoc(doc);
    return doc;
  }

  async createDocFromData(data: PersistedWorkflowDocument): Promise<PersistedFullWorkflow> {
    const doc: PersistedFullWorkflow = {
      id: uuid(),
      title: "untitled",
      create_at: +(new Date()),
      snapshot: data
    }
    await this.createDoc(doc);
    return doc;
  }

  async createDocFromComfyUIData(data: {
    name: string;
    data: ComfyUIWorkflow;
  }): Promise<PersistedFullWorkflow> {
    const widgets = useAppStore.getState().widgets;
    const snapshot = comfyUIWorkflowToPersistedWorkflowDocument(data.data, widgets);
    const doc: PersistedFullWorkflow = {
      id: uuid(),
      title: data.name || "untitled",
      create_at: +(new Date()),
      snapshot
    }
    await this.createDoc(doc);
    return doc;
  }
}

// export class DexieDatabase extends Dexie {
//   documents!: Table<PersistedFullWorkflow>;
//   constructor() {
//     super("DocumentDB");

//     this.version(1).stores({
//       documents: "id, title, last_edit_time",
//     });
//   }

//   async getDocs() {
//     return this.documents
//       .toArray();
//   }

//   async getDoc(id: string) {
//     return this.documents.get(id);
//   }

//   async createDoc(docMeta: PersistedFullWorkflow) {
//     return this.documents.add(docMeta);
//   }

//   async updateDoc(docMeta: PersistedFullWorkflow) {
//     // console.log("save to local", docMeta);
//     return this.documents.put(docMeta);
//   }

//   async deleteDocSoft(docId: string) {
//     return this.documents.update(docId, { 
//       deleted: true,
//       deleted_time: +(new Date())
//     });
//   }

//   async deleteDoc(docId: string) {
//     return this.documents.delete(docId);
//   }

//   async createDocFromTemplate(key: string = "default"): Promise<PersistedFullWorkflow> {
//     const template = getWorkflowTemplate(key);
//     const doc: PersistedFullWorkflow = {
//       id: uuid(),
//       title: "untitled",
//       create_at: +(new Date()),
//       snapshot: template
//     }
//     await this.documents.add(doc);
//     return doc;
//   }

//   async createDocFromData(data: PersistedWorkflowDocument): Promise<PersistedFullWorkflow> {
//     const doc: PersistedFullWorkflow = {
//       id: uuid(),
//       title: "untitled",
//       create_at: +(new Date()),
//       snapshot: data
//     }
//     await this.documents.add(doc);
//     return doc;
//   }
// }

export const documentDatabaseInstance = new JSONDBDatabase() // new DexieDatabase();

export const throttledUpdateDocument = throttle(async (doc: PersistedFullWorkflow)=> {
  await documentDatabaseInstance.updateDoc(doc);
}, 1000);

export function retrieveLocalWorkflow(): PersistedWorkflowDocument {
  return defaultWorkflow as any;
}

const GRAPH_KEY = 'graph'
export function saveLocalWorkflow(graph: PersistedWorkflowDocument): void {
  localStorage.setItem(GRAPH_KEY, JSON.stringify(graph))
}