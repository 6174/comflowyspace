import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';
import path from 'path';
import * as fsExtra from 'fs-extra';
import { uuid } from '@comflowy/common';
import { SlotEvent } from '@comflowy/common/utils/slot-event';
import { JSONCollectionMeta, JSONDBEvent, type JSONDocMeta } from '@comflowy/common/jsondb/jsondb.types';

export class JSONDB<DocType extends JSONDocMeta> {
  static DB_PATH: string = "";
  /**
   * If there is too many docs in filesystem, we can use meta.json to store file metas for listing 
   */
  private metaDb!: Low<JSONCollectionMeta>;
  private docs: { [id: string]: Low<DocType>} = {};
  private dbName: string;
  updateEvent = new SlotEvent<JSONDBEvent>();

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  /**
   * static method to create a db instance in a async way
   * @param dbName 
   * @returns 
   */
  static db = async <DocType extends JSONDocMeta>(dbName: string): Promise<JSONDB<DocType>> => {
    const db = new JSONDB<DocType>(dbName);
    await db.init();
    return db;
  }

  /**
   * define the db path
   * @param dbPath 
   * @returns 
   */
  static dir = (dbPath?: string): string => {
    if (dbPath) {
      JSONDB.DB_PATH = dbPath;
      fsExtra.ensureDirSync(dbPath);
    }
    return JSONDB.DB_PATH;
  }

  static exist = async (name: string): Promise<boolean> => {
    const dbPath = path.join(JSONDB.DB_PATH, name);
    return await fsExtra.pathExists(dbPath);
  }

  /**
   * init the db
   */
  init = async () => {
    // Initialize existing docs
    const docsDir = path.join(__dirname, this.dbName);
    await fsExtra.ensureDir(docsDir);

    const metaAdapter = new JSONFile<JSONCollectionMeta>(this.#docFilePath("meta"));
    this.metaDb = new Low(metaAdapter, { docs: [], name: this.dbName });
    await this.metaDb.read();

    const files = await fsExtra.readdir(docsDir);

    for (let file in files) {
      if (file !== 'meta.json') {
        const docId = path.basename(file, '.json');
        const adapter = new JSONFile<DocType>(this.#docFilePath(docId));
        this.docs[docId] = new Low(adapter, {} as DocType);
        const docs = this.metaDb.data.docs;
        // Add docId to metaDb if it's not already there
        if (!docs[docId]) {
          docs.push(docId);
        }
      }
    }
  }

  /**
   * Get all docs
   * @returns 
   */
  getAllDocs = async (): Promise<DocType[]> => {
    const ret: DocType[] = [];
    for (let docId in this.docs) {
      const doc = await this.getDoc(docId);
      if (doc) {
        ret.push(doc);
      }
    }
    return ret;
  }

  /**
   * Get one doc
   * @param docId 
   * @returns 
   */
  getDoc = async (docId: string): Promise<DocType> => {
    const doc = this.docs[docId];
    if (doc) {
      await doc.read();
      return doc.data;
    }
    throw new Error("Doc not found")
  }

  /**
   * Create a new doc
   * @param doc 
   * @returns 
   */
  newDoc = async (doc: DocType): Promise<Low<DocType>> => {
    const docId = doc.id || uuid();
    const adapter = new JSONFile<DocType>(this.#docFilePath(docId));
    const newDoc = new Low(adapter, doc);

    await newDoc.write();

    this.docs[docId] = newDoc;

    const docs = this.metaDb.data.docs;
    docs.push(docId);

    await this.metaDb.write();

    this.updateEvent.emit({
      type: "CREATE",
      db: this.dbName,
      docId
    });

    return newDoc;
  }

  /**
   * Remove a doc by id
   * @param name 
   * @returns 
   */
  deleteDocHard = async (docId: string): Promise<void> => {
    const doc = this.docs[docId];
    if (doc) {
      const docs = this.metaDb.data.docs;
      docs.splice(docs.indexOf(docId), 1);
      await this.metaDb.write();
      await fsExtra.remove(this.#docFilePath(docId));
      this.updateEvent.emit({
        type: "DELETE_HARD",
        db: this.dbName,
        docId
      });
    } else {
      throw new Error("Doc is not exist")
    }
  }

  /**
   * Soft delete
   * @param docId 
   * @returns 
   */
  deleteDoc = async (docId: string) => {
    await this.updateDoc(docId, {
      deleted: true,
      deleted_at: +(new Date())
    })
    this.updateEvent.emit({
      type: "DELETE",
      db: this.dbName,
      docId
    });
  }

  /**
   * update doc
   * @param name 
   * @returns 
   */
  updateDoc = async (docId: string, updates: Record<string, any>): Promise<Low<DocType>> => {
    const doc = this.docs[docId];
    if (doc) {
      await doc.read();
      for (let key in updates) {
        (doc.data as any)[key] = updates[key];
      }
      doc.data.update_at = +(new Date());
      await doc.write();
      this.updateEvent.emit({
        type: "UPDATE",
        db: this.dbName,
        docId
      });
    } else {
      throw new Error("Doc is not exist")
    }
    return doc;
  }

  #docFilePath = (name: string): string => {
    return path.join(JSONDB.DB_PATH, this.dbName, `${name}.json`)
  }
}