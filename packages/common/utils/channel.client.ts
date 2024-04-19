import { IMessageEvent, w3cwebsocket as W3CWebSocket } from 'websocket';
import { SlotEvent } from './slot-event';
import { ChannelMessage } from '../types/channel.types';

export class Channel {
  id: string;
  private client: W3CWebSocket;
  channelSlot: SlotEvent<ChannelMessage> = new SlotEvent();

  constructor(id: string) {
    this.id = id;
    this.#subscribe();
    this.client = new W3CWebSocket(`ws://localhost:8000/${id}`);
  }
  
  #subscribe() {
    this.client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    this.client.onmessage = (ev: IMessageEvent) => {
      const message = JSON.parse(ev.data as string) as ChannelMessage;
      this.channelSlot.emit(message);
    };
  }

  on(event: string, callback: Function) {
    this.channelSlot.on((ev) => {
      if (ev.type === event) {
        callback(ev.payload)
      }
    });
  }

  emit(event: string, payload: any) {
    this.channelSlot.emit({ type: event, payload });
    this.client.send(JSON.stringify({ type: event, payload }));
  }

  unsubscribe() {
    this.client.close();
  }
}

export function channel(id: string) {
  return new Channel(id);
}