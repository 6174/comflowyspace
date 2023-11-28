import { Space } from "antd";
import IconDown from "ui/icons/icon-down";

export default function ReactflowTopRightPanel() {
    return (
        <div className="topLeftPanel">
            <Space>
                <div className="action action-history">
                    Console
                </div>
                <div className="action action-queue">
                    Queue
                </div>
                <div className="action action-history">
                    History
                </div>
            </Space>
        </div>
    )
}