import { JSONDocMeta } from '@comflowy/common/jsondb/jsondb.types';
import { JSONDB } from './jsondb';
import { getAppDataDir } from '../utils/get-appdata-dir';
import { JSONFile } from 'lowdb/node';
import path from "path";
import { Low } from 'lowdb';
import * as fsExtra from "fs-extra";

type Doc = {title: string} & JSONDocMeta;

console.log(getAppDataDir());
JSONDB.dir(getAppDataDir());
async function test() {
  // test node
  // const base_dir = getAppDataDir();
  // const file_path = path.resolve(base_dir, "meta.json")
  // const metaAdapter = new JSONFile<Doc>(file_path);
  // const metaDb = new Low(metaAdapter, {title: "haha", id: "asa", create_at: 123});
  // await metaDb.read();
  // await metaDb.write();

  // console.log("data", metaDb.data);
  // await metaDb.update((db) => {
  //   db.create_at = 345
  // })

  // console.log(file_path);
  // await metaDb.write();
  // if (fsExtra.existsSync(file_path)) {
  //   console.log("file exist");
  // } else {
  //   console.log("file not exist");
  // }

  const db = await JSONDB.db<Doc>("test", ["id", "title"]);
  const doc = await db.newDoc({
    id: "test",
    title: "test",
    create_at: +new Date(),
  })
  
  await doc.read();
  if (doc.data.id !== "test") {
    console.log("test failed");
  } else {
    console.log("test success");
  }
}

test();