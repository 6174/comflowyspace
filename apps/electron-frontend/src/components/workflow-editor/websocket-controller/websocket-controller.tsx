import config from '@comflowy/common/config';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket'
import { Message } from '@comflowy/common/comfui-interfaces';
import { useAppStore } from '@comflowy/common/store';
import { useEffect, useState } from 'react';
export function WsController(): JSX.Element {
    const { clientId, nodeInProgress, onNewClientId, onQueueUpdate, onNodeInProgress, onImageSave } = useAppStore()
    const nodeIdInProgress = nodeInProgress?.id;

    const [socketUrl, setSocketUrl] = useState(`ws://${config.host}/comfyui/ws`);
    // useEffect(() => {
    //   if (clientId) {
    //     setSocketUrl(`ws://${config.host}/ws?clientId=${clientId}`);
    //   }
    // }, [clientId]);

    useWebSocket(socketUrl, {
      queryParams: clientId ?{ clientId } : {},
      onMessage: (ev) => {
        const msg = JSON.parse(ev.data)
        console.log("msg", msg)
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
        }
      },
    });

    return <></>
  }
  