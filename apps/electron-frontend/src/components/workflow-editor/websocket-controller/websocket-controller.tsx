import config from '@comflowy/common/config';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket'
import { Message } from '@comflowy/common/comfui-interfaces';
import { useAppStore } from '@comflowy/common/store';
import { useEffect, useState } from 'react';
import {useQueueState} from '@comflowy/common/store/comfyui-queue-state';
import { GlobalEvents, SlotGlobalEvent } from '@comflowy/common/utils/slot-event';
import { ComfyUIEvents } from '@comflowy/common/comfui-interfaces/comfy-event-types';
export function WsController(): JSX.Element {
  const clientId = useAppStore((st) => st.clientId);
  const nodeInProgress = useAppStore((st) => st.nodeInProgress);
  const onNewClientId = useAppStore((st) => st.onNewClientId);
  const onQueueUpdate = useQueueState((st) => st.onQueueUpdate);
  const onNodeInProgress = useAppStore((st) => st.onNodeInProgress);
  const onImageSave = useAppStore((st) => st.onImageSave);
  const editorEvent = useAppStore(st => st.editorEvent);
  const nodeIdInProgress = nodeInProgress?.id;

  const [socketUrl, setSocketUrl] = useState(`ws://${config.host}/comfyui/ws`);

  useWebSocket(socketUrl, {
    queryParams: clientId ? { clientId } : {},
    onMessage: (ev) => {
      const msg = JSON.parse(ev.data)
      editorEvent.emit({
        type: ComfyUIEvents.RunMessage,
        data: msg
      });
      // console.log("msg", msg)
      if (Message.isStatus(msg)) {
        if (msg.data.sid !== undefined && msg.data.sid !== clientId) {
          onNewClientId(msg.data.sid)
        }
        void onQueueUpdate()
      } else if (Message.isExecuting(msg)) {
        if (msg.data.node !== undefined) {
          onNodeInProgress(msg.data.node, 0)
        } else if (nodeIdInProgress !== undefined) {
          onNodeInProgress(nodeIdInProgress, 0)
        }
      } else if (Message.isProgress(msg)) {
        if (nodeIdInProgress !== undefined) {
          onNodeInProgress(nodeIdInProgress, msg.data.value / msg.data.max)
        }
      } else if (Message.isExecuted(msg)) {
        const images = msg.data.output.images
        if (Array.isArray(images)) {
          onImageSave(msg.data.node, images)
        }
      } else if (Message.isExecutingInterrupted) {
        SlotGlobalEvent.emit({
          type: GlobalEvents.execution_interrupted,
          data: null
        });
      }
    },
  });

  return <></>
}
