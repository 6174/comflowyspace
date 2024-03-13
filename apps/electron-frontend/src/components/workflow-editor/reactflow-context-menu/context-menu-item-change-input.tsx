import React, { useCallback, useEffect, useState } from 'react';
import { Popover, Space, Button, Switch } from 'antd';
import { NodeMenuProps } from './types';
import { useAppStore } from '@comflowy/common/store';
import styles from "./reactflow-context-menu.module.scss";
import { FlowPropsKey, Input, InputType } from '@comflowy/common/types';
import { EditIcon } from 'ui/icons';
type InputArrayItem = { property: string; type: any; disabled: boolean; enable: boolean };
type InputArray = InputArrayItem[];

const ChangeInputMenuItem = (props: NodeMenuProps) => {
  const [visible, setVisible] = useState(false);
  const { node, widget } = props;
  const [inputItems, setInputItems] = useState<InputArray>([])

  useEffect(() => {
    const currentInputs = node.inputs || [];
    const arr: InputArray = [];
    const inputKeys = currentInputs.map(input => input.name);
    for (const [property, input] of Object.entries(widget.input.required)) {
      const type = Input.getTypeName(input);
      if (!Input.isParameterOrList(input)) {
        arr.push({ 
          property, 
          type,
          disabled: true,
          enable: true
        })
      } else {
        arr.push({
          property,
          type,
          disabled: false,
          enable: inputKeys.indexOf(property) !== -1
        })
      }
    }
    arr.sort((a, b) => {
      const aIndex = inputKeys.indexOf(a.property);
      const bIndex = inputKeys.indexOf(b.property);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return 0;
      }
    });
    setInputItems(arr);
  }, [node, widget]);

  const onNodeAttributeChange = useAppStore(st => st.onNodeAttributeChange);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const handleInputChange = useCallback((property: string, enable: boolean) => {
    const newInputItems = [...inputItems];
    const index = newInputItems.findIndex(item => item.property === property);
    if (index) {
      newInputItems[index].enable = enable;
      setInputItems(newInputItems);
      const inputs = newInputItems.filter(item => item.enable).map(item => ({name: item.property, type: item.type}));
      onNodeAttributeChange(props.id, { inputs });
    }
  }, [props.id, inputItems, node]);

  const content = (
    <div className="content change-input">
      <p>Inputs</p>
      <div className="items">
        {inputItems.map(item => {
          return (
            <div className="input-item" key={item.property}>
              <div className="name">
                {item.property}<span className="type">{"("}{item.type}{")"}</span>
              </div>
              <div className="switch">
                <Switch value={item.enable} size='small' disabled={item.disabled} onChange={val => {
                  handleInputChange(item.property, val);
                }}/>
              </div>
            </div>
          )
        })}
      </div>
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
      <div className='menu-item-title'> <EditIcon/> Convert to input</div>
    </Popover>
  );
};

export default ChangeInputMenuItem;