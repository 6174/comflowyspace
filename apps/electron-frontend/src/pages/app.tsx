import { PanelsContainer } from '@/components/panel/panel-container';
import WorkflowEditor from '@/components/workflow-editor/workflow-editor'
import { track } from '@/lib/tracker';
import { remoteLog } from '@comflowy/common/utils/remote-log';
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
      remoteLog({
        type: "start app ",
        message: "test 2"
      });
    }
  }, []);
  if (!visible) {
    return null
  }
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  )
}