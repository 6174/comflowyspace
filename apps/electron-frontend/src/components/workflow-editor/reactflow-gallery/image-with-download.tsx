import { ImageProps, Image, Space, message } from "antd";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import styles from "./gallery.module.scss";
import { useCallback } from "react";

export function ImageWithDownload(props: ImageProps & {fileName: string}) {
  const src = props.src;
  const onDownload = () => {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.download = props.fileName;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };

  const imageProps = {...props};
  delete imageProps.fileName
  return (
    <Image 
      {...imageProps} 
      preview={{
        toolbarRender: (
          _,
          {
            transform: { scale },
            actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn },
          },
        ) => (
          <Space size={12} className={`toolbar-wrapper ant-image-preview-operations ${styles.previewToolbar}`}>
            <DownloadOutlined  width={24} className="action ant-image-preview-operations-operation" onClick={onDownload} />
            {/* <SwapOutlined width={24} className="action ant-image-preview-operations-operation" rotate={90} onClick={onFlipY} />
            <SwapOutlined width={24} className="action ant-image-preview-operations-operation" onClick={onFlipX} />
            <RotateLeftOutlined width={24} className="action ant-image-preview-operations-operation" onClick={onRotateLeft} />
            <RotateRightOutlined width={24} className="action ant-image-preview-operations-operation" onClick={onRotateRight} /> */}
            <ZoomOutOutlined width={24} className="action ant-image-preview-operations-operation" disabled={scale === 1} onClick={onZoomOut} />
            <ZoomInOutlined width={24} className="action ant-image-preview-operations-operation" disabled={scale === 50} onClick={onZoomIn} />
          </Space>
        ),
      }}
    />
  )
}

/**
 * Preview group with download
 */
export function PreviewGroupWithDownload(props: {images: {src: string, filename: string}[], [_:string]: any}) {
  const images = props.images;
  const onDownload = useCallback((current: number) => {
    const previewImage = images[current];
    try {   
      const {src, filename} = previewImage;
      fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(url);
          link.remove();
        });
    } catch(err) {
      message.error("Download failed:" + err.message);
    }
  }, [images]);
  return (
    <Image.PreviewGroup 
      {...props}
      preview={{
        toolbarRender: (
          _,
          {
            transform: { scale },
            actions: { 
              onFlipY, 
              onFlipX, 
              onRotateLeft, 
              onRotateRight, 
              onZoomOut, 
              onZoomIn 
            },
            current
          },
        ) => (
          <Space size={12} className={`toolbar-wrapper ant-image-preview-operations ${styles.previewToolbar}`}>
            <DownloadOutlined width={24} className="action ant-image-preview-operations-operation" onClick={ev => {
              onDownload(current);
            }} />
            {/* <SwapOutlined width={24} className="action ant-image-preview-operations-operation" rotate={90} onClick={onFlipY} />
            <SwapOutlined width={24} className="action ant-image-preview-operations-operation" onClick={onFlipX} />
            <RotateLeftOutlined width={24} className="action ant-image-preview-operations-operation" onClick={onRotateLeft} />
            <RotateRightOutlined width={24} className="action ant-image-preview-operations-operation" onClick={onRotateRight} /> */}
            <ZoomOutOutlined width={24} className="action ant-image-preview-operations-operation" disabled={scale === 1} onClick={onZoomOut} />
            <ZoomInOutlined width={24} className="action ant-image-preview-operations-operation" disabled={scale === 50} onClick={onZoomIn} />
          </Space>
        ),
      }}
      >
      {props.children}
    </Image.PreviewGroup>
  )
}