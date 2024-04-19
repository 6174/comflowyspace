import { memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./reactflow-missing-widgets.style.module.scss";
import { DraggableModal } from "ui/antd/draggable-modal";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { useAppStore } from "@comflowy/common/store";
import { Extension, findExtensionByWidgetName, useExtensionsState } from "@comflowy/common/store/extension-state";
import { ExtensionIcon } from "ui/icons";
import { openExternalURL } from "@/lib/electron-bridge";
import { Button, Space, message } from "antd";

import extensionStyles from "../../extension-manager/extension-manager.style.module.scss";
import { useRemoteTask } from "@/lib/utils/use-remote-task";
import { getBackendUrl } from "@comflowy/common/config";
/**
 * Component for install missing widgets
 */
export const MissingWidgetsPopoverEntry = memo(() => {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    setVisible(false);
  };

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  useEffect(() => {
    const disposable = SlotGlobalEvent.on((event) => {
      if (event.type === GlobalEvents.show_missing_widgets_modal) {
        showModal();
      }
    });
    return () => {
      disposable.dispose();
    }
  }, []);

  const unknownWidgets = useAppStore(st => st.unknownWidgets);

  const extensions = new Set<Extension>();
  unknownWidgets.forEach(widgetName => {
    const extension = findExtensionByWidgetName(widgetName);
    if(extension) {
      extensions.add(extension)
    }
  });

  const extensionsArr: Extension[] = [];
  extensions.forEach(extension => {
    extensionsArr.push(extension);
  });

  useEffect(() => {
    if (extensionsArr.length === 0) {
      handleCancel();
    }
  }, [unknownWidgets]);

  return (
    <div className="missing-widgets-entry">
      <DraggableModal
        title="Install missing extensions"
        open={visible}
        className={styles.queueWrapper}
        onOk={handleOk}
        initialWidth={600}
        initialHeight={500}
        onCancel={handleCancel}
        footer={null}
      >
        <MissingWidgetInstallHelper extensions={extensionsArr}/>
      </DraggableModal>
    </div>
  )
});

function MissingWidgetInstallHelper({ extensions }: { extensions: Extension[]}) {
   const { startTask, running } = useRemoteTask({
    api: getBackendUrl(`/api/install_extension`),
    onMessage: async (msg) => {
      console.log(msg);
      if (msg.type === "SUCCESS") {
        message.success(`Installed successfully`);
      }
    }
  });

  const isLoading = running;
  const installExtensions = useCallback(() => {
    startTask({
      name: "installExtension",
      params: extensions
    })
  }, [extensions]);

  return (
    <div className={styles.missingWidgetsContent}>
      <div className="actions" style={{ marginBottom: 20 }}>
        <Space>
          <Button loading={isLoading} disabled={isLoading} onClick={installExtensions}>Install All</Button>
        </Space>
      </div>
      {extensions.map(extension => {
        return <ExtensionItem extension={extension} key={extension.title}/>
      })}
    </div>
  )
}

function ExtensionItem(props: {
  extension: Extension
}) {
  const {extension} = props;
  const { startTask, running } = useRemoteTask({
    api: getBackendUrl(`/api/install_extension`),
    onMessage: async (msg) => {
      console.log(msg);
      if (msg.type === "SUCCESS") {
        message.success(`${extension.title} installed successfully`);
      }
    }
  });

  const isLoading = running;
  const installExtension = useCallback(() => {
    startTask({
      name: "installExtension",
      params: [extension]
    })
  }, [extension]);

  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    const disposable = SlotGlobalEvent.on((event) => {
      if (event.type === GlobalEvents.install_missing_widget) {
        const extension2 = event.data as Extension;
        if (extension2.title === extension.title) {
          // ref.current.scrollIntoView({ behavior: 'auto' })
          installExtension();
        }
      }
    });
    return () => {
      disposable.dispose();
    }
  }, [extension, ref]);

  const title = (
    <div className={extensionStyles.extensionTitleBar} ref={ref}>
      <div className="icon">
        <ExtensionIcon />
      </div>
      <div className="text">
        <div className="name" title={extension.title}>{extension.title}</div>
        <div className="author" title={extension.author}>
          <a onClick={ev => {
            openExternalURL(extension.reference)
          }}>Reference</a>, Created by {extension.author}
        </div>
      </div>
      <div className="extension-item-install">
        <Button loading={isLoading} disabled={isLoading} onClick={installExtension}>Install</Button>
      </div>
    </div>
  )
  
  return (
    <div className="extension-item">
      {title}
      <div className="extension-item-description">{extension.description}</div>
    </div>
  )
}