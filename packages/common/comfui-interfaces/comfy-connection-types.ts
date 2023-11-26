import { NodeId } from "./comfy-node-types";

export interface MessageType {
    status: { status: { exec_info: { queue_remaining: number } }; sid?: string }
    executing: { node?: NodeId }
    progress: { value: number; max: number }
    executed: { node: NodeId; output: Record<string, any> }
  }
  
  export interface Message<K extends keyof MessageType> {
    type: K
    data: MessageType[K]
  }
  
  export const Message = {
    isStatus(m: Message<keyof MessageType>): m is Message<'status'> {
      return m.type === 'status'
    },
  
    isExecuting(m: Message<keyof MessageType>): m is Message<'executing'> {
      return m.type === 'executing'
    },
  
    isProgress(m: Message<keyof MessageType>): m is Message<'progress'> {
      return m.type === 'progress'
    },
  
    isExecuted(m: Message<keyof MessageType>): m is Message<'executed'> {
      return m.type === 'executed'
    },
  }
  
  export interface Connection {
    source: string
    sourceHandle: string
    target: string
    targetHandle: string
  }