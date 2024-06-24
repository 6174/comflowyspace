import { useCallback, useEffect, useState } from "react";
import { DraggableModal } from "ui/antd/draggable-modal";
import styles from "./comflowy-image-editor.style.module.scss";
import { SDNode } from "@comflowy/common/types";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { getImagePreviewUrl } from "@comflowy/common/comfyui-bridge/bridge";
import ComflowyImageEditor, { TABS } from "comflowy-image-editor";
import { needEditImage } from "./context-menu-item-edit-image";
import { message } from "antd";

/**
 * Edit image with a modal
 * @param props 
 * @returns 
 */
export default function EditImageModal(props: {
  node: SDNode,
  id: string,
  onSave: (blob: Blob) => Promise<void>;
}) {
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState("");
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
        setImage(ev.data.image);
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

  // const imgsrc = getImagePreviewUrl(props.node.fields?.image);
  const imgsrc = getImagePreviewUrl(image);

  return (
    <DraggableModal
      title="Edit Image"
      open={visible}
      initialWidth={600}
      initialHeight={500}
      onOk={() => { }}
      className={styles.contextMenuEditImageModal}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="image-container">
        <ComflowyImageEditor 
          source={imgsrc}
          onBeforeSave={(imageInfo) => {
            console.log(imageInfo);
            return false;
          }}
          defaultTabId={TABS.ANNOTATE}
          tabsIds={[TABS.ANNOTATE, TABS.ADJUST, TABS.RESIZE]}
          onSave={async (data) => {
            try {
              // console.log("save", data)
              // const canvas = data.imageCanvas;
              // const base64Data = data.imageBase64;
              // const blob = base64ToBlob(base64Data, 'image/png');
              // await props.onSave(blob);
              console.log("save", data)
              const canvas = data.imageCanvas;
              const ctx = canvas.getContext('2d');
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                if (r === 0 && g === 0 && b === 0) {
                  imageData.data[i + 3] = 0
                }
              }
              ctx.putImageData(imageData, 0, 0);
              const base64Data = canvas.toDataURL('image/png');
              const blob = base64ToBlob(base64Data, 'image/png');
              await props.onSave(blob);
            } catch(err) {
              console.log(err);
              message.error("Save image failed: " + err.message);
            }
          }}
          savingPixelRatio={4} 
          previewPixelRatio={4} />
        {/* <img src={props.node.image} alt="image" /> */}
      </div>
    </DraggableModal>
  )
}

function base64ToBlob(base64, mimeType = '') {
  // 将 base64 解码
  let byteString = atob(base64.split(',')[1]);
  let arrayBuffer = new ArrayBuffer(byteString.length);
  let uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  let blob = new Blob([uint8Array], { type: mimeType });
  return blob;
}
