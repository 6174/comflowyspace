import { JSONDocMeta } from '@comflowy/common/jsondb/jsondb.types';
import { JSONDB } from './jsondb';
import { getAppDataDir } from '../utils/get-appdata-dir';
import path from "path";
import logger from '../utils/logger';

type Doc = {title: string} & JSONDocMeta;

logger.info(getAppDataDir());
JSONDB.dir(path.resolve(getAppDataDir(), "db"));
async function test() {
  // test node
  // const base_dir = getAppDataDir();
  // const file_path = path.resolve(base_dir, "meta.json")
  // const metaAdapter = new JSONFile<Doc>(file_path);
  // const metaDb = new Low(metaAdapter, {title: "haha", id: "asa", create_at: 123});
  // await metaDb.read();
  // await metaDb.write();

  // logger.info("data", metaDb.data);
  // await metaDb.update((db) => {
  //   db.create_at = 345
  // })

  // logger.info(file_path);
  // await metaDb.write();
  // if (fsExtra.existsSync(file_path)) {
  //   logger.info("file exist");
  // } else {
  //   logger.info("file not exist");
  // }

  const db = await JSONDB.db<Doc>("workflows", ["id", "title"]);
}

test();