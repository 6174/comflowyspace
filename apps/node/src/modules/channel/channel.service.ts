import { Request, Response, Express } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import * as url from "url";
import { ChannelMessage } from "@comflowy/common/types/channel.types";
import { SlotEvent } from '@comflowy/common/utils/slot-event';
import * as http from "http";

/**
 * This is a general message channel like Supabase channel, for communication between node layer and frontend layer
 */
class ChannelService {
  private channelSlots: Record<string, SlotEvent<ChannelMessage>> = {};
  private clients: Record<string, WebSocket[]> = {};

  serve(app: Express, server: http.Server, wss: WebSocketServer) {
    server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
      const parsedUrl = url.parse(req.url as string, true);
      if (parsedUrl.pathname === '/ws/channel') {
        const channel = parsedUrl.query.c as string;

        if (!this.clients[channel]) {
          this.clients[channel] = [];
        }

        if (!this.channelSlots[channel]) {
          this.channelSlots[channel] = new SlotEvent();
        }

        wss.handleUpgrade(req, socket, head, ws => {
          this.clients[channel].push(ws);
          ws.on('message', (messageStr: string) => {
            const message = JSON.parse(messageStr) as ChannelMessage;
            this.channelSlots[channel].emit(message);
          });
          ws.on('close', () => {
            const index = this.clients[channel].indexOf(ws);
            if (index !== -1) {
              this.clients[channel].splice(index, 1);
            }
          });
        });
      }
    });
  }

  on(channel: string, event: string, callback: (data: any) => void) {
    return this.channelSlots[channel]?.on(callback);
  }

  emit(channel: string, message: ChannelMessage) {
    this.channelSlots[channel]?.emit(message);
    this.clients[channel]?.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export const channelService = new ChannelService();