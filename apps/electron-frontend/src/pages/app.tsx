import WorkflowEditor from '@/components/workflow-editor/workflow-editor'
import * as React from 'react'
import { ReactFlowProvider } from 'reactflow'

export default function WorkflowEditorEntry() {
  return (
    <div className="workflow-entry">
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
    </div>
  )
}
