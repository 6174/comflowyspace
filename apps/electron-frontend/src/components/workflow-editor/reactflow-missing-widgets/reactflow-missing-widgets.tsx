import { memo, useCallback, useEffect, useState } from "react";
import styles from "./reactflow-missing-widgets.style.module.scss";
import { DraggableModal } from "ui/antd/draggable-modal";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
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
    console.log(e);
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
        title="Queue"
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
  return (
    <div className={styles.missingWidgetsContent}>
      missing widgets
    </div>
  )
}