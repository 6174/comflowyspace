import { PersistedWorkflowDocument } from '@/local-storage';

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
