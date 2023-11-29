import React, { useState } from 'react';
import { Tree, Input } from 'antd';
import { useAppStore } from '@comflowy/common/store';

const { TreeNode } = Tree;
const { Search } = Input;
import styles from "./widget-tree.style.module.scss";
export const WidgetTree = () => {
    const { widgets, widgetCategory } = useAppStore()
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const generateTreeNodes = (data, parentKey = '') => {
        return Object.keys(data).map((key) => {
            const nodeKey = parentKey ? `${parentKey}-${key}` : key;
            const node = data[key];

            if (node && typeof node === 'object' && !node.input) {
                return (
                    <TreeNode key={nodeKey} title={key}>
                        {generateTreeNodes(node, nodeKey)}
                    </TreeNode>
                );
            }
            return <TreeNode key={nodeKey} title={key} />;
        });
    };

    const handleSearch = (value) => {
        const expandedKeys = Object.keys(widgets).filter(
            (key) => widgets[key].name.toLowerCase().includes(value.toLowerCase())
        );
        setExpandedKeys(expandedKeys);
        setSearchValue(value);
    };

    const onExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
        setAutoExpandParent(false);
    };

    return (
        <div className={styles.widgetTree}>
            <Search
                placeholder="Search widgets"
                onChange={(e) => handleSearch(e.target.value)}
                value={searchValue}
            />
            <Tree
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
            >
                {generateTreeNodes(widgetCategory)}
            </Tree>
        </div>
    );
};