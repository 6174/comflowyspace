import { useAppStore } from "@comflowy/common/store";
import { getWorkflowTemplate } from "@comflowy/common/templates/templates";
import { Popconfirm } from "antd";
import { useCallback } from "react";

export default function ResetDefault() {
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
    <div>
      <Popconfirm
        title="Reset workflow"
        description="Are you sure to reset workflow to default?"
        onConfirm={resetDefault}
        onCancel={() => null}
        placement="right"
        okText="Yes"
        cancelText="No"
      >
        Reset via default
      </Popconfirm>
    </div>
  )
}