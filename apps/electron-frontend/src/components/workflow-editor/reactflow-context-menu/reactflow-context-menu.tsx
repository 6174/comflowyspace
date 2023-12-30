import React, { useCallback, useEffect, useState } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import styles from './reactflow-context-menu.module.scss';
import { SDNode, Widget } from '@comflowy/common/comfui-interfaces';
import { FlowNodeProps } from '../reactflow-node/reactflow-node-container';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import ChangeTitleMenuItem from './context-menu-item-change-title';
import { NodeMenuProps } from './types';
import ChangeColorMenuItem from './context-menu-item-change-color';
import ChangeInputMenuItem from './context-menu-item-change-input';
import { useAppStore } from '@comflowy/common/store';

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
      {node && <NodeMenu hide={hide} id={id} node={node.data.value} widget={node.data.widget} /> }
    </div>
  );
}

function NodeMenu(props: NodeMenuProps) {
  const {widget, node} = props;
  const {id} = props;
  const onDuplicateNode = useAppStore(st => st.onDuplicateNode);
  const onNodesDelete = useAppStore(st => st.onNodesDelete);

  const onClick: MenuProps['onClick'] = (e) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    console.log('click', e);
    switch (e.key) {
      case 'MENU_ITEM_CHANGE_TITLE':
        console.log("change title")
        break;
      case 'MENU_ITEM_CHANGE_COLOR':
        console.log("change color")
        break;
      case 'MENU_ITEM_CHANGE_INPUT':
        console.log("change input")
        break;
      case 'MENU_ITEM_DUPLICATE_NODE':
        onDuplicateNode(id);
        props.hide();
        console.log("duplicate node")
        break;
      case 'MENU_ITEM_DELETE_NODE':
        onNodesDelete([{id}]);
        props.hide();
        console.log("delete node")
        break;
      default:
        break;
    }
  };

  const items: MenuItem[] = [
    {type: "divider"},
    getItem((<ChangeTitleMenuItem {...props}/>), 'MENU_ITEM_CHANGE_TITLE', null, null),
    getItem(<ChangeColorMenuItem {...props}/>, 'MENU_ITEM_CHANGE_COLOR', null, null),
    { type: "divider" },
    getItem(<ChangeInputMenuItem {...props} />, 'MENU_ITEM_CHANGE_INPUT', null, null),
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
