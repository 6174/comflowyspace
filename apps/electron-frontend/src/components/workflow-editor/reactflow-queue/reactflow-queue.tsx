import React, { useCallback, useState } from 'react';
import { Button, Modal, Space } from "antd";
import { useQueueState } from '@comflowy/common/store/comfyui-queue-state';
import styles from "./reactflow-queue.module.scss";

const Queue = () => {
  const queue = useQueueState(st => st.queue);
  const queueRunning = [{
    id: 1
  }, {
    id: 2
  }] // queue.queue_running || [];
  const queuePending = queue.queue_pending || [];
  return (
    <div className={styles.queueWrapper} style={{minHeight: 200}}>
      <div className="section queue">
        <div className="section-title">Running</div>
        <div className="section-content">
          {queueRunning.map((item, index) => {
            return (
              <div className="item" key={index}>
                <div className="item-title">{item.id}:</div>
                <Button size='small' type="default">Cancel</Button>
              </div>
            )
          })}
        </div>
      </div>
      <div className="section queue">
        <div className="section-title">Pending</div>
        <div className="section-content">
          {queuePending.map((item, index) => {
            return (
              <div className="item" key={index}>
                <div className="item-title">{item.id}:</div>
                <Button size='small' type="default">Cancel</Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export const QueueEntry = React.memo(() => {
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
    <div className="action action-queue">
      <div onClick={showModal}>Queue</div>
      <Modal
        title="Queue"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="actions" style={{
          marginBottom: 20
        }}>
          <Space>
            <Button>Clear Queue</Button>
            <Button>Refresh Queue</Button>
          </Space>
        </div>
        <Queue/>
      </Modal>
    </div>
  )
});
