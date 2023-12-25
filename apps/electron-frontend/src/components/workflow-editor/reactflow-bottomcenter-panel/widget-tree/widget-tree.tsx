import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tree, Input } from 'antd';
import { useAppStore } from '@comflowy/common/store';

const { TreeNode } = Tree;
const { Search } = Input;
import styles from "./widget-tree.style.module.scss";
import { Widget } from '@comflowy/common/comfui-interfaces';
export const WidgetTree = () => {
    const widgets = useAppStore(st => st.widgets);
    const widgetCategory = useAppStore(st => st.widgetCategory);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [searchResult, setSearchResult] = useState([]);

    const generateTreeNodes = (data, parentKey = '') => {
        return Object.keys(data).map((key) => {
            const nodeKey = parentKey ? `${parentKey}-${key}` : key;
            const node = data[key];

            if (node && !node.input) {
                return (
                    <TreeNode key={nodeKey} title={key}>
                        {generateTreeNodes(node, nodeKey)}
                    </TreeNode>
                );
            }
            return <TreeNode key={nodeKey} title={<WidgetTreeNodeTitle widget={node}/>} />;
        });
    };;

    const handleSearch = (value) => {
        setSearchValue(value);
        const findedWidgets = Object.keys(widgets).filter(
            (key) => {
                const widget = widgets[key];
                const search_string = `${widget.name} ${widget.display_name} ${widget.category} ${widget.description}`
                return search_string.toLowerCase().includes(value.toLowerCase());
            }
        );
        setSearchResult(findedWidgets.map(key => widgets[key]));
        // const categories = findedWidgets.map((key) => widgets[key].category);
        // const expandedKeys = [];
        // categories.forEach((category) => {
        //     const categoryKey = generatePaths(category);
        //     expandedKeys.push(...categoryKey);
        // });

        // setExpandedKeys(expandedKeys);
        // setSearchValue(value);
        // function generatePaths(input) {
        //     const segments = input.split('/');
        //     const result = [];

        //     for (let i = 0; i < segments.length; i++) {
        //         const path = segments.slice(0, i + 1).join('-');
        //         result.push(path);
        //     }

        //     return result;
        // }
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
            {
                searchValue == "" ? (
                    <Tree
                        showLine
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                    >
                        {generateTreeNodes(widgetCategory)}
                    </Tree>
                ) : (
                    <SearchList items={searchResult} />
                )
            }

        </div>
    );
};

/**
 *  Drag to create https://reactflow.dev/examples/interaction/drag-and-drop
 **/ 
function WidgetTreeNodeTitle({widget}: {widget: Widget}) {
    const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('application/reactflow', widget.name);
        event.dataTransfer.effectAllowed = 'move';
    }, [widget]);
    const ref = useRef<HTMLDivElement>();

    return (
        <div className='widget-title dndnode' 
            draggable 
            ref={ref}
            onDragStart={onDragStart} 
            title={widget.name}>
            {widget.display_name || widget.name}
        </div>
    )
}

function SearchList({ items }: { items: Widget[] }) {
    return (
        <div className='search-result'>
            {items.map((item, index) => {
                return (
                    <div className='search-result-item' key={item.name + index}>
                        <WidgetTreeNodeTitle widget={item}/>
                    </div>
                )
            })}
        </div>
    )
}