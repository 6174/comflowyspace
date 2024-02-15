import { useCallback, useEffect, useState } from "react";
import { DraggableModal } from "ui/antd/draggable-modal";
import styles from "./comflowy-image-editor.style.module.scss";
import { SDNode } from "@comflowy/common/comfui-interfaces";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { getImagePreviewUrl } from "@comflowy/common/comfyui-bridge/bridge";
import ComflowyImageEditor from "comflowy-image-editor";
import { needEditImage } from "./context-menu-item-edit-image";

/**
 * Edit image with a modal
 * @param props 
 * @returns 
 */
export default function EditImageModal(props: {
  node: SDNode,
  id: string
}) {
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

    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.open_image_editor && ev.data.id === props.id) {
        showModal();
      }
    });
    return () => {
      disposable.dispose();
    }
  }, []);

  if (!needEditImage(props.node)) {
    return null;
  }

  const imgsrc = getImagePreviewUrl(props.node.fields?.image);

  return (
    <DraggableModal
      title="Edit Image"
      open={visible}
      initialWidth={600}
      initialHeight={400}
      onOk={() => { }}
      onCancel={handleCancel}
      footer={null}
    >
      <div className={styles.editImageModal}>
        <div className="image-container">
          <ComflowyImageEditor 
            source={imgsrc} 
            savingPixelRatio={0} 
            previewPixelRatio={0} />
          {/* <img src={props.node.image} alt="image" /> */}
        </div>
      </div>
    </DraggableModal>
  )
}
