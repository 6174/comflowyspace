import { NodeId } from "./comfy-node.types";
export enum ComfyUIEvents {
  ImageSave = "ImageSave",
  RunMessage = "RunMessage"
}

export interface MessageType {
  status: { status: { exec_info: { queue_remaining: number } }; sid?: string };
  executing: { node?: NodeId };
  execution_start: {
    prompt_id: string
  };
  progress: { value: number; max: number, node: NodeId, prompt_id: string }
  executed: { node: NodeId; output: Record<string, any> }
  execution_interrupted: { data: any }
}

export interface Message<K extends keyof MessageType> {
  type: K
  data: MessageType[K]
  prompt_id: string;
}

export const Message = {
  isStatus(m: Message<keyof MessageType>): m is Message<'status'> {
    return m.type === 'status'
  },

  isExecutingInterrupted(m: Message<keyof MessageType>): m is Message<'execution_interrupted'> {
    return m.type === "execution_interrupted"
  },

  isExecuting(m: Message<keyof MessageType>): m is Message<'executing'> {
    return m.type === 'executing'
  },

  isProgress(m: Message<keyof MessageType>): m is Message<'progress'> {
    return m.type === 'progress'
  },

  isExecutingStart(m: Message<keyof MessageType>): m is Message<'execution_start'> {
    return m.type === 'execution_start'
  },

  isExecuted(m: Message<keyof MessageType>): m is Message<'executed'> {
    return m.type === 'executed'
  },
}