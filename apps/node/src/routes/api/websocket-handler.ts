import {Express} from "express";
import {WebSocketServer, WebSocket} from "ws";
import * as http from "http";
import * as url from "url";
import { TaskEvent, taskQueue } from "@/modules/task-queue/task-queue";

// websocket handler
export function setupWebsocketHandler(app: Express) {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const clientMap: Map<string, WebSocket> = new Map();
  server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
    const ret = url.parse(req.url as string, true);
    if (ret.pathname === '/ws') {
      const clientId = (ret.query as any).clientId
      if (clientId) {
        wss.handleUpgrade(req, socket, head, ws => {
          clientMap.set(clientId, ws);
          ws.on('message', function incoming(message: string) {
            console.log("recieved Message", clientId, message);
          });
          ws.on('close', () => {
            clientMap.delete(clientId);
          });
        });
      }
    }
  });

  taskQueue.progressEvent.on((event: TaskEvent) => {
    const ws = clientMap.get(event.taskId);
    if (ws) {
        console.log("send progress event", event);
        ws.send(JSON.stringify(event));
    }
  });
}