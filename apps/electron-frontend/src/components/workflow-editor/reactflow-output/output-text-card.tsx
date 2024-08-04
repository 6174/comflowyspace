import { EyeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, message, Modal, Space } from "antd";
import { Suspense, lazy, useEffect, useState } from "react";
import styles from "./output-text-card.module.scss";
import { copyToClipboard } from "ui/utils/clipboard";
import TextArea from "antd/es/input/TextArea";

export function TextPreview(props: {
  text: string,
  preview?: boolean,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const text = props.text || "text";
  const preview = props.preview ?? false;
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCopy = () => {
    copyToClipboard(text);
    message.success("Copy success");
  };

  return (
    <>
      <div className={"text-preview nopan nodrag " + styles.textCard} onClick={ev => {
        if (preview) {
          showModal();
        }
      }}>
        <div className="inner">
          {preview ? (
            <div className="text-preview-content">
              {text}
            </div>
          ) : (
            <TextArea value={text} autoSize></TextArea>
          )}
        </div>
      </div>
      <Modal
        title="Text Preview"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="download" onClick={handleCopy}>
            Copy Text
          </Button>,
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>
        ]}
        width={400}
      >
        <div className="wrapper" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <TextArea value={text} autoSize></TextArea>
        </div>
      </Modal>
    </>
  );
}