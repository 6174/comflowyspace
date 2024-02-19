import { Request, Response, Express } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { ComflowyConsole } from './comflowy-console';
import * as http from "http";
import * as url from "url";
import logger from '../utils/logger';
import { ComflowyConsoleUpdateEvent } from './comflowy-console.types';

/**
 * Serve Console with websocket and http handlers
 * @param app 
 * @param server 
 * @param wss 
 */
export function serve(app: Express, server: http.Server, wss: WebSocketServer) {
  const clients: WebSocket[] = [];
  /**
   * upgrade
   */
  server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
    const parsedUrl = url.parse(req.url as string, true);
    if (parsedUrl.pathname === '/ws/db') {
      wss.handleUpgrade(req, socket, head, ws => {
        clients.push(ws);
        const syncState = () => {
          ws.send(JSON.stringify({
            type: "SYNC_STATE",
            data: ComflowyConsole.state
          }))
        }
        syncState();
        ws.on('sync_state', () => {
          syncState();
        });
        ws.on('close', () => {
          clients.splice(clients.indexOf(ws), 1);
        });
      });
    }
  });

  /**
   * create new log
   */
  app.post('/console/log', async (req: Request, res: Response) => {
    try {
      ComflowyConsole.log(req.body.message, req.body.data);
      res.send({
        success: true
      });
    } catch (err: any) {
      logger.info(err);
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  });

  /**
   * clear console
   * */ 
  app.post('/console/clear', async (req: Request, res: Response) => {
    try {
      ComflowyConsole.clearLogs();
      res.send({
        success: true
      });
    } catch (err: any) {
      logger.info(err);
      res.status(500).send({
        success: false,
        error: err.message
      });
    }
  });

  ComflowyConsole.updateEvent.on((ev: ComflowyConsoleUpdateEvent) => {
    if (ev.type === "CREATE_LOG") {
      const data = JSON.stringify(ev);
      broadcast(data);
    }

    if (ev.type === "CLEAR_LOGS") {
      const data = JSON.stringify(ev);
      broadcast(data);
    }

    if (ev.type === "UPDATE_ENV") {
      const data = JSON.stringify(ev);
      broadcast(data);
    }
  });

  function broadcast(data: any) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    })
  }
}
