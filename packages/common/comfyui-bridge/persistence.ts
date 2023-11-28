import { PersistedWorkflowDocument } from '@/store/workflow-doc';
import { type Connection, type NodeId, type SDNode } from '../comfui-interfaces'
import defaultWorkflow from '../default/default-workflow';

const GRAPH_KEY = 'graph'

export function retrieveLocalWorkflow(): PersistedWorkflowDocument {
  return defaultWorkflow as any;
  // const item = localStorage.getItem(GRAPH_KEY)
  // return item === null ? defaultWorkflow : JSON.parse(item)
}

export function saveLocalWorkflow(graph: PersistedWorkflowDocument): void {
  localStorage.setItem(GRAPH_KEY, JSON.stringify(graph))
}

export function readWorkflowFromFile(
  ev: React.ChangeEvent<HTMLInputElement>,
  cb: (workflow: PersistedWorkflowDocument) => void
): void {
  const reader = new FileReader()
  if (ev.target.files !== null) {
    reader.readAsText(ev.target.files[0])
    reader.addEventListener('load', (ev) => {
      if (ev.target?.result != null && typeof ev.target.result === 'string') {
        cb(JSON.parse(ev.target.result))
      }
    })
  }
}

export function writeWorkflowToFile(workflow: PersistedWorkflowDocument): void {
  const a = document.createElement('a')
  a.download = 'workflow.json'
  a.href = URL.createObjectURL(new Blob([JSON.stringify(workflow)], { type: 'application/json' }))
  a.click()
}
