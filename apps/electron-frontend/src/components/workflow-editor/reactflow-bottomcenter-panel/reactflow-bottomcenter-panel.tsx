import { Space } from "antd";
import IconDown from "ui/icons/icon-down";
import styles from "./reactflow-bottomcenter-panel.style.module.scss";
import { WidgetPopover } from "./widget-tree/widget-tree-popover";

export default function ReactflowBottomCenterPanel() {
    return (
        <div className={styles.bottomCenterPanel}>
             <Space>
                <div className="action action-select">
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
                <div className="action action-Run">
                    Run
                </div>
            </Space>
        </div>
    )
}