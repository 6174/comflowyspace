import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Space, Tooltip } from "antd";
import { useQueueState } from '@comflowy/common/store/comfyui-queue-state';
import styles from "./reactflow-queue.module.scss";
import { DraggableModal } from 'ui/antd/draggable-modal';
import { GlobalEvents, SlotGlobalEvent } from '@comflowy/common/utils/slot-event';
import { QueueIcon } from 'ui/icons';
import { KEYS, t } from '@comflowy/common/i18n';

const Queue = () => {
  const queue = useQueueState(st => st.queue);
  const queueRunning = queue.queue_running || []; //[{ id: "2" }];
  const queuePending = queue.queue_pending || [];
  const onDeleteFromQueue = useQueueState(st => st.onDeleteFromQueue);
  const onInterruptQueue = useQueueState(st => st.onInterruptQueue);
  const loading = useQueueState(st => st.loading);

  const [cancleing, setCanclecing] = useState(false);
  const onCancel = useCallback(() => {
    setCanclecing(true);
    onInterruptQueue();
  }, []);
  useEffect(() => {
    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.execution_interrupted) {
        setCanclecing(false);
      }
    })
    return () => {
      disposable.dispose();
    }
  }, []);
  return (
    <div style={{minHeight: 200}}>
      <div className="section queue">
        <div className="section-title">Running</div>
        <div className="section-content">
          {queueRunning.map((item, index) => {
            return (
              <div className="item" key={index}>
                <span className="item-title">Running-{index + 1}:</span>
                <Button size='small' loading={cancleing} disabled={cancleing} type="default" onClick={onCancel}>Cancel</Button>
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
                <span className="item-title">Pending-{index + 1}:</span>
                <Button size='small' type="default" onClick={ev => {
                  onDeleteFromQueue(item.id)
                }}>Cancel</Button>
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
  const onClearQueue = useQueueState(st => st.onClearQueue);
  const onQueueUpdate = useQueueState(st => st.onQueueUpdate);
  const loading = useQueueState(st => st.loading);
  const queue = useQueueState(st => st.queue);
  const queueRunning = queue.queue_running || [];
  const queuePending = queue.queue_pending || [];
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
      <Tooltip title={t(KEYS.executionQueue)}>
        <div className="action action-queue" onClick={showModal} >
          <QueueIcon />
        </div>
      </Tooltip>
       <DraggableModal
        title="Queue"
        open={visible}
        className={styles.queueWrapper}
        onOk={handleOk}
        initialWidth={300}
        initialHeight={300}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="actions" style={{
          marginBottom: 20
        }}>
          <Space>
            <Button disabled={ loading || queueRunning.length + queuePending.length === 0} onClick={onClearQueue}>Clear Queue</Button>
            <Button disabled={loading} onClick={onQueueUpdate}>Refresh Queue</Button>
          </Space>
        </div>
        <Queue/>
      </DraggableModal>
    </>
  )
});
