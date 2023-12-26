import ComfyUIProcessManager from '@/components/comfyui-process-manager/comfyui-process-manager'
import WorkflowEditor from '@/components/workflow-editor/workspace-editor'
import * as React from 'react'
import { ReactFlowProvider } from 'reactflow'

export default function WorkflowEditorEntry() {
  return (
    <div className="workflow-entry">
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
      <ComfyUIProcessManager />
    </div>
  )
}
