import { Space, message } from "antd";
import styles from "./reactflow-bottomcenter-panel.style.module.scss";
import { WidgetPopover } from "./widget-tree/widget-tree-popover";
import { useAppStore } from "@comflowy/common/store";
import { memo } from "react";
import { ExtensionIcon, PlusIcon, SelectionIcon, StartIcon } from "ui/icons";
import { ImageIcon, ModelIcon, PromptIcon, SamplerIcon, VaeIcon, WIDGET_ICONS, getWidgetIcon } from "../reactflow-node/reactflow-node-icons";
import { Widget } from "@comflowy/common/comfui-interfaces";
import { ExtensionListPopover } from "@/lib/extensions/extensions-list-popover";
import { track } from "@/lib/tracker";

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
                    <WidgetPopover showCategory>
                        <Space>
                            <PlusIcon/>
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="spliter"></div>
                <div className="action action-add-model">
                    <WidgetPopover showCategory={false} filter={(widget: Widget) => {
                        const name = (widget.category + " " + widget.name + " " + widget.display_name).toLowerCase();
                        if (name.indexOf("checkpoint") >= 0 || name.indexOf("model") >= 0) {
                            return true;
                        }
                        return false;
                    }}>
                        <Space>
                            {ModelIcon}
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="action action-add-prompt">
                    <WidgetPopover showCategory={false} filter={(widget: Widget) => {
                        const name = (widget.category + " " + widget.name + " " + widget.display_name).toLowerCase();
                        if (name.indexOf("text") >= 0 || name.indexOf("clip") >= 0) {
                            return true;
                        }
                        return false;
                    }}>
                        <Space>
                            {PromptIcon}
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="action action-add-sampler">
                    <WidgetPopover showCategory={false} filter={(widget: Widget) => {
                        const name = (widget.category + " " + widget.name + " " + widget.display_name).toLowerCase();
                        if (name.indexOf("sampler") >= 0) {
                            return true;
                        }
                        return false;
                    }}>
                        <Space>
                            {SamplerIcon}
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="action action-add-image">
                    <WidgetPopover showCategory={false} filter={(widget: Widget) => {
                        const name = (widget.category + " " + widget.name + " " + widget.display_name).toLowerCase();
                        if (name.indexOf("image") >= 0 || name.indexOf("latent") >= 0) {
                            return true;
                        }
                        return false;
                    }}>
                        <Space>
                            {ImageIcon}
                        </Space>
                    </WidgetPopover>
                </div>
                <div className="spliter"></div>
                <ExtensionListPopover>
                    <div className="action action-open-extension">
                        <Space style={{transform: "scale(1.2)"}}>
                            <ExtensionIcon/>
                        </Space>
                    </div>
                </ExtensionListPopover>
                <div className="action action-Run" onClick={async ev => {
                    const ret = await onSubmit();
                    if (ret.error) {
                        message.error(ret.error.error.message + " " + ret.error.error.details , 3)
                    } else {
                        message.info("Add task to queue");
                    }
                    track("comfyui-execute-submit");
                }}>
                    <StartIcon/>
                </div>
            </Space>
        </div>
    )
}

 export default memo(ReactflowBottomCenterPanel)