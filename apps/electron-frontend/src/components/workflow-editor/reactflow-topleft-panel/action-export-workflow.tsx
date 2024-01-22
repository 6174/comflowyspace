import { exportWorkflowToJSONFile } from "@comflowy/common/comfyui-bridge/export-import";
import { PersistedWorkflowDocument } from "@comflowy/common/storage";
import { useAppStore } from "@comflowy/common/store";
import { message } from "antd";
import { useCallback } from "react";

export default function ExportWorkflow() {
  const doc = useAppStore(st => st.doc);
  const widgets = useAppStore(st => st.widgets);
  const exportWorkflow = useCallback(async () => {
    const workflowMap = doc.getMap("workflow");
    const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
    try {
      await exportWorkflowToJSONFile(workflow, widgets);
      message.success("Workflow exported successfully");
    } catch(err) {
      message.error("Failed to export workflow:" + err.message, 5);
    }
  }, [doc, widgets])
  return (
    <div>
      <span onClick={exportWorkflow}>Export workflow</span>
    </div>
  )
}