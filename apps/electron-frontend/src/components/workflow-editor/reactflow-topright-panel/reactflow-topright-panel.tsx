import { Space, Popover, message } from "antd";
import { GalleryEntry } from "../reactflow-gallery/gallery";
import { QueueEntry } from "../reactflow-queue/reactflow-queue";
import { RefreshPageButton } from "../reactflow-topleft-panel/reactflow-topleft-panel";

export default function ReactflowTopRightPanel() {
    return (
        <div className="topRightPannel">
            <Space>
                <GalleryEntry/>
                <QueueEntry/>
                <div className="spliter"></div>
                <RefreshPageButton/>
            </Space>
        </div>
    )
}
