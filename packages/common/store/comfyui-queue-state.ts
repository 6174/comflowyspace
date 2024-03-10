import { clearQueue, deleteFromQueue, getQueueApi, interruptQueue } from '../comfyui-bridge/bridge';
import { Queue, QueueItem } from '../comfui-interfaces';
import {create} from 'zustand';

type QueueState = {
  queue: Queue,
  // fetch queue info loading state
  loading: boolean;
  currentPromptId: string;
};

type QueueActions = {
  onQueueUpdate: () => Promise<void>;
  onClearQueue: () => Promise<void>;
  onInterruptQueue: () => Promise<void>;
  onDeleteFromQueue: (id: number) => Promise<void>;
  onChangeCurrentPromptId: (id: string) => void;
}

export const useQueueState = create<QueueState & QueueActions>((set, get) => ({
  currentPromptId: "",
  queue: {
    queue_running: [],
    queue_pending: []
  },
  loading: false,
  onChangeCurrentPromptId: (id) => {
    set({
      currentPromptId: id
    })
  },
  onQueueUpdate: async () => {
    set({ loading: true })
    set({ queue: await getQueue() , loading: false});
  },
  onDeleteFromQueue: async (id) => {
    await deleteFromQueue(id)
    await get().onQueueUpdate();
  },
  onClearQueue: async () => {
    await clearQueue();
    await get().onQueueUpdate();
  },
  onInterruptQueue: async () => {
    await interruptQueue();
    await get().onQueueUpdate();
  }
}));

async function getQueue(): Promise<Queue> {
  const history = await getQueueApi();
  // hacky way of getting the queue
  const [queue_running, queue_pending] = [history.queue_running, history.queue_pending].map((queue) => {
    return queue.map(([i, id, graph, clientId]) => {
        const prompts = Object.values(graph).flatMap((node) =>
          node.class_type === 'CLIPTextEncode' && node.inputs.text !== undefined ? [node.inputs.text] : []
        )
        const checkpoint = Object.values(graph).find((node) => node.class_type.startsWith('CheckpointLoader'))
        const model = checkpoint?.inputs?.ckpt_name
      return { id, prompts, model, clientId } as QueueItem
      });
  });

  return {
    queue_running,
    queue_pending
  }
}


