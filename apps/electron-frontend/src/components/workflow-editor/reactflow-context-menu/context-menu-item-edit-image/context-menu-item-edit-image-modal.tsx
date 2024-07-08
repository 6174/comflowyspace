import { useCallback, useEffect, useState } from "react";
import { DraggableModal } from "ui/antd/draggable-modal";
import styles from "./comflowy-image-editor.style.module.scss";
import { SDNode } from "@comflowy/common/types";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { getImagePreviewUrl } from "@comflowy/common/comfyui-bridge/bridge";
import ComflowyImageEditor, { TABS, TOOLS } from "comflowy-image-editor";
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
          defaultToolId={TOOLS.PEN}
          tabsIds={[TABS.ANNOTATE]}
          onSave={async (data) => {
            try {
              const editedCanvas = data.imageCanvas;
              const editedCtx = editedCanvas.getContext('2d');
              const editedImageData = editedCtx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);

              // 加载原始图像
              const originalImage = new Image();
              originalImage.crossOrigin = 'anonymous';
              originalImage.src = imgsrc;

              await new Promise((resolve, reject) => {
                originalImage.onload = resolve;
                originalImage.onerror = reject;
              });

              // 创建原始图像的canvas
              const originalCanvas = document.createElement('canvas');
              originalCanvas.width = originalImage.width;
              originalCanvas.height = originalImage.height;
              originalCanvas.getContext("2d").fillStyle = 'white';
              const originalCtx = originalCanvas.getContext('2d');
              originalCtx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
              originalCtx.drawImage(originalImage, 0, 0);

              const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

              // 计算比例
              const scaleX = editedCanvas.width / originalCanvas.width;
              const scaleY = editedCanvas.height / originalCanvas.height;

              // 修改原始图像的alpha值
              for (let y = 0; y < originalCanvas.height; y++) {
                for (let x = 0; x < originalCanvas.width; x++) {
                  // 计算对应的编辑后canvas坐标
                  const editedX = Math.floor(x * scaleX);
                  const editedY = Math.floor(y * scaleY);

                  // 检查是否在编辑后canvas的范围内
                  if (editedX < editedCanvas.width && editedY < editedCanvas.height) {
                    const editedIndex = (editedY * editedCanvas.width + editedX) * 4;
                    const r = editedImageData.data[editedIndex];
                    const g = editedImageData.data[editedIndex + 1];
                    const b = editedImageData.data[editedIndex + 2];
                    const originalIndex = (y * originalCanvas.width + x) * 4;
                    if (r === 0 && g === 0 && b === 0) {
                      // 设置原始图像对应位置的alpha值为0
                      originalImageData.data[originalIndex + 3] = 0;
                    }
                  }
                }
              }

              originalCtx.putImageData(originalImageData, 0, 0);
              // const base64Data = originalCanvas.toDataURL('image/png');
              // const blob = base64ToBlob(base64Data, 'image/png');
              const blob = await new Promise<Blob>((resolve, reject) =>
                originalCanvas.toBlob((blob) => {
                  resolve(blob);
                }, 'image/png', 1.0)
              );
              await props.onSave(blob);
            } catch (err) {
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
