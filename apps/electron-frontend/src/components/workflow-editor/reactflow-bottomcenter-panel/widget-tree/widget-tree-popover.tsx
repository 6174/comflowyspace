import { Popover } from "antd";
import { WidgetTree } from "./widget-tree";
import { Widget } from "@comflowy/common/comfui-interfaces";

export const WidgetPopover = (props: { 
    children: any; 
    showCategory: boolean;  
    filter?: (widget: Widget) => boolean 
}) => {
    return (
        <Popover
            title={null}
            content={<WidgetTree filter={props.filter} showCategory={props.showCategory}/>}
            trigger="click"
            arrow={false}
            align={{offset: [0, -26]}}
            placement="top"
        >
            {props.children}
        </Popover>
    );
};