import React, { useCallback, useState } from 'react';
import { Popover, Input, Space, Button } from 'antd';
import { NodeMenuProps } from './types';
import { useAppStore } from '@comflowy/common/store';
import styles from "./reactflow-context-menu.module.scss";
const MenuItem = (props: NodeMenuProps) => {
  const [visible, setVisible] = useState(false);
  const { node } = props;
  const onNodeAttributeChange = useAppStore(st => st.onNodeAttributeChange);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const content = (
    <div className="content">
      <p>Title</p>
      <Space>
      </Space>
    </div>
  )

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={visible}
      overlayClassName={styles.reactflowContextMenuPopover}
      placement='right'
      onOpenChange={handleVisibleChange}
    >
      <div>Menu Title</div>
    </Popover>
  );
};

export default MenuItem;