export type ChannelMessage = {
  type: string;
  payload: any;
}

export enum CHANNELS {
  MAIN = "main",
}

export enum CHANNEL_EVENTS {
  UPDATE_MODEL_META = "update_model_meta",
}