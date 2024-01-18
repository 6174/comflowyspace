import { Express } from "express";
import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as url from "url";
import { TaskEvent, taskQueue } from "../../modules/task-queue/task-queue";
import { ComfyUIProgressEventType, comfyUIProgressEvent } from "../../modules/comfyui/bootstrap";
import logger from "src/modules/utils/logger";

// websocket handler
export function setupWebsocketHandler(app: Express): [http.Server, WebSocketServer] {
    const server = http.createServer(app);
    const wss = new WebSocketServer({ noServer: true });

    // task event channel
    const clientMap: Map<string, WebSocket> = new Map();
    
    // comfyui event channel
    const comfyUIClients: WebSocket[] = [];
    const comfyUIMessages:string[] = [];

    server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
        const ret = url.parse(req.url as string, true);
        if (ret.pathname === '/ws') {
            const clientId = (ret.query as any).clientId
            if (clientId) {
                wss.handleUpgrade(req, socket, head, ws => {
                    logger.info("set ws for, ", clientId);
                    clientMap.set(clientId, ws);
                    ws.on('message', function incoming(message: string) {
                        logger.info("recieved Message", clientId, message);
                    });
                    ws.on('close', () => {
                        clientMap.delete(clientId);
                    });
                });
            }
        }

        if (ret.pathname === "/ws/comfyui") {
            wss.handleUpgrade(req, socket, head, ws => {
                logger.info("connected comfyui ws");
                comfyUIClients.push(ws);
                comfyUIMessages.forEach(message => {
                    ws.send(message);
                });
                ws.on('message', function incoming(message: string) {
                    logger.info("recieved Message", message);
                });
                ws.on('close', () => {
                    comfyUIClients.splice(comfyUIClients.indexOf(ws), 1);
                });
            });
        }
    });

    taskQueue.progressEvent.on((event: TaskEvent) => {
        const ws = clientMap.get(event.task.taskId);
        if (ws) {
            const eventString = JSON.stringify(event)
            ws.send(eventString);
            logger.info(`[ComfyUI Process]: ${eventString}`);
        }
    });

    comfyUIProgressEvent.on((event: ComfyUIProgressEventType) => {
        const eventString = JSON.stringify(event);
        comfyUIMessages.push(eventString);
        comfyUIClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(eventString);
                logger.info(`[ComfyUI Process]: ${eventString}`);
            }
        });
    });

    return [server, wss];
}