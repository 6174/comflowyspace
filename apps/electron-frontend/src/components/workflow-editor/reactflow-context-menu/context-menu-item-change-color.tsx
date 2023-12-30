import React, { useCallback, useState } from 'react';
import { Popover, Input, Space, Button } from 'antd';
import { NodeMenuProps } from './types';
import { useAppStore } from '@comflowy/common/store';
import { SDNODE_COLORS, SDNodeColorOption } from '@comflowy/common/comfui-interfaces';
import styles from "./reactflow-context-menu.module.scss";
const ChangeColorMenuItem = (props: NodeMenuProps) => {
  const [visible, setVisible] = useState(false);
  const { node } = props;
  const [color, setColor] = useState<SDNodeColorOption>({
    color: node.color,
    bgcolor: node.bgcolor
  });

  const onNodeAttributeChange = useAppStore(st => st.onNodeAttributeChange);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };


  const handleColorChange = useCallback((color: SDNodeColorOption) => {
    console.log("change color");
    onNodeAttributeChange(props.id, {
      color: color.color,
      bgcolor: color.bgcolor
    });
    props.hide();
  }, []);

  const content = (
    <div className="content change-color">
      <p>Change  Color</p>
      <br />
      <Space>
        {SDNODE_COLORS.map((colorOption, index) => {
          return (
            <div
              key={index}
              className="color-option"
              style={{
                backgroundColor: colorOption.color,
                border: `solid 2px ${colorOption.bgcolor}`,
                width: 20,
                height: 20,
                borderRadius: 20,
              }}
              onClick={ev => {
                handleColorChange(colorOption);
              }}
            >
            </div>
          )
        })}
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
      <div>Colors</div>
    </Popover>
  );
};

export default ChangeColorMenuItem;