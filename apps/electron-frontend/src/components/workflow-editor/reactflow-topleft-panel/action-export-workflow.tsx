import { track } from "@/lib/tracker";
import { PersistedWorkflowDocument } from "@comflowy/common/types";
import { exportWorkflowToJSONFile } from "@comflowy/common/comfyui-bridge/export-import";
import { useAppStore } from "@comflowy/common/store";
import { message } from "antd";
import { useCallback } from "react";
import { KEYS, t } from "@comflowy/common/i18n";

export default function ExportWorkflow() {
  const doc = useAppStore(st => st.doc);
  const widgets = useAppStore(st => st.widgets);
  const exportWorkflow = useCallback(async () => {
    const workflowMap = doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    try {
      await exportWorkflowToJSONFile(workflow, widgets);
      // message.success("Workflow exported successfully");
    } catch(err) {
      message.error(t(KEYS.failedToExportWorkflow) + err.message, 5);
    }
    track('export-workflow-to-json');
  }, [doc, widgets])
  return (
    <div>
      <span onClick={exportWorkflow}>{t(KEYS.exportWorkflow)}</span>
    </div>
  )
}