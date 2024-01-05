import { PersistedWorkflowDocument } from "@comflowy/common/storage";
import { useAppStore } from "@comflowy/common/store";
import { getWorkflowTemplate } from "@comflowy/common/templates/templates";
import { Popconfirm, Space } from "antd";
import { useCallback } from "react";
import IconDown from "ui/icons/icon-down";
import { GalleryEntry } from "../reactflow-gallery/gallery";
import { QueueEntry } from "../reactflow-queue/reactflow-queue";
import { ImportWorkflow } from "./import";

export default function ReactflowTopRightPanel() {
    const onResetFromPersistedWorkflow = useAppStore(st => st.onResetFromPersistedWorkflow);
    const persistedWorkflow = useAppStore(st => st.persistedWorkflow);
    const resetWorkflowEvent = useAppStore(st => st.resetWorkflowEvent);
    const resetDefault = useCallback(() => {
        onResetFromPersistedWorkflow(
            {
                ...getWorkflowTemplate("default"),
                id: persistedWorkflow.id,
                title: persistedWorkflow.title
            }
        )
        resetWorkflowEvent.emit(null)
    }, [onResetFromPersistedWorkflow, persistedWorkflow]);

    return (
        <div className="topRightPannel">
            <Space>
                <ImportWorkflow/>
                <Popconfirm
                    title="Reset workflow"
                    description="Are you sure to reset workflow to default?"
                    onConfirm={resetDefault}
                    onCancel={() => null}
                    okText="Yes"
                    cancelText="No"
                >
                    <div className="action action-reset">
                        Reset workflow
                    </div>
                </Popconfirm>
                <GalleryEntry/>
                <QueueEntry/>
            </Space>
        </div>
    )
}