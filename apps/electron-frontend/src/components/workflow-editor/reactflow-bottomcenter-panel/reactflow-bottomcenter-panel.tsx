import { Space, message } from "antd";
import IconDown from "ui/icons/icon-down";
import styles from "./reactflow-bottomcenter-panel.style.module.scss";
import { WidgetPopover } from "./widget-tree/widget-tree-popover";
import { useAppStore } from "@comflowy/common/store";
import { memo } from "react";

function ReactflowBottomCenterPanel() {
    const selectionMode = useAppStore(st => st.slectionMode);
    const onChangeSelectMode = useAppStore(st => st.onChangeSelectMode);
    const onSubmit = useAppStore(st => st.onSubmit);
    return (
        <div className={styles.bottomCenterPanel}>
             <Space>
                <div className={`action action-select ${selectionMode === "figma" && "active"}`} onClick={ev => {
                    onChangeSelectMode(selectionMode === "figma" ? "default" : "figma");
                }}>
                    Select
                </div>
                <div className="action action-node-picker">
                    <WidgetPopover>
                        <Space>
                            <span>Nodes</span>
                            <span className="icon">
                                <IconDown/>
                            </span>
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="action action-add-text">
                    Text
                </div>
                <div className="action action-add-group">
                    Group
                </div>
                <div className="spliter"></div>
                <div className="action action-Run" onClick={async ev => {
                    const ret = await onSubmit();
                    if (ret.error) {
                        message.error(ret.error, 3)
                    } else {
                        message.info("Add task to queue");
                    }
                }}>
                    Run
                </div>
            </Space>
        </div>
    )
}

 export default memo(ReactflowBottomCenterPanel)