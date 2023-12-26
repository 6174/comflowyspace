import config, { getBackendUrl } from "@comflowy/common/config";
import useWebSocket from "react-use-websocket";
import useComfyUIProcessManagerState, { Message } from "./comfyui-process-manager-state";
import { memo, use, useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import styles from "./comfyui-process-manager.module.scss";

import { comfyElectronApi, listenElectron } from "@/lib/electron-bridge";
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
    onOpen: () => console.log('opened'),
    shouldReconnect: (closeEvent) => true,
  });

  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = e => {
    console.log(e);
    setVisible(false);
  };

  useEffect(() => {
    console.log("term ref change", termRef.current);
    const initTerminal = async () => {
      const {Terminal} = await import('xterm')
      const {FitAddon} = await import ('xterm-addon-fit');
      const fitAddon = new FitAddon();
      term.current = new Terminal();
      term.current.loadAddon(fitAddon);
      term.current.open(termRef.current);
      fitAddon.fit();
      const messages = useComfyUIProcessManagerState.getState().messages;
      term.current.write(messages.join("\n"));
      return () => {
        term.current.dispose();
      };
    }
    if (visible && termRef.current) {
      const ret = initTerminal();
      return () => {
        ret.then(dispose => dispose());
      }
    }
  }, [visible]);

  useEffect(() => {
    onInit();
    const dispose = listenElectron("action", (data) => {
      if (data.type === "open-comfyui-process-manager") {
        showModal();
      }
    });
    return () => {
      dispose();
    }
  }, [])

  return (
    <div>
      <Modal
        title="ComfyUI Process Manager"
        footer={null}
        className={styles.comfyuiProcessManager}
        onCancel={handleCancel}
        open={visible}
      >
        <div className="term" ref={termRef} >
        </div>
      </Modal>
    </div>
  )
}

export default memo(ComfyUIProcessManager);