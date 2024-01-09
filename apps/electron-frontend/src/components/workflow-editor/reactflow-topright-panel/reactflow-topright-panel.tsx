import { Space, Popover, message } from "antd";
import { GalleryEntry } from "../reactflow-gallery/gallery";
import { QueueEntry } from "../reactflow-queue/reactflow-queue";

export default function ReactflowTopRightPanel() {
    return (
        <div className="topRightPannel">
            <Space>
                <GalleryEntry/>
                <QueueEntry/>
            </Space>
        </div>
    )
}
