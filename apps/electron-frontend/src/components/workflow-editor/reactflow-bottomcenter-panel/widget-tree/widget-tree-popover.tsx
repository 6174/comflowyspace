import React, { useState } from 'react';
import { Popover } from 'antd';
import { WidgetTree } from "./widget-tree";
import { Widget } from "@comflowy/common/comfui-interfaces";

export const WidgetPopover = (props: {
    children: any;
    showCategory: boolean;
    filter?: (widget: Widget) => boolean
}) => {
    const [id, setId] = useState(0);
    const handleVisibleChange = (visible: boolean) => {
        setId(id + 1);
    }

    return (
        <Popover
            title={null}
            content={<WidgetTree draggable autoFocus={true} id={id} filter={props.filter} showCategory={props.showCategory} />}
            trigger="click"
            arrow={false}
            align={{ offset: [0, -26] }}
            placement="top"
            onOpenChange={handleVisibleChange}
        >
            {props.children}
        </Popover>
    );
};