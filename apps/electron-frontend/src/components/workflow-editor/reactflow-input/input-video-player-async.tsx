import { EyeOutlined } from "@ant-design/icons";
import { Button, Modal, Space } from "antd";
import { Suspense, lazy, useEffect, useState } from "react";
import { isWindow } from "ui/utils/is-window";

const AsyncCO = lazy(async () => {
  return await import("./input-video-player");
});

export function AsyncVideoPlayer(props: { url: string, controls?: boolean }) {
  const [showFrontEndCode, setShowFrontEndCode] = useState(false);
  useEffect(() => {
    if (isWindow) {
      setShowFrontEndCode(true);
    }
  }, [])
  if (!showFrontEndCode) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncCO {...props} />
    </Suspense>
  );
}

export function VideoPreview(props: { url: string, controls?: boolean }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDownload = () => {
    window.open(props.url, '_blank');
  };

  return (
    <>
      <div onClick={showModal} className="video-preview">
        <div className="inner">
          <AsyncVideoPlayer url={props.url} />
        </div>
        <div className="preview-notication">
          <Space><EyeOutlined /> Preview video</Space>
        </div>
      </div>

      <Modal
        title="Video Preview"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="download" onClick={handleDownload}>
            Download
          </Button>,
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div className="wrapper" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <AsyncVideoPlayer url={props.url} controls />
        </div>
      </Modal>
    </>
  );
}