import { type Connection, type NodeId, type SDNode } from '../comfui-interfaces'
import defaultWorkflow from '../default/default-workflow.json';

export interface PersistedNode {
  value: SDNode
  position: { x: number; y: number }
}

export interface PersistedGraph {
  data: Record<NodeId, PersistedNode>
  connections: Connection[]
}

const GRAPH_KEY = 'graph'

export function retrieveLocalWorkflow(): PersistedGraph | null {
  const item = localStorage.getItem(GRAPH_KEY)
  return item === null ? defaultWorkflow : JSON.parse(item)
}

export function saveLocalWorkflow(graph: PersistedGraph): void {
  localStorage.setItem(GRAPH_KEY, JSON.stringify(graph))
}

export function readWorkflowFromFile(
  ev: React.ChangeEvent<HTMLInputElement>,
  cb: (workflow: PersistedGraph) => void
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

export function writeWorkflowToFile(workflow: PersistedGraph): void {
  const a = document.createElement('a')
  a.download = 'workflow.json'
  a.href = URL.createObjectURL(new Blob([JSON.stringify(workflow)], { type: 'application/json' }))
  a.click()
}
