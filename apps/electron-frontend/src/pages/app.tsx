import WorkflowEditor from '@/components/workflow-editor/workflow-editor'
import { track } from '@/lib/tracker';
import * as React from 'react'
import { ReactFlowProvider } from 'reactflow'
export default function WorkflowEditorEntry() {
  React.useEffect(() => {
    track('open-workflow-editor');  
  }, [])
  return (
    <div className="workflow-entry">
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
    </div>
  )
}
