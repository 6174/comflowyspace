import React, { useCallback, useState } from 'react';
import { Popover, Input, Space, Button } from 'antd';
import { NodeMenuProps } from './types';


const ChangeTitleMenuItem = (props: NodeMenuProps) => {
  const [visible, setVisible] = useState(false);
  const { node } = props;
  const [title, setTitle] = useState(node.title || node.widget);

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
      <div>Change Title</div>
    </Popover>
  );
};

export default ChangeTitleMenuItem;