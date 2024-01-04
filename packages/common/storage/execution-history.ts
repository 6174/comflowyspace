import Dexie, { Table } from 'dexie';

export type ExecutionHistory = {
  id: string;
  result: string;
  create_time: number;
  snapshot: string;
}

export class ExecutionHistoryDatabase extends Dexie {
  documents!: Table<ExecutionHistory>;
  constructor() {
    super("DocumentDB");

    this.version(1).stores({
      documents: "id, last_edit_time",
    });
  }

  async getDocs() {
    return this.documents
      .toArray();
  }

  async getDoc(id: string) {
    return this.documents.get(id);
  }

  async createDoc(doc: ExecutionHistory) {
    return this.documents.add(doc);
  }

  async updateDoc(doc: ExecutionHistory) {
    return this.documents.put(doc);
  }

  async removeDocToLocal(docId: string) {
    return this.documents.delete(docId);
  }
}

export const executionHistoryDatabase = new ExecutionHistoryDatabase();
