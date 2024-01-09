import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { useAppStore } from '@comflowy/common/store';
import styles from "./widget-tree.style.module.scss";
import { Widget } from '@comflowy/common/comfui-interfaces';
import { SearchIcon } from 'ui/icons';

export const WidgetTree = (props: {
    showCategory?: boolean;
    filter?: (widget: Widget) => boolean;
}) => {
    const filter = props.filter || (() => true);
    const widgets = useAppStore(st => st.widgets);
    const widgetCategory = useAppStore(st => st.widgetCategory);
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
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
    };

    console.log("categories", widgetCategory);

    const [currentCategory, setCurrentCategory] = useState(widgetCategory[0]);
    const firstLevelCatogories = Object.keys(widgetCategory);
    const widgetCategoryPanel = (
        <div className="widget-category-panel">
            <div className="category">
                {firstLevelCatogories.map((name) => {
                    return (
                        <div className={`category-item ${currentCategory === name ? "active" : ""}`} key={name} onClick={() => {
                            setCurrentCategory(name);
                        }}>
                            {name}
                        </div>
                    )
                })}
            </div>
            <div className="widget-list">

            </div>
        </div>
    );

    return (
        <div className={styles.widgetTree}>
            <div className="search-box">
                <Input
                    prefix={<SearchIcon/>}
                    placeholder="Search widgets"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchValue}
                />
            </div>
            {
                searchValue == "" ? widgetCategoryPanel : (
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
        const widgetInfo = JSON.stringify(widget);
        event.dataTransfer.setData('application/reactflow', widgetInfo);
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