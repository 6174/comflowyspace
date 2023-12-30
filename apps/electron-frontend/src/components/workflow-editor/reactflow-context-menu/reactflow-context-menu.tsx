import React, { useCallback, useEffect, useState } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import styles from './reactflow-context-menu.module.scss';
import { SDNode, Widget } from '@comflowy/common/comfui-interfaces';
import { FlowNodeProps } from '../reactflow-node/reactflow-node-container';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import ChangeTitleMenuItem from './context-menu-item-change-title';
import { NodeMenuProps } from './types';

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  right: number;
  bottom: number;
  hide: () => void;
}

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  hide,
  ...props
}: ContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
  const [node, setNode] = useState<FlowNodeProps>(null);
  useEffect(() => {
    const node = getNode(id) as unknown as FlowNodeProps;
    node && setNode(node);
  }, [id]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className={styles.reactflowContextMenu}
      {...props}
    >
      {node && <NodeMenu hide={hide} node={node.data.value} widget={node.data.widget} /> }
    </div>
  );
}

function NodeMenu(props: NodeMenuProps) {
  const {widget, node} = props;
  const onClick: MenuProps['onClick'] = (e) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    console.log('click', e);
    if (e.key === 'MENU_ITEM_CHANGE_TITLE') {
      console.log("click me ")
    } else {
      // props.hide();
    }
  };

  const items: MenuItem[] = [
    {type: "divider"},
    getItem((<ChangeTitleMenuItem {...props}/>), 'MENU_ITEM_CHANGE_TITLE', null, null),
    getItem("Color", 'MENU_ITEM_CHANGE_COLOR', null, null),
    { type: "divider" },
    getItem('Input properties', 'sub1', null, [
      getItem('Item 1', null, null, [getItem('Option 1', '1'), getItem('Option 2', '2')], 'group'),
      getItem('Item 2', null, null, [getItem('Option 3', '3'), getItem('Option 4', '4')], 'group'),
    ]),
    { type: "divider" },
    getItem("Duplicate", 'MENU_ITEM_DUPLICATE_NODE', null, null),
    getItem("Delte", 'MENU_ITEM_DELETE_NODE', null, null),
  ];

  return (
    <div className='node-menu'>
      <div className="node-info">
        Type: {widget.name}
      </div>
      <Menu onClick={onClick} style={{ width: 256 }} mode="vertical" items={items} />
    </div>
  )
}

type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  onClick?: MenuProps['onClick'],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}
