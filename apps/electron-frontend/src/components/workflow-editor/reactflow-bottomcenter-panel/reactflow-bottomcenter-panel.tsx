import { Space, message } from "antd";
import IconDown from "ui/icons/icon-down";
import styles from "./reactflow-bottomcenter-panel.style.module.scss";
import { WidgetPopover } from "./widget-tree/widget-tree-popover";
import { useAppStore } from "@comflowy/common/store";
import { memo } from "react";
import { PlusIcon, SelectionIcon, StartIcon } from "ui/icons";
import { ImageIcon, ModelIcon, PromptIcon, SamplerIcon, VaeIcon, WIDGET_ICONS, getWidgetIcon } from "../reactflow-node/reactflow-node-icons";

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
                    <SelectionIcon/>
                </div>
                <div className="action action-node-picker">
                    <WidgetPopover>
                        <Space>
                            <PlusIcon/>
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="spliter"></div>
                <div className="action action-add-model">
                    {ModelIcon}
                </div>
                <div className="action action-add-prompt">
                    {PromptIcon}
                </div>
                <div className="action action-add-model">
                    {SamplerIcon}
                </div>
                <div className="action action-add-prompt">
                    {ImageIcon}
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
                    <StartIcon/>
                </div>
            </Space>
        </div>
    )
}

 export default memo(ReactflowBottomCenterPanel)