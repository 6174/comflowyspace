import React, { useCallback, useState } from 'react';
import { Image, Modal, Popover, Tooltip } from "antd";
import { useAppStore } from '@comflowy/common/store';
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import styles from "./gallery.module.scss";
import { DraggableModal } from 'ui/antd/draggable-modal';
import { GalleryIcon } from 'ui/icons';
import { ImageWithDownload, PreviewGroupWithDownload } from './image-with-download';

const Gallery = () => {
  let images = useAppStore(st => st.persistedWorkflow.gallery || []);
  const imagesWithSrc = images.map(image => {
    const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
    return {
      src: imageSrc,
      filename: image.filename
    }
  });
  return (
    <div className={styles.galleryWrapper} style={{minHeight: 200}}>
      {images.length === 0 && (
        <div className='placeholder'>
          hmmm, nothing here
        </div>
      )}
      <div className={styles.imageGallery}>
        <PreviewGroupWithDownload images={imagesWithSrc}>
          {imagesWithSrc.map((image, index) => {
            return (
              <Image
                key={image.src + index}
                src={image.src}
              />
            )
          })}
        </PreviewGroupWithDownload>
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
    <>
      <Tooltip title="Saved Image Gallery">
        <div className="action action-gallery" style={{
          transform: "scale(.9)"
        }} onClick={showModal}>
          <GalleryIcon />
        </div>
      </Tooltip>
      <DraggableModal
        title={
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 20
          }}
          >
            <h4 style={{
              marginRight: 4,
            }}>Gallery</h4>
            <Tooltip title="In this Gallery, only display images contained within the Save Image nodes.">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
                cursor: 'pointer' 
              }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M14 25C20.0751 25 25 20.0751 25 14C25 7.92487 20.0751 3 14 3C7.92487 3 3 7.92487 3 14C3 20.0751 7.92487 25 14 25ZM12.2963 10.1546C12.2963 9.51684 12.8133 8.99982 13.451 8.99982C14.0888 8.99982 14.6058 9.51684 14.6058 10.1546C14.6058 10.7924 14.0888 11.3094 13.451 11.3094C12.8133 11.3094 12.2963 10.7924 12.2963 10.1546ZM12.6008 20.3568C12.2968 20.2043 12.2654 19.8035 12.2967 19.4077L12.5045 12.9509C12.5433 12.4585 13.0198 12.1441 13.5138 12.1441C14.0078 12.1441 14.4903 12.5239 14.5292 13.0164L14.7104 19.4077C14.7417 19.8035 14.6987 20.2206 14.4267 20.3568C14.1552 20.493 13.8556 20.5639 13.5518 20.5639H13.4757C13.172 20.5639 12.8724 20.493 12.6008 20.3568Z" fill="#444657" />
              </svg>
            </Tooltip>
          </div>
          }
        open={visible}
        onOk={handleOk}
        initialWidth={600}
        initialHeight={400}
        onCancel={handleCancel}
        footer={null}
      >
        <Gallery/>
      </DraggableModal>
    </>
  )
});
