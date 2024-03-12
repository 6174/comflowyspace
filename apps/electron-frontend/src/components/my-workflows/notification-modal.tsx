import { useCallback, useEffect, useState } from "react";
import { DraggableModal } from "ui/antd/draggable-modal";
import { AsyncComflowyConsole } from "../comflowy-console/comflowy-console-async";
import { NotificationIcon } from "ui/icons";
import { Badge, Tooltip } from "antd";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import ComlowyConsole, { ConsoleSocketController, useUnreadLogs } from "../comflowy-console/comflowy-console";

export function NotificationModal() {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = useCallback(e => {
    console.log(e);
    setVisible(false);
  }, [setVisible]);

  useEffect(() => {
    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.show_notification_modal) {
        setVisible(true);
      }
    });
    return () => {
      disposable.dispose();
    }
  }, [])

  return (
    <>
      <DraggableModal
        title={"Notifications"}
        footer={null}
        onCancel={handleCancel}
        initialWidth={450}
        initialHeight={380}
        open={visible}
      >
        <ComlowyConsole />
      </DraggableModal>
    </>
  )
}

export function NotificationModalEntry() {
  const showModal = () => {
    SlotGlobalEvent.emit({
      type: GlobalEvents.show_notification_modal,
      data: null
    })
  }

  const unreadLogs = useUnreadLogs();
  console.log("unreadLogs", unreadLogs)
  return (
    <div>
      <Tooltip title="Comfyui execution messages and notifications">
        <div className="action" onClick={() => {
          showModal();
        }}>
          <Badge count={unreadLogs.length}>
            <div className="icon">
              <NotificationIcon />
            </div>
          </Badge>
        </div>
      </Tooltip>
    </div>
  )
}