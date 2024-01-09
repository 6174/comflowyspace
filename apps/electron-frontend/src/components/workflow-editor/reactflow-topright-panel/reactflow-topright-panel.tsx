import { Space, Popover, message } from "antd";
import { GalleryEntry } from "../reactflow-gallery/gallery";
import { QueueEntry } from "../reactflow-queue/reactflow-queue";
import { ReloadIcon } from "ui/icons";
import { useCallback, useState } from "react";
import { useAppStore } from "@comflowy/common/store";

export default function ReactflowTopRightPanel() {
    return (
        <div className="topRightPannel">
            <Space>
                <GalleryEntry/>
                <QueueEntry/>
                <div className="spliter"></div>
                <RefreshPageButton />
            </Space>
        </div>
    )
}

let triggered = false;
function RefreshPageButton() {
    const [visible, setVisible] = useState(false);
    const handleVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };
    const onInit = useAppStore(st => st.onInit);
    const triggerSyncup = useCallback(async () => {
        if (triggered) {
            return;
        }
        triggered = true;
        await onInit();
        message.success("Syncuped");
        triggered = false;
    }, []);
    return (
        <Popover 
            open={visible} 
            onOpenChange={handleVisibleChange} 
            title={null}
            content={<div style={{fontSize: 12}}>Click to sync ComfyUI states</div>} 
            trigger={"hover"} 
            placement="bottom"> 
            <div className="action action-refresh" onClick={triggerSyncup}>
                <ReloadIcon />
            </div>
        </Popover>
    )
}