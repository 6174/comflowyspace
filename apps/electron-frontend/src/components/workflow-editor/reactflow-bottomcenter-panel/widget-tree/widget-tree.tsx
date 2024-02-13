import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { useAppStore } from '@comflowy/common/store';
import styles from "./widget-tree.style.module.scss";
import { SDNode, Widget } from '@comflowy/common/comfui-interfaces';
import { SearchIcon } from 'ui/icons';
import { XYPosition } from 'reactflow';
import { PersistedWorkflowNode } from '@comflowy/common/storage';

export const WidgetTree = (props: {
    showCategory?: boolean;
    id: number;
    filter?: (widget: Widget) => boolean;
    position?: XYPosition;
    autoFocus?: boolean;
    draggable?: boolean;
    onNodeCreated?: (node: PersistedWorkflowNode) => void
}) => {
    const showCategory = props.showCategory;
    const filter = props.filter || ((w: Widget) => true);
    const widgets = useAppStore(st => st.widgets);
    const widgetCategory = useAppStore(st => st.widgetCategory);
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    useEffect(() => {
        setSearchValue('');
    }, [props.id]);
    const getWidgetSearchString = (widget) => {
        return `${widget.name} ${widget.display_name} ${widget.category} ${widget.description}`.toLowerCase();
    }
    const handleSearch = (value) => {
        setSearchValue(value);
        const searchWords = value.toLowerCase().split(' ');

        const findedWidgets = Object.keys(widgets).filter(
            (key) => {
                const widget = widgets[key];
                const search_string = getWidgetSearchString(widget);
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

        // Sort the widgets based on the match length with the search value
        const reOrderedWidgets = findedWidgets.sort((a, b) => {
            const aMatch = maxMatchLength(value.toLowerCase(), getWidgetSearchString(widgets[a]));
            const bMatch = maxMatchLength(value.toLowerCase(), getWidgetSearchString(widgets[b]));

            // Check for exact matches and prioritize them
            if (value.toLowerCase() === widgets[a].name.toLowerCase() && value.toLowerCase() !== widgets[b].name.toLowerCase()) {
                return -1;
            } else if (value.toLowerCase() !== widgets[a].name.toLowerCase() && value.toLowerCase() === widgets[b].name.toLowerCase()) {
                return 1;
            }

            return bMatch - aMatch;
        });
        setSearchResult(reOrderedWidgets.map(key => widgets[key]));
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
                    return widget.category.indexOf(currentCategory) >= 0 && filter(widget);
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
        <div className={`widget-category-panel ${!showCategory ? "no-category" : ""}`}>
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
                                        <WidgetNode 
                                            draggable={props.draggable}
                                            widget={widget} 
                                            key={widget.name} 
                                            position={props.position}
                                            onNodeCreated={props.onNodeCreated}
                                        />
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
        <div className={styles.widgetTree} style={{
            width: showCategory ? 360 : 280
        }}>
            <div className="search-box">
                <Input
                    autoFocus={props.autoFocus}
                    prefix={<SearchIcon />}
                    placeholder="Search widgets"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchValue}
                />
            </div>
            {
                searchValue == "" ? widgetCategoryPanel : (
                    <div className='search-result'>
                        {searchResult.map((item, index) => {
                            return (
                                <div className='search-result-item' key={item.name + index}>
                                    <WidgetNode
                                        draggable={props.draggable}
                                        widget={item} 
                                        position={props.position}
                                        onNodeCreated={props.onNodeCreated}
                                        />
                                </div>
                            )
                        })}
                    </div>
                )
            }

        </div>
    );
};

/**
 *  Drag to create https://reactflow.dev/examples/interaction/drag-and-drop
 **/
function WidgetNode({ widget, onNodeCreated, position, draggable }: { 
    widget: Widget,
    draggable?: boolean,
    position?: XYPosition,
    onNodeCreated?: (node: PersistedWorkflowNode) => void  
}) {
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
        const pos = editorInstance.screenToFlowPosition(position || {
            x: rect.left + rect.width + 40,
            y: ev.clientY - 100
        });
        const node = onAddNode(widget, pos);
        onNodeCreated?.(node);
    }, [widget, ref]);

    return (
        <div className={`widget-node action ${draggable ? "dndnode" : ""}`}
            draggable={draggable}
            ref={ref}
            onClick={ev => {
                createNewNode(ev);
            }}
            onDragStart={draggable ? onDragStart : null}
            title={widget.name}>
            <div className="display-name">{widget.display_name}</div>
            <div className='class_name'>
                Type: {widget.name}
            </div>
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