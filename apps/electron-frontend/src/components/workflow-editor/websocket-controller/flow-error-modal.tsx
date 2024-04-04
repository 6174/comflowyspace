import { ErrorIcon } from "@/components/comflowy-console/log-types/log";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { Modal, Space } from "antd";
import { useEffect, useState } from "react";

export function ExecutionErrorModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{
    title: string,
    message: string
  }>(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.show_execution_error) {
        setErrorMessage(ev.data);
        showModal();
      }
    })
  }, [])

  const $title = (
    <Space style={{
      lineHeight: "14px"
    }}>
      <ErrorIcon/>
      <span>Executing Error</span>
    </Space>
  )
  return (
    <>
      <Modal title={$title} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <div className="title"> {errorMessage?.title}</div>
        {errorMessage?.message && (
          <div className="content" style={{
            padding: 10,
            borderRadius: 8,
            background: '#000',
            color: '#fff',
            maxHeight: 500,
            overflow: 'auto',
            fontSize: 12,
            marginTop: 10
          }}>
            <pre className="error-message">
              {errorMessage?.message}
            </pre>
          </div>
        )}
      </Modal>
    </>
  )
}