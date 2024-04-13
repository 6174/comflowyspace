import { useAppStore } from "@comflowy/common/store";
import { getWorkflowTemplate } from "@comflowy/common/templates/templates";
import { Modal, Popconfirm } from "antd";
import { useCallback } from "react";
import { KEYS, t } from "@comflowy/common/i18n";

export default function ResetDefault() {
  const onResetFromPersistedWorkflow = useAppStore(st => st.onResetFromPersistedWorkflow);
  const persistedWorkflow = useAppStore(st => st.persistedWorkflow);
  const resetWorkflowEvent = useAppStore(st => st.resetWorkflowEvent);
  const [modal, contextHolder] = Modal.useModal();
  const resetDefault = useCallback(() => {
    modal.confirm({
      title: 'Reset workflow',
      content: 'Are you sure to reset workflow to default?',
      onOk: async () => {
        onResetFromPersistedWorkflow(
          {
            ...getWorkflowTemplate("default"),
            id: persistedWorkflow.id,
            title: persistedWorkflow.title
          }
        )
        resetWorkflowEvent.emit(null)
      },
      onCancel() { },
    });
  }, [onResetFromPersistedWorkflow, persistedWorkflow]);

  return (
    <div>
      {contextHolder}
      <span onClick={resetDefault}>{t(KEYS.resetViaDefault)}</span>
    </div>
  )
}