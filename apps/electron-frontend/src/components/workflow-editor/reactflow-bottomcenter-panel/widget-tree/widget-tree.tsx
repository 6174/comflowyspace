import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { Input, Popover } from 'antd';
import { useAppStore } from '@comflowy/common/store';
import styles from "./widget-tree.style.module.scss";
import { PersistedWorkflowNode, SDNode, Widget } from '@comflowy/common/types';
import { SearchIcon, PinIcon, PinFilledIcon } from 'ui/icons';
import { XYPosition } from 'reactflow';
import { getPinnedWidgetsFromLocalStorage, setPinnedWidgetsToLocalStorage } from '@comflowy/common/store/app-state';
import _ from 'lodash';
import { wordSplitSearch, wordSplitSearchAdvance } from "@comflowy/common/utils/search";
import { dt, currentLang } from '@comflowy/common/i18n';

import { VirtualList } from 'ui/virtual/virtual-list';
import { ReactflowWidgetPreviewCard } from '../../reactflow-node/reactflow-node-preview-card';
import { findExtensionByWidget, findExtensionByWidgetName } from '@comflowy/common/store/extension-state';

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
    const [pinnedWidgets, setPinnedWidgets] = useState<string[]>(getPinnedWidgetsFromLocalStorage());
    const firstLevelCategories = Object.keys(widgetCategory);

    const [currentCategory, setCurrentCategory] = useState(() => {
        if (pinnedWidgets.length > 0) {
            return 'Pinned';
        }
        return firstLevelCategories.length > 0 ? firstLevelCategories[0] : '';
    });

    useEffect(() => {
        setSearchValue('');
    }, [props.id]);

    const togglePin = useCallback((widget: string, pin: boolean = true) => {
        let newPinnedWidgets = [...pinnedWidgets];
        if (pin) {
            newPinnedWidgets.unshift(widget);
        } else {
            newPinnedWidgets = newPinnedWidgets.filter(w => w !== widget);
        }
        newPinnedWidgets = _.uniq(newPinnedWidgets)
        setPinnedWidgetsToLocalStorage(newPinnedWidgets);
        setPinnedWidgets(newPinnedWidgets);
    }, [pinnedWidgets]);


    const getWidgetSearchString = (widget) => {
        return `${widget.name} ${widget.display_name} ${widget.category} ${widget.description}`.toLowerCase();
    }

    const handleSearch = (value: string) => {
        const findedWidgets = Object.keys(widgets).filter((key) => {
            const widget = widgets[key];
            const searchString = getWidgetSearchString(widget);
            if (!filter(widget)) {
                return false;
            }
            // 使用改进的搜索评分函数
            const score = wordSplitSearch(value, searchString);
            return score > 0;
        });

        // 使用改进的搜索评分函数对结果进行排序
        const reOrderedWidgets = findedWidgets.sort((a, b) => {
            const aScore = wordSplitSearch(value, getWidgetSearchString(widgets[a]));
            const bScore = wordSplitSearch(value, getWidgetSearchString(widgets[b]));

            // 优先考虑完全匹配
            if (value.toLowerCase() === widgets[a].name.toLowerCase()) return -1;
            if (value.toLowerCase() === widgets[b].name.toLowerCase()) return 1;

            return bScore - aScore;
        });

        setSearchResult(reOrderedWidgets.map(key => widgets[key]));
    };

    const firstLevelCatogories = Object.keys(widgetCategory);
    const [widgetToRender, setWidgetToRender] = useState<{ category: string, items: Widget[] }[]>([]);

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
        const subcategories = Object.keys(ret);
        const widgetToRender = subcategories.map((category) => {
            return {
                category,
                items: ret[category]
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

    // console.log(widgetToRender, searchValue == "", showCategory, currentCategory, pinnedWidgets);
    const widgetCategoryPanel = (
        <div className={`widget-category-panel ${!showCategory ? "no-category" : ""}`}>
            {showCategory && (
                <div className="category">
                    {pinnedWidgets.length > 0 && (
                        <div className={`category-item ${currentCategory === "Pinned" ? "active" : ""}`} key="Pinned" onClick={() => {
                            setCurrentCategory("Pinned");
                        }}>
                            Pinned
                        </div>
                    )}
                    {firstLevelCatogories.map((name) => {
                        return (
                            <div className={`category-item ${currentCategory === name ? "active" : ""}`} key={name} onClick={() => {
                                setCurrentCategory(name);
                            }}>
                                {dt(`NodeCategory.${name}`, name)}
                            </div>
                        )
                    })}
                </div>
            )}
            <div className="widget-list">
                {
                    (currentCategory === "Pinned" && showCategory) && Array.from(pinnedWidgets).map(widgetName => {
                        const widget = widgets[widgetName];
                        return widget ? (
                            <WidgetNode
                                draggable={props.draggable}
                                widget={widgets[widgetName]}
                                key={widgetName}
                                position={props.position}
                                onNodeCreated={props.onNodeCreated}
                                isPinned={true}
                                togglePin={() => {
                                    togglePin(widgetName, false);
                                }}
                            />
                        ) : null;
                    })
                }

                {
                    widgetToRender.map(categoryItem => (
                        <div className="widget-category-section" key={categoryItem.category}>
                            <div className="widget-category-section-title">{categoryItem.category}</div>
                            <div className="widget-category-section-content">
                                {categoryItem.items.map((widget) => (
                                    <WidgetNode
                                        draggable={props.draggable}
                                        widget={widget}
                                        key={widget.name}
                                        position={props.position}
                                        onNodeCreated={props.onNodeCreated}
                                        isPinned={pinnedWidgets.indexOf(widget.name) >= 0}
                                        togglePin={() => {
                                            togglePin(widget.name, pinnedWidgets.indexOf(widget.name) === -1);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );

    const throttleSearch = useCallback(_.debounce((searchValue) => {
        console.log("search");
        handleSearch(searchValue);
    }, 300), []);

    return (
        <div className={styles.widgetTree} style={{
            width: showCategory ? 460 : 280
        }}>
            <div className="search-box">
                <Input
                    autoFocus={props.autoFocus}
                    prefix={<SearchIcon />}
                    placeholder="Search widgets"
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchValue(value);
                        throttleSearch(value)
                    }}
                    value={searchValue}
                />
            </div>

            {
                searchValue == "" ? widgetCategoryPanel : (
                    <div className='search-result'>
                        <VirtualList
                            itemHeight={68}
                            items={searchResult}
                            renderItem={(item) => {
                                return (
                                    <WidgetNode
                                        draggable={props.draggable}
                                        widget={item}
                                        position={props.position}
                                        onNodeCreated={props.onNodeCreated}
                                        isPinned={pinnedWidgets.indexOf(item.name) >= 0}
                                        togglePin={() => {
                                            togglePin(item.name, pinnedWidgets.indexOf(item.name) === -1);
                                        }}
                                    />
                                )
                            }}
                        />
                    </div>
                )
            }

        </div>
    );
};



/**
 *  Drag to create https://reactflow.dev/examples/interaction/drag-and-drop
 **/
function WidgetNode({ widget, onNodeCreated, position, draggable, isPinned, togglePin }: {
    widget: Widget,
    draggable?: boolean,
    position?: XYPosition,
    onNodeCreated?: (node: PersistedWorkflowNode) => void
    isPinned?: boolean,
    togglePin?: () => void
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

    const [isHovered, setIsHovered] = useState(false);

    const dtDisplatyName = dt(`Nodes.${widget.display_name}.title`, widget.display_name);
    const dtDisplayNameTip = dtDisplatyName !== widget.display_name ? `(${widget.display_name})` : "";
    const dtWidgetName = dt(`Nodes.${widget.name}.title`, widget.name);
    const dtWidgetNameTip = dtWidgetName !== widget.name ? `(${widget.name})` : "";

    const extension = findExtensionByWidget(widget)

    return (
        <Popover overlayClassName={styles.widgetPreviewPopover} content={(
            <div className="node-preview" style={{
                width: 200
            }}>
                <ReactflowWidgetPreviewCard widget={widget} />
            </div>
        )} placement='right' >
            <div className={`widget-node action ${draggable ? "dndnode" : ""}`}
                draggable={draggable}
                ref={ref}
                onClick={ev => {
                    createNewNode(ev);
                }}
                onDragStart={draggable ? onDragStart : null}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title={widget?.name}>
                <div className="widget-title">
                    <div className="display-name">{dtDisplatyName}{dtDisplayNameTip}</div>
                    <div className='class_name'>
                        Type: {dtWidgetName}{dtWidgetNameTip}
                    </div>
                    <div className='extension'>
                        {extension ? (
                            <span className="extension-name">From <a target="_blank" onClick={ev => {
                                ev.stopPropagation();
                            }} style={{ color: "var(--primaryColor)" }} href={extension.reference}>{extension.title}</a></span>
                        ) : <span>From ComfyUI</span>
                        }
                    </div>
                </div>
                {isHovered && (
                    <div onClick={(ev) => {
                        ev.stopPropagation();
                        togglePin();
                    }} className="pin-button" style={{ float: 'right' }}>
                        {isPinned ? <PinFilledIcon /> : <PinIcon />}
                    </div>
                )}
            </div>
        </Popover>
    )
}

