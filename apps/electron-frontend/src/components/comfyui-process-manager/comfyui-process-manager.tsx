import config, { getBackendUrl } from "@comflowy/common/config";
import useWebSocket from "react-use-websocket";
import useComfyUIProcessManagerState, { Message } from "./comfyui-process-manager-state";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button, Space, message } from "antd";
import styles from "./comfyui-process-manager.module.scss";
import {DraggableModal} from "ui/antd/draggable-modal";
import { listenElectron } from "@/lib/electron-bridge";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
const ComfyUIProcessManager = () => {
  const socketUrl = `ws://${config.host}/ws/comfyui`;
  const setMessages = useComfyUIProcessManagerState(state => state.setMessages);
  const messages = useComfyUIProcessManagerState(state => state.messages);
  const onInit = useComfyUIProcessManagerState(state => state.onInit);
  const termRef = useRef(null);
  const term = useRef(null);

  const onMessage = (ev: MessageEvent) => {
    const msg = JSON.parse(ev.data) as Message;
    term.current && term.current.write(msg.message);
    setMessages([...messages, msg]);
  };

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    onMessage,
    // onOpen: () => console.log('opened'),
    shouldReconnect: (closeEvent) => true,
  });

  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = e => {
    console.log(e);
    setVisible(false);
  };

  useEffect(() => {
    const initTerminal = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const {Terminal} = await import('xterm')
      const {FitAddon} = await import ('xterm-addon-fit');
      const fitAddon = new FitAddon();
      term.current = new Terminal();
      term.current.loadAddon(fitAddon);
      term.current.open(termRef.current);
      fitAddon.fit();
      const messages = useComfyUIProcessManagerState.getState().messages;
      term.current.write(messages.map(m => m.message).join("\n"));
      
      // Create a ResizeObserver instance to monitor size changes
      const resizeObserver = new ResizeObserver(() => {
        // Adjust the size of the terminal when the size of #terminal-container changes
        fitAddon.fit();
      });

      // Start observing the container
      resizeObserver.observe(termRef.current);

      return () => {
        term.current.dispose();
      };
    }
    if (visible) {
      const ret = initTerminal();
      return () => {
        ret.then(dispose => dispose());
      }
    }
  }, [visible]);


  const [restarting, setRestarting] = useState(false);
  const restart = useCallback(async () => {
    const api = getBackendUrl("/api/restart_comfy");
    setRestarting(true);
    try {
      const ret = await fetch(api, {
        method: "POST",
      });
      const data = await ret.json();
      if (data.success) {
        message.success("Restart success");
      } else {
        message.error("Restart faild: " + data.error);
      }
    } catch (err) {
      console.log(err);
      message.error("Failed to restart comfyui: " + err.message)
    }
    setRestarting(false);
  }, []);

  const [updating, setUpdating] = useState(false);
  const update = useCallback(async () => {
    setUpdating(true);
    const api = getBackendUrl("/api/update_comfy");
    try {
      const ret = await fetch(api, {
        method: "POST",
      });
      const data = await ret.json();
      if (data.success) {
        message.success("Update success");
      } else {
        message.error("Update faild: " + data.error);
      }
    } catch (err) {
      console.log(err);
      message.error("Failed to update comfyui: " + err.message)
    }
    // await comfyElectronApi.update();
    setUpdating(false);
  }, []);

  useEffect(() => {
    // onInit();
    const dispose = listenElectron("action", (data) => {
      if (data.type === "open-comfyui-process-manager") {
        showModal();
      }
    });

    const dispose2 = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.restart_comfyui) {
        showModal();
        restart();
      }
    });
    
    return () => {
      dispose();
      dispose2.dispose();
    }
  }, [])

  return (
    <div>
      <DraggableModal
        title="ComfyUI Process Manager"
        footer={null}
        className={styles.comfyuiProcessManager}
        onCancel={handleCancel}
        initialWidth={450}
        initialHeight={380}
        open={visible}
      >
        <div className="term" ref={termRef} >
          {/* {messages.map((msg, index) => {
            return (
              <div className="message" key={index}>{msg.message}</div>
            )
          })} */}
        </div>
        <div className="actions">
          <Space>
            <Button loading={restarting} disabled={restarting} onClick={restart}>Restart</Button>
            <Button loading={updating} disabled={updating} onClick={update}>Update</Button>
          </Space>
        </div>
      </DraggableModal>
    </div>
  )
}

export default memo(ComfyUIProcessManager);