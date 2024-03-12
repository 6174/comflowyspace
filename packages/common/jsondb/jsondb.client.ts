import config, { getBackendUrl } from '../config';
import { SlotEvent } from '../utils/slot-event';
import { JSONDBEvent, JSONDBReponse, type JSONDocMeta } from './jsondb.types';
import { useLiveDoc } from './use-live-jsondb';

let started = false;
export class JSONDBClient<T extends JSONDocMeta> {
  static updateEvent = new SlotEvent<JSONDBEvent>();

  static useLiveDoc = useLiveDoc;
  constructor(
    public collectionName: string
  ) {}
  
  static listen() {
    if (!started) {
      const socket = new WebSocket(`ws://${config.host}/ws/db`);
      socket.addEventListener("message", (event) => {
        JSONDBClient.updateEvent.emit(JSON.parse(event.data));
      });
      started = true;
    }
  }

  async createDocument(id: string, data: T): Promise<JSONDBReponse> {
    const response = await fetch(getBackendUrl(`/db/collection/${this.collectionName}/${id}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Get all documents
   */
  async getDocuments(): Promise<JSONDBReponse> {
    const response = await fetch(getBackendUrl(`/db/collection/${this.collectionName}`));
    return response.json(); 
  }

  /**
   * Get a document
   * @param id 
   * @returns 
   */
  async getDocument(id: string): Promise<JSONDBReponse> {
    const response = await fetch(getBackendUrl(`/db/collection/${this.collectionName}/${id}`));
    return response.json();
  }

  /**
   * Update a document
   * @param id 
   * @param data 
   * @returns 
   */
  async updateDocument(id: string, data: Record<string, any>): Promise<JSONDBReponse> {
    const response = await fetch(getBackendUrl(`/db/collection/${this.collectionName}/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  async deleteDocument(id: string): Promise<JSONDBReponse> {
    const response = await fetch(getBackendUrl(`/db/collection/${this.collectionName}/${id}`), {
      method: 'DELETE',
    });
    return response.json();
  }
}