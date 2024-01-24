import { memo, useCallback, useEffect, useState } from "react";
import styles from "./reactflow-missing-widgets.style.module.scss";
import { DraggableModal } from "ui/antd/draggable-modal";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { useAppStore } from "@comflowy/common/store";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { ExtensionIcon } from "ui/icons";
import { openExternalURL } from "@/lib/electron-bridge";
import { Button, Space } from "antd";

import extensionStyles from "../../extension-manager/extension-manager.style.module.scss";
/**
 * Component for install missing widgets
 */
export const MissingWidgetsPopoverEntry = memo(() => {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = useCallback(e => {
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

  return (
    <div className="missing-widgets-entry">
      <DraggableModal
        title="Install missing extensions"
        open={visible}
        className={styles.queueWrapper}
        onOk={handleOk}
        initialWidth={300}
        initialHeight={300}
        onCancel={handleCancel}
        footer={null}
      >
        <MissingWidgetInstallHelper />
      </DraggableModal>
    </div>
  )
});

function MissingWidgetInstallHelper() {
  const unknownWidgets = useAppStore(st => st.unknownWidgets);
  const extensionsNodeMap = useExtensionsState(st => st.extensionNodeMap);

  const extensions = new Set<Extension>();
  unknownWidgets.forEach(widgetName => {
    const extension = extensionsNodeMap[widgetName];
    if (extension) {
      extensions.add(extension);
    }
  });

  const extensionsArr: Extension[] = [];
  extensions.forEach(extension => {
    extensionsArr.push(extension);
  });


  return (
    <div className={styles.missingWidgetsContent}>
      {extensionsArr.map(extension => {
        return <ExtensionItem extension={extension} key={extension.title}/>
      })}
    </div>
  )
}

function ExtensionItem(props: {
  extension: Extension
}) {
  const {extension} = props;
  const title = (
    <div className={extensionStyles.extensionTitleBar} >
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
        <Button>Install</Button>
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