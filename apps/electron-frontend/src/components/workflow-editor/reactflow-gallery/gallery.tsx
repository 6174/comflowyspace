import React, { useCallback, useState } from 'react';
import { Image, Modal } from "antd";
import { useAppStore } from '@comflowy/common/store';
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import styles from "./gallery.module.scss";
import { DraggableModal } from 'ui/antd/draggable-modal';
import { GalleryIcon } from 'ui/icons';
import { ImageWithDownload } from './image-with-download';

const Gallery = () => {
  let images = useAppStore(st => st.persistedWorkflow.gallery || []);

  return (
    <div className={styles.galleryWrapper} style={{minHeight: 200}}>
      {images.length === 0 && (
        <div className='placeholder'>
          hmmm, nothing here
        </div>
      )}
      <div className={styles.imageGallery}>
        {images.map((image, index) => {
          const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
          return (
            <ImageWithDownload
              key={imageSrc + index}
              src={imageSrc}
            />
          )
        })}
      </div>
    </div>
  );
};

export const GalleryEntry = React.memo(() => {
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

  return (
    <div className="action action-gallery">
      <div onClick={showModal} style={{
        display: "flex",
        alignItems: "center",
        height: 24
      }}>
        <div style={{
          marginRight: 2,
          transform: "scale(.8) translate(0, 4px)",
          transformOrigin: "center"
        }}><GalleryIcon /> </div>
        Gallery
      </div>
      <DraggableModal
        title="Gallery"
        open={visible}
        onOk={handleOk}
        initialWidth={600}
        initialHeight={400}
        onCancel={handleCancel}
        footer={null}
      >
        <Gallery/>
      </DraggableModal>
    </div>
  )
});
