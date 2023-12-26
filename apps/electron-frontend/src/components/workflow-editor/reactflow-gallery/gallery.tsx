import React, { useCallback, useState } from 'react';
import { Image, Modal } from "antd";
import { useAppStore } from '@comflowy/common/store';
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import styles from "./gallery.module.scss";

const Gallery = () => {
  let images = useAppStore(st => st.persistedWorkflow.gallery || []);

  return (
    <div className={styles.galleryWrapper} style={{minHeight: 200}}>
      {images.length === 0 && (
        <div className='placeholder'>
          hmmm, nothing here
        </div>
      )}
      <div className="gallery">
        {images.map((image, index) => {
          const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
          return (
            <Image
              key={imageSrc + index}
              src={imageSrc}
              style={{
                maxWidth: 200,
                maxHeight: 200
              }}
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

  console.log("visible", visible);
  return (
    <div className="action action-gallery">
      <div onClick={showModal}>Gallery</div>
      <Modal
        title="Gallery"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Gallery/>
      </Modal>
    </div>
  )
});
