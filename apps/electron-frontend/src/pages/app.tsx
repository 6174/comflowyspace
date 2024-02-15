import WorkflowEditor from '@/components/workflow-editor/workflow-editor'
import { useAptabase } from '@aptabase/react';
import * as React from 'react'
import { ReactFlowProvider } from 'reactflow'
export default function WorkflowEditorEntry() {
  const { trackEvent } = useAptabase();
  React.useEffect(() => {
    trackEvent('load-workflow-editor-entry');  
  }, [])
  return (
    <div className="workflow-entry">
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
    </div>
  )
}
