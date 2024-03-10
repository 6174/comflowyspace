import { useCallback, useState } from "react";
import { DraggableModal } from "ui/antd/draggable-modal";
import { AsyncComflowyConsole } from "../comflowy-console/comflowy-console-async";
import { NotificationIcon } from "ui/icons";
import { Tooltip } from "antd";

export function NotificationModalEntry() {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = useCallback(e => {
    console.log(e);
    setVisible(false);
  }, [setVisible]);

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
        <AsyncComflowyConsole />
      </DraggableModal>
      <Tooltip title="Comfyui execution messages and notifications">
        <div className="action" onClick={() => {
          showModal();
        }}>
          <NotificationIcon />
        </div>
      </Tooltip>
    </>
  )
}