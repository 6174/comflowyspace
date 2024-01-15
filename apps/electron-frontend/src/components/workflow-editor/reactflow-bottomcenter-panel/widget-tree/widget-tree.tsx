import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { useAppStore } from '@comflowy/common/store';
import styles from "./widget-tree.style.module.scss";
import { Widget } from '@comflowy/common/comfui-interfaces';
import { SearchIcon } from 'ui/icons';
import { useStoreApi } from 'reactflow';

export const WidgetTree = (props: {
    showCategory?: boolean;
    filter?: (widget: Widget) => boolean;
}) => {
    const showCategory = props.showCategory;
    const filter = props.filter || ((w: Widget) => true);
    const widgets = useAppStore(st => st.widgets);
    const widgetCategory = useAppStore(st => st.widgetCategory);
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const handleSearch = (value) => {
        setSearchValue(value);
        const searchWords = value.toLowerCase().split(' ');
        const findedWidgets = Object.keys(widgets).filter(
            (key) => {
                const widget = widgets[key];
                const search_string = `${widget.name} ${widget.display_name} ${widget.category} ${widget.description}`.toLowerCase();
                if (!filter(widget)) {
                    return false;
                }
                if (searchWords.every(word => search_string.includes(word))) {
                    return true;
                }
                const maxMatch = maxMatchLength(value.toLowerCase(), search_string);
                if (maxMatch >= 4) {
                    return true;
                }
            }
        );
        setSearchResult(findedWidgets.map(key => widgets[key]));
    };

    const firstLevelCatogories = Object.keys(widgetCategory);
    const [currentCategory, setCurrentCategory] = useState("");
    const [widgetToRender, setWidgetToRender] = useState<{ cagetory: string, items: Widget[] }[]>([]);
    
    useEffect(() => {
        const keys = Object.keys(widgetCategory);
        if (keys.length > 0) {
            setCurrentCategory(keys[0]);
        }
    }, [widgetCategory])

    useEffect(() => {
        const widgetList = Object.keys(widgets).filter(
            (key) => {
                const widget = widgets[key];
                if (showCategory) {
                    return widget.category.indexOf(currentCategory) >= 0  && filter(widget);
                }
                return filter(widget);
            }
        );
        const ret = groupByCategory(widgetList.map(key => widgets[key]));
        const subcagetories = Object.keys(ret);
        const widgetToRender = subcagetories.map((cagetory) => {
            return {
                cagetory,
                items: ret[cagetory]
            }
        });
        setWidgetToRender(widgetToRender);

        function groupByCategory(widgets: Widget[]): Record<string, Widget[]> {
            return widgets.reduce((acc, widget) => {
                const category = widget.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(widget);
                return acc;
            }, {} as Record<string, Widget[]>);
        }
    }, [currentCategory, widgets]);

    const widgetCategoryPanel = (
        <div className="widget-category-panel">
            {showCategory && (
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
            )}
            
            <div className="widget-list">
                {widgetToRender.map((item) => {
                    return (
                        <div className="widget-category-section" key={item.cagetory}>
                            <div className="widget-category-section-title">{item.cagetory}</div>
                            <div className="widget-category-section-content">
                                {item.items.map((widget) => {
                                    return (
                                        <WidgetNode widget={widget} key={widget.name} />
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
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
function WidgetNode({widget}: {widget: Widget}) {
    const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        const widgetInfo = JSON.stringify(widget);
        event.dataTransfer.setData('application/reactflow', widgetInfo);
        event.dataTransfer.effectAllowed = 'move';
    }, [widget]);
    const ref = useRef<HTMLDivElement>();

    const editorInstance = useAppStore(st => st.editorInstance)
    const onAddNode = useAppStore(st => st.onAddNode);
    const createNewNode = useCallback(async (ev: React.MouseEvent) => {
        const rect = ref.current.getBoundingClientRect();
        const pos = editorInstance.screenToFlowPosition({
            x: rect.left + rect.width + 40,
            y: ev.clientY - 100
        });
        await onAddNode(widget, pos); 
    }, [widget, ref]);

    return (
        <div className='widget-node action dndnode' 
            draggable 
            ref={ref}
            onClick={ev => {
                createNewNode(ev);
            }}
            onDragStart={onDragStart} 
            title={widget.name}>
            <div className="display-name">{widget.display_name}</div>
            <div className='class_name'>
                Type: {widget.name}
            </div>
        </div>
    )
}

function SearchList({ items }: { items: Widget[] }) {
    return (
        <div className='search-result'>
            {items.map((item, index) => {
                return (
                    <div className='search-result-item' key={item.name + index}>
                        <WidgetNode widget={item}/>
                    </div>
                )
            })}
        </div>
    )
}

function maxMatchLength(searchTerm: string, sourceString: string): number {
    let maxMatch = 0;
    for (let i = 0; i < sourceString.length; i++) {
        for (let j = i + 1; j <= sourceString.length; j++) {
            const subStr = sourceString.slice(i, j);
            if (searchTerm.includes(subStr) && subStr.length > maxMatch) {
                maxMatch = subStr.length;
            }
        }
    }
    return maxMatch;
}