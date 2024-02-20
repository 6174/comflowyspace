import config, { getBackendUrl } from "@comflowy/common/config";
import useWebSocket from "react-use-websocket";
import useComfyUIProcessManagerState, { Message } from "./comfyui-process-manager-state";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Popover, Space, Tooltip, message } from "antd";
import styles from "./comfyui-process-manager.module.scss";
import {DraggableModal} from "ui/antd/draggable-modal";
import { listenElectron, openExternalURL } from "@/lib/electron-bridge";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { useDashboardState } from "@comflowy/common/store/dashboard-state";
import {WarningIcon} from "ui/icons";
const ComfyUIProcessManager = () => {
  const socketUrl = `ws://${config.host}/ws/comfyui`;
  const setMessages = useComfyUIProcessManagerState(state => state.setMessages);
  const messages = useComfyUIProcessManagerState(state => state.messages);
  const onInit = useComfyUIProcessManagerState(state => state.onInit);
  const missingModules = useComfyUIProcessManagerState(state => state.missingModules);
  const termRef = useRef(null);
  const term = useRef(null);

  const onMessage = (ev: MessageEvent) => {
    const msg = JSON.parse(ev.data) as Message;
    term.current && term.current.write(msg.message);
    setMessages([...messages, msg]);
    if (msg.message.includes("RuntimeError:")) {
      // @TODO: there is a bug because after editor loaded, it will read all history logs and emit this event
      // SlotGlobalEvent.emit({
      //   type: GlobalEvents.comfyui_process_error,
      //   data: {
      //     message: msg.message
      //   }
      // });
    }

    if (msg.message.includes("Restart ComfyUI Success")) {
      // console.log("trigger restart_comfyui_success");
      SlotGlobalEvent.emit({
        type: GlobalEvents.restart_comfyui_success,
        data: null
      })
    }
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
      // const {CanvasAddon} = await import ('xterm-addon-canvas');
      const {ImageAddon} = await import ('xterm-addon-image');
      const {SearchAddon} = await import ('xterm-addon-search');
      const {SerializeAddon} = await import ('xterm-addon-serialize');
      const {Unicode11Addon} = await import ('xterm-addon-unicode11');
      // const {WebglAddon} = await import ('xterm-addon-webgl');
      const fitAddon = new FitAddon();
      // const canvasAddon = new CanvasAddon();
      const imageAddon = new ImageAddon();
      const searchAddon = new SearchAddon();
      const serializeAddon = new SerializeAddon();
      const unicode11Addon = new Unicode11Addon();
      // const webglAddon = new WebglAddon();
      term.current = new Terminal({
        allowProposedApi: true
      });
      term.current.loadAddon(fitAddon);
      // term.current.loadAddon(canvasAddon);
      term.current.loadAddon(imageAddon);
      term.current.loadAddon(searchAddon);
      term.current.loadAddon(serializeAddon);
      term.current.loadAddon(unicode11Addon);
      // term.current.loadAddon(webglAddon);
      term.current.open(termRef.current);
      fitAddon.fit();
      const messages = useComfyUIProcessManagerState.getState().messages;
      term.current.write(messages.map(m => m.message).join("\n"));
      
      // Create a ResizeObserver instance to monitor size changes
      const resizeObserver = new ResizeObserver(() => {
        // Adjust the size of the terminal when the size of #terminal-container changes
        try {
          fitAddon.fit();
        } catch(err) {
          console.log(err);
        }
      });

      // Start observing the container
      resizeObserver.observe(termRef.current);

      return () => {
        try {
          term.current && term.current.dispose();
        } catch(err) {
          console.log(err);
        }
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

    const dispose3 = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.show_comfyprocess_manager) {
        showModal();
      }
    });

    if (missingModules.length > 0) {
      showModal();
    }

    return () => {
      dispose();
      dispose2.dispose();
      dispose3.dispose();
    }
  }, [missingModules])


  const env = useDashboardState(state => state.env);
  const $title = (
    <div className="title">
      <div>ComfyUI Process Manager</div>
    </div>
  )
  return (
    <div>
      <DraggableModal
        title={$title}
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
        <div className="actions flex">
          <Space>
            <Button loading={restarting} disabled={restarting} onClick={restart}>Restart</Button>
            <Button loading={updating} disabled={updating} onClick={update}>Update</Button>
            <InstallPipActions/>
          </Space>
        </div>
        <div className="info">
          <Space>
            <span>ComfyUI@<a onClick={(ev) => {
              openExternalURL(`https://github.com/comfyanonymous/ComfyUI/commit/${env?.comfyUIVersion}`)
            }}>{env?.comfyUIVersion.slice(0, 10)}</a></span>
            <span>Comflowy@{process.env.NEXT_PUBLIC_APP_VERSION}</span>
          </Space>
        </div>
      </DraggableModal>
    </div>
  )
}

function InstallPipActions() {
  const missingModules = useComfyUIProcessManagerState(state => state.missingModules);
  const setInstalledModules = useComfyUIProcessManagerState(state => state.setInstalledModules);
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const toolTip = (
    <>
      <Tooltip trigger="hover" title="Missing modules detected. Click to install the necessary packages to start ComfyUI.">
        <div style={{
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          transform: "scale(.9)",
          position: "relative",
          top: 3,
          marginRight: -10
        }}>
          <WarningIcon/>
        </div>
      </Tooltip>
    </>
  )
  
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(missingModules.length > 0 ? missingModules.join(" ") : "")
  }, [missingModules])

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const [processing, setProcessing] = useState(false);

  const handleValueSubmit = useCallback(async () => {
    if (value.trim() === "") {
      message.warning("No package input");
      return;
    }

    setProcessing(true);
    try {
      const api = getBackendUrl("/api/install_pip_packages");
      const ret = await fetch(api, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({packages: value}),
      })

      const response = await ret.json();
      if (!response.success) {
        throw new Error(response.error);
      }

      setInstalledModules(missingModules);

    } catch(err) {
      message.error("install failed:" + err.message)
    }
    setProcessing(false);
    handleCancel();
  }, [value, missingModules]);

  return (
    <div className="install-pip-packages">
      <Button disabled={processing} loading={processing} danger={missingModules.length > 0} onClick={() => {
        showModal();
      }}>Pip Install {missingModules.length > 0 ? toolTip : ""}</Button>
      <Modal  
        title={"Install Pip Packages"}
        okText="Install"
        okButtonProps={{loading: processing, disabled: processing}}
        onOk={handleValueSubmit}
        onCancel={handleCancel}
        open={visible}>
        <div className="content">
          <Input 
            placeholder="Input python packages eg `numbpy pandas tensorflow`"
            value={value} 
            style={{width: "100%"}}
            onChange={handleValueChange} 
            />
        </div>
      </Modal>
    </div>
  )
}

export default memo(ComfyUIProcessManager);