import React, { useCallback, useState } from 'react';
import { Popover, Input, Space, Button } from 'antd';
import { NodeMenuProps } from './types';
import { useAppStore } from '@comflowy/common/store';
import { RenameIcon } from 'ui/icons';


const ChangeTitleMenuItem = (props: NodeMenuProps) => {
  const [visible, setVisible] = useState(false);
  const { node } = props;
  const [title, setTitle] = useState(node.title || node.widget);
  const onNodeAttributeChange = useAppStore(st => st.onNodeAttributeChange);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    console.log("change title");
    // onTitleChange(e.target.value);
  };

  const handleTitleSubmit = useCallback(() => {
    console.log("change title");
    onNodeAttributeChange(props.id, {'title': title});
    props.hide();
  }, [title]);

  const content = (
    <div className="content">
      <Space>
        <Input value={title} onChange={handleTitleChange} />
        <Button type="primary" size="small" onClick={handleTitleSubmit}>Save</Button>
      </Space>
    </div>
  )

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={visible}
      placement='right'
      onOpenChange={handleVisibleChange}
    >
      <div className="menu-item-title"> 
        <RenameIcon/>  Rename 
      </div>
    </Popover>
  );
};

export default ChangeTitleMenuItem;