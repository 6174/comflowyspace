import { Popover } from "antd";
import { WidgetTree } from "./widget-tree";

export const WidgetPopover = ({ children }) => {
    return (
        <Popover
            title={null}
            content={<WidgetTree />}
            trigger="click"
            arrow={false}
            align={{offset: [0, -26]}}
            placement="top"
        >
            {children}
        </Popover>
    );
};