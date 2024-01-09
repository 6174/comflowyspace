import { Popover } from "antd";
import { WidgetTree } from "./widget-tree";

export const WidgetPopover = ({ children }) => {
    return (
        <Popover
            title={null}
            content={<WidgetTree />}
            trigger="click"
            placement="top"
        >
            {children}
        </Popover>
    );
};