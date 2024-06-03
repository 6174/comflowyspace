import { IMessageEvent, w3cwebsocket as W3CWebSocket } from 'websocket';
import { IDisposable, SlotEvent } from './slot-event';
import { CHANNELS, ChannelMessage } from '../types/channel.types';
import config from '../config';

export class Channel {
  id: string;
  private client: W3CWebSocket;
  channelSlot: SlotEvent<ChannelMessage> = new SlotEvent();
  subChannelSlots: Map<string, SlotEvent<ChannelMessage>> = new Map();
  _subscribed = false;

  constructor(id: string) {
    this.id = id;
    this.client = new W3CWebSocket(`ws://${config.host}/ws/channel?c=${id}`);
  }
  
  subscribe() {
    if (this._subscribed) {
      return
    }
    this._subscribed = true;
    this.client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    this.client.onmessage = (ev: IMessageEvent) => {
      const message = JSON.parse(ev.data as string) as ChannelMessage;
      console.log(message);
      this.channelSlot.emit(message);
      if (message.subChannel) {
        const subChannelSlot = this.subChannelSlots.get(message.subChannel);
        if (subChannelSlot) {
          subChannelSlot.emit(message);
        }
      }
    };
  }

  on(event: string, callback: Function): IDisposable {
    return this.channelSlot.on((ev) => {
      if (ev.type === event) {
        callback(ev)
      }
    });
  }

  onSub(channel: string, event: string, callback: Function): IDisposable {
    let subChannelSlot = this.subChannelSlots.get(channel);
    if (!subChannelSlot) {
      subChannelSlot = new SlotEvent();
      this.subChannelSlots.set(channel, subChannelSlot);
    }
    return subChannelSlot.on((ev) => {
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

export function createChannel(id: string) {
  return new Channel(id);
}

let mainChannel: Channel;
export function getMainChannel() {
  if (mainChannel) {
    return mainChannel;
  }
  mainChannel = new Channel(CHANNELS.MAIN);
  return mainChannel
}


