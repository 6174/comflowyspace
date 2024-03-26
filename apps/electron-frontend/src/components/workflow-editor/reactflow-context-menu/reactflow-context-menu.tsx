import React, { useCallback, useEffect, useState } from 'react';
import { Node, NodeProps, useReactFlow } from 'reactflow';
import styles from './reactflow-context-menu.module.scss';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import ChangeTitleMenuItem from './context-menu-item-change-title';
import { NodeMenuProps } from './types';
import ChangeColorMenuItem from './context-menu-item-change-color';
import ChangeInputMenuItem from './context-menu-item-change-input';
import { useAppStore } from '@comflowy/common/store';
import { BypassIcon, CollapseIcon, CopyIcon, DeleteIcon, DisableRunIcon, EnableRunIcon, ExpandIcon } from 'ui/icons';
import { EditImageMenuItem, needEditImage } from './context-menu-item-edit-image/context-menu-item-edit-image';
import { NodeVisibleState } from '@comflowy/common/types';

interface ContextMenuProps {
  nodes: Node[];
  top: number;
  left: number;
  right: number;
  bottom: number;
  hide: () => void;
}

export default function ContextMenu({
  nodes,
  top,
  left,
  right,
  bottom,
  hide,
  ...props
}: ContextMenuProps) {
  const singleNode = nodes.length === 1;
  const node = nodes[0];
  return (
    <div
      style={{ top, left, right, bottom }}
      className={styles.reactflowContextMenu}
      {...props}
    >
      {singleNode 
        ? <NodeMenu hide={hide} id={node.id} node={node.data.value} widget={node.data.widget} /> 
        : <NodesMenu hide={hide} nodes={nodes}/> }

    </div>
  );
}

function NodesMenu(props: {
  nodes: Node[];
  hide: () => void;
}) {
  const onDuplicateNodes = useAppStore(st => st.onDuplicateNodes);
  const onDeleteNodes = useAppStore(st => st.onDeleteNodes);
  const ids = props.nodes.map(node => node.id);
  const onClick: MenuProps['onClick'] = (e) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    switch (e.key) {
      case 'MENU_ITEM_DUPLICATE_NODE':
        onDuplicateNodes(ids);
        props.hide();
        console.log("duplicate node")
        break;
      case 'MENU_ITEM_DELETE_NODE':
        onDeleteNodes(ids.map(id => ({id})));
        props.hide();
        console.log("delete node")
        break;
      default:
        break;
    }
  };
  const items: MenuItem[] = [
    getMenuItem(<div className="menu-item-title"> <CopyIcon /> Duplicate</div>, 'MENU_ITEM_DUPLICATE_NODE', null, null),
    getMenuItem(<div className="menu-item-title"> <DeleteIcon /> Remove </div>, 'MENU_ITEM_DELETE_NODE', null, null),
  ];
  return (
    <div className='node-menu' style={{
      paddingTop: 8
    }}>
      <Menu onClick={onClick} style={{ width: 256 }} mode="vertical" items={items} />
    </div>
  )
}

function NodeMenu(props: NodeMenuProps) {
  const {widget, node} = props;
  const {id} = props;
  const onDuplicateNodes = useAppStore(st => st.onDuplicateNodes);
  const onDeleteNodes = useAppStore(st => st.onDeleteNodes);
  const onChangeNodeVisibleState = useAppStore(st => st.onChangeNodeVisibleState)
  const onChangeNodeBypass = useAppStore(st => st.onChangeNodeBypass);
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
        onDuplicateNodes([id]);
        props.hide();
        console.log("duplicate node")
        break;
      case 'MENU_ITEM_DELETE_NODE':
        onDeleteNodes([{id}]);
        props.hide();
        console.log("delete node")
        break;
      case 'MENU_ITEM_COLLPASE_NODE':
        onChangeNodeVisibleState(id, NodeVisibleState.Collapsed);
        props.hide();
        break;
      case 'MENU_ITEM_EXPAND_NODE':
        onChangeNodeVisibleState(id, NodeVisibleState.Expaned);
        props.hide();
        break;
      case 'MENU_ITEM_UN_BYPASS':
        onChangeNodeBypass(id, false);
        props.hide();
        break;
      case 'MENU_ITEM_BYPASS':
        onChangeNodeBypass(id, true);
        props.hide();
        break;
      default:
        break;
    }
  };

  const hasInputs = node.inputs && node.inputs.length > 0;
  const items: MenuItem[] = [
    getMenuItem(<div className="menu-item-title"> <CopyIcon /> Duplicate</div>, 'MENU_ITEM_DUPLICATE_NODE', null, null),
    getMenuItem((<ChangeTitleMenuItem {...props}/>), 'MENU_ITEM_CHANGE_TITLE', null, null),
    { type: "divider" },
  ];

  const nodeVisibleState = node.properties?.nodeVisibleState || NodeVisibleState.Expaned;
  if (nodeVisibleState === NodeVisibleState.Expaned) {
    items.push(getMenuItem(<div className="menu-item-title"> <CollapseIcon/> Collpase </div>, 'MENU_ITEM_COLLPASE_NODE', null, null));
  } else if (nodeVisibleState === NodeVisibleState.Collapsed) {
    items.push(getMenuItem(<div className="menu-item-title"> <ExpandIcon/> EXPAND </div>, 'MENU_ITEM_EXPAND_NODE', null, null));
  }

  const bypassState = node.bypass || false;
  if (bypassState) {
    items.push(getMenuItem(<div className="menu-item-title"> <EnableRunIcon /> Enable Node</div>, 'MENU_ITEM_UN_BYPASS', null, null));
  } else {
    items.push(getMenuItem(<div className="menu-item-title"> <DisableRunIcon /> Disable Node</div>, 'MENU_ITEM_BYPASS', null, null));
  }
  items.push({ type: "divider" });

  if (hasInputs) {
    items.push(getMenuItem(<ChangeInputMenuItem {...props} />, 'MENU_ITEM_CHANGE_INPUT', null, null))
    items.push({ type: "divider" })
  }

  if (needEditImage(node)) {
    items.push(getMenuItem(<EditImageMenuItem {...props} />, 'MENU_ITEM_EDIT_IMAGE', null, null))
    items.push({ type: "divider" })
  }

  items.push(getMenuItem(<div className="menu-item-title"> <DeleteIcon /> Remove </div>, 'MENU_ITEM_DELETE_NODE', null, null));

  return (
    <div className='node-menu'>
      <div className="node-info">
        {widget.name}
      </div>
      <ChangeColorMenuItem {...props}/>
      <Menu onClick={onClick} style={{ width: 200 }} mode="vertical" items={items} />
    </div>
  )
}

export type MenuItem = Required<MenuProps>['items'][number];
export function getMenuItem(
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
