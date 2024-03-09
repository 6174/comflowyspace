import { PanelsContainer } from '@/components/panel/panel-container';
import WorkflowEditor from '@/components/workflow-editor/workflow-editor'
import { track } from '@/lib/tracker';
import * as React from 'react'
import { ReactFlowProvider } from 'reactflow'
import { isWindow } from 'ui/utils/is-window';
export default function WorkflowEditorEntry() {
  React.useEffect(() => {
    track('open-workflow-editor');  
  }, [])
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (isWindow) {
      setVisible(true);
    }
  }, []);
  if (!visible) {
    return null
  }
  return (
    <ReactFlowProvider>
      <PanelsContainer panels={[]} isAppPage={true}>
        <WorkflowEditor />
      </PanelsContainer>
    </ReactFlowProvider>
  )
}