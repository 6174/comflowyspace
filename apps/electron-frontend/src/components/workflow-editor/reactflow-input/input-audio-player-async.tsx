import { EyeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Space } from "antd";
import { Suspense, lazy, useEffect, useState } from "react";
import { isWindow } from "ui/utils/is-window";
import styles from "./input-audio-player.module.scss";

const AsyncCO = lazy(async () => {
  return await import("./input-audio-player");
});

interface InputAudioPlayerProps {
  url: string;
  loop?: boolean;
  preview?: boolean;
  muted?: boolean;
}

export function AsyncAudioPlayer(props: InputAudioPlayerProps) {
  const [showFrontEndCode, setShowFrontEndCode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      <AsyncCO {...props}/>
    </Suspense>
  );
}

export function AudioPreview(props: InputAudioPlayerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const loop = props.loop ?? false;
  const muted = props.muted ?? false;
  const preview = props.preview ?? false;
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDownload = () => {
    window.open(props.url, '_blank');
  };

  const fileName = props.url.split("/").pop();
  return (
    <>
      <div className={"audio-preview nopan nodrag " + styles.audioPreview} onClick={ev => {
        if (preview) {
          showModal();
        }
      }}>
        <div className="inner">
          {preview ? (
            <div className="audio-preview-content">
              <div className="icon"><PlayCircleOutlined /></div>
              <div className="name">
                {fileName}
              </div>
            </div>
          ): (
            <AsyncAudioPlayer url={props.url} loop={loop} muted={muted}/>
          )}
        </div>
      </div>
      <Modal
        title="Audio Preview"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="download" onClick={handleDownload}>
            Download
          </Button>,
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>
        ]}
        width={400}
      >
        <div className="wrapper" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <AsyncAudioPlayer url={props.url} loop={loop} muted={muted} />
        </div>
      </Modal>
    </>
  );
}