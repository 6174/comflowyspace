import { Request, Response, Express } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { JSONDB } from './jsondb'; // Assuming you have exported the class
import * as http from "http";
import * as url from "url";
import { getAppDataDir } from '../utils/get-appdata-dir';
import path from 'path';
import { JSONDocMeta } from '@comflowy/common/jsondb/jsondb.types';

export function serve(app: Express, server: http.Server, wss: WebSocketServer) {  
  const dbs: Record<string, JSONDB<JSONDocMeta> > = {};
  const clients: WebSocket[] = [];
  const dbPath = path.resolve(getAppDataDir(), "db");
  JSONDB.dir(dbPath);
  async function createAndListen(name: string) {
    if (!dbs[name]) {
      dbs[name] = await JSONDB.db<JSONDocMeta>(name, ["id", "create_at", "gallery", "deleted", "deleted_at", "update_at"]);
      dbs[name].updateEvent.on((event) => {
        const data = JSON.stringify(event);
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        })
      });
    }
    return dbs[name];
  }

  server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
    const parsedUrl = url.parse(req.url as string, true);
    if (parsedUrl.pathname === '/ws/db') {
      wss.handleUpgrade(req, socket, head, ws => {
        clients.push(ws);
        ws.on('message', function incoming(message: string) {
          console.log("recieved Message", message);
        });
        ws.on('close', () => {
          clients.splice(clients.indexOf(ws), 1);
        });
      });
    }
  });

  // Handle document operations
  app.post('/db/collection/:name/:id', async (req: Request, res: Response) => {
    try {
      const { name, id } = req.params;
      const db = await createAndListen(name);
      await db.newDoc({ id, ...req.body });
      res.send({
        success: true
      });
    } catch (err: any) {
      console.log(err);
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  });

  // Get All docs of a collection
  app.get('/db/collection/:name', async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      if (!await JSONDB.exist(name)) {
        res.status(404).send('Collection not found');
        return;
      }
      const db = await createAndListen(name);
      const data = await db.getAllDocs();
      res.send({
        success: true,
        data
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  });
  
  app.get('/db/collection/:name/:id', async (req: Request, res: Response) => {
    try {
      const { name, id } = req.params;
      if (!await JSONDB.exist(name) ) {
        res.status(404).send('Collection not found');
        return;
      }
      const db = await createAndListen(name);
      const data = await db.getDoc(id);
      res.send({
        success: true,
        data
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  });
  
  app.put('/db/collection/:name/:id', async (req: Request, res: Response) => {
    const { name, id } = req.params;
    try {
      if (!await JSONDB.exist(name)) {
        res.status(404).send('Collection not found');
        return;
      }
      const db = await createAndListen(name);
      await db.updateDoc(id, req.body);  
      res.send({
        success: true
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  });
  
  app.delete('/db/collection/:name/:id', async (req: Request, res: Response) => {
    const { name, id } = req.params;
    try {
      if (!await JSONDB.exist(name)) {
        res.status(404).send('Collection not found');
        return;
      }
      const db = await createAndListen(name);
      await db.deleteDoc(id);
      res.send('Document deleted');
    } catch(err: any) {
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  }); 
}
