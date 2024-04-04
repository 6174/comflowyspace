import config, { comfyuiApiConfig } from '@comflowy/common/config';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket'
import { Message } from '@comflowy/common/types';
import { useAppStore } from '@comflowy/common/store';
import { useEffect, useState } from 'react';
import {useQueueState} from '@comflowy/common/store/comfyui-queue-state';
import { GlobalEvents, SlotGlobalEvent } from '@comflowy/common/utils/slot-event';
import { ComfyUIEvents } from '@comflowy/common/types';
import { track } from '@/lib/tracker';
export function WsController(props: {clientId: string}): JSX.Element {
  const clientId = props.clientId;
  const nodeInProgress = useAppStore((st) => st.nodeInProgress);
  const onBlobPreview = useAppStore((st) => st.onBlobPreview);
  const onNewClientId = useAppStore((st) => st.onNewClientId);
  const onQueueUpdate = useQueueState((st) => st.onQueueUpdate);
  const onNodeInProgress = useAppStore((st) => st.onNodeInProgress);
  const onImageSave = useAppStore((st) => st.onImageSave);
  const editorEvent = useAppStore(st => st.editorEvent);
  const nodeIdInProgress = nodeInProgress?.id;
  const [socketUrl, setSocketUrl] = useState(`ws://${comfyuiApiConfig.host}/ws`);
  const [timestamp, setTimestamp] = useState(Date.now());
  const onChangeCurrentPromptId = useQueueState(st => st.onChangeCurrentPromptId);

  const {getWebSocket} = useWebSocket(socketUrl, {
    queryParams: clientId ? { clientId, timestamp } : {},
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    onMessage: async (ev) => {
      // blob type
      try {
        if (ev.data instanceof Blob) {
          const arrayBuffer = await ev.data.arrayBuffer();
          const view = new DataView(arrayBuffer);
          const eventType = view.getUint32(0);
          const buffer = arrayBuffer.slice(4);
          switch (eventType) {
            case 1:
              const view2 = new DataView(arrayBuffer);
              const imageType = view2.getUint32(0)
              let imageMime
              switch (imageType) {
                case 1:
                default:
                  imageMime = "image/jpeg";
                  break;
                case 2:
                  imageMime = "image/png"
              }
              const imageBlob = new Blob([buffer.slice(4)], { type: imageMime });
              const imageUrl = URL.createObjectURL(imageBlob);
              // console.log(imageUrl);
              // window.open(imageUrl, '_blank');
              onBlobPreview(nodeIdInProgress, imageUrl);
              break;
            }
          return
        }
      } catch(err) {
        console.log("parse blob error", err);
      }

      try {
        const msg = JSON.parse(ev.data);
        
        console.log("msg", msg);
        editorEvent.emit({
          type: ComfyUIEvents.RunMessage,
          data: msg
        });
        
        // console.log("msg", msg)
        if (Message.isExecutingStart(msg) || Message.isProgress(msg)) {
          if (msg.data?.prompt_id) {
            onChangeCurrentPromptId(msg.data.prompt_id);
          }
        }

        if (Message.isStatus(msg)) {
          if (msg.data.sid !== undefined) {
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
          track('comfyui-executed-success');
          const images = msg.data.output.images
          onChangeCurrentPromptId("");
          if (Array.isArray(images)) {
            onImageSave(msg.data.node, images)
          }
        } else if (Message.isExecutingInterrupted(msg)) {
          track('comfyui-executed-interrupted');
          onChangeCurrentPromptId("");
          SlotGlobalEvent.emit({
            type: GlobalEvents.execution_interrupted,
            data: null
          });
        }
      } catch(err) {
        console.log(err);
      }
    },
  });

  useEffect(() => {
    const disposable = SlotGlobalEvent.on((event) => {
      if (event.type === GlobalEvents.comfyui_process_error) {
        // message.error("Runtime Error: " + event.data.message);
      }
      if (
        event.type === GlobalEvents.restart_comfyui_success || 
        event.type === GlobalEvents.start_comfyui_execute
      ) {
        getWebSocket().close();
        // console.log("try to reconncet websocket")
        setTimestamp(Date.now());
        // window.location.reload();
      }
    })

    return () => {
      disposable.dispose();
    }
  }, [getWebSocket]);

  // const [pongReceived, setPongReceived] = useState(true);
  // // Send a ping every 5 seconds
  // useEffect(() => {
  //   const pingInterval = setInterval(() => {
  //     sendJsonMessage('ping');
  //     setPongReceived(false);
  //   }, 5000);
  //   return () => clearInterval(pingInterval);
  // }, [sendJsonMessage]);

  // // Reset pong status when a pong is received
  // useEffect(() => {
  //   if (lastMessage && lastMessage.data === 'pong') {
  //     console.log("receive pond");
  //     setPongReceived(true);
  //   }
  // }, [lastMessage]);

  // // Check if a pong is received, if no pong is received within 5 seconds, it is considered that the connection is disconnected and needs to be reconnected
  // useEffect(() => {
  //   if (!pongReceived) {
  //     setTimeout(() => {
  //       if (!pongReceived) {
  //         console.log("No pong received, reconnecting...");
  //         setSocketUrl(`ws://${config.host}/comfyui/ws?timestamp=${Date.now()}`);
  //       }
  //     }, 5000); // If there is no response within 5 seconds, reconnect
  //   }
  // }, [pongReceived]);

  return <></>
}
