import { NodeId } from "./comfy-node.types";
export enum ComfyUIEvents {
  ImageSave = "ImageSave",
  RunMessage = "RunMessage"
}

export interface MessageType {
  status: { status: { exec_info: { queue_remaining: number } }; sid?: string };
  progress: { value: number; max: number, node: NodeId, prompt_id: string }
  executing: { node?: NodeId };
  executed: { node: NodeId; output: Record<string, any> }
  execution_start: {
    prompt_id: string
  };
  execution_error: {
    node_id: NodeId;
    prompt_id: string,
    node_type: string,
    executed: any[],
    exception_message: any,
    exception_type: any,
    traceback: string[],
    current_inputs: any,
    current_outputs: any,
  },
  execution_cached: {

  },
  execution_interrupted: { data: any }
}

export interface Message<K extends keyof MessageType> {
  type: K
  data: MessageType[K]
  prompt_id: string;
}

export const Message = {
  formatExecutionError(error: MessageType["execution_error"]): {title: string, message: string} {
    if (error == null) {
      return {
        title: "(unknown error)",
        message: ""
      }
    }

    const traceback = error.traceback.join("")
    const nodeType = error.node_type

    return  {
      title: `Error occurred when executing ${nodeType}`,
      message: `${error.exception_message}\n\n${traceback}`
    }
  },

  isExecutingError(m: Message<keyof MessageType>): m is Message<'execution_error'> {
    return m.type === 'execution_error'
  },

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