import { getBackendUrl, getComfyUIBackendUrl } from '../config'
import { Input, type NodeId, type PropertyKey, type Widget, type WidgetKey } from '../comfui-interfaces'
import { PersistedWorkflowDocument, PersistedWorkflowNode } from '../local-storage'

interface PromptRequest {
  client_id?: string
  prompt: Record<NodeId, Node>
  extra_data?: ExtraData
}

interface ExtraData {
  extra_pnginfo?: Record<string, any>
}

interface PromptResponse {
  error?: string
}

interface Node {
  class_type: WidgetKey
  inputs: Record<PropertyKey, any>
}

interface Queue {
  queue_running: QueueItem[]
  queue_pending: QueueItem[]
}

type QueueItem = [number, number, Record<NodeId, Node>, { client_id?: string }]

type History = Record<string, HistoryItem>

interface HistoryItem {
  prompt: QueueItem
  outputs: Record<NodeId, Record<PropertyKey, any>>
}

export async function getComfyUIEnvRequirements(): Promise<any> {
  let ret;
  try {
    const rest = await fetch(getBackendUrl('/api/env_check'));
    ret = await rest.json();
  } catch (err) {
    console.log(err);
    throw err;
  }
  return ret;
}

export async function getExtensionInfos(): Promise<any> {
  let ret;
  try {
    const rest = await fetch(getBackendUrl('/api/extension_infos'));
    ret = await rest.json();
  } catch (err) {
    console.log(err);
    throw err;
  }
  return ret;
}

export async function getModelInfos(): Promise<any> {
  let ret;
  try {
    const rest = await fetch(getBackendUrl('/api/model_infos'));
    ret = await rest.json();
  } catch (err) {
    console.log(err);
    throw err;
  }
  return ret;
}


export async function getWidgetLibrary(): Promise<Record<string, Widget>> {
  let ret;
  try {
    const rest = await fetch(getComfyUIBackendUrl('/object_info'));
    ret = await rest.json();
  } catch (err) {
    console.log(err);
    throw err;
  }
  return ret;
}

export async function getQueue(): Promise<Queue> {
  return await fetch(getComfyUIBackendUrl('/queue')).then(async (r) => await r.json())
}

export function getUploadImageUrl(): string {
  return getComfyUIBackendUrl('/upload/image')
}

export function getImagePreviewUrl(name: string, type = "input", subfolder = ""): string {
  return getComfyUIBackendUrl(`/view?filename=${encodeURIComponent(name)}&type=${type}&subfolder=${subfolder}`)
}

export async function deleteFromQueue(id: number): Promise<void> {
  await fetch(getComfyUIBackendUrl('/queue'), {
    method: 'POST',
    body: JSON.stringify({ delete: [id] }),
  })
}

export async function getHistory(): Promise<History> {
  return await fetch(getComfyUIBackendUrl('/history')).then(async (r) => await r.json())
}

export async function sendPrompt(prompt: PromptRequest): Promise<PromptResponse> {
  const resp = await fetch(getComfyUIBackendUrl('/prompt'), {
    method: 'POST',
    body: JSON.stringify(prompt),
  })
  const error = resp.status !== 200 ? await resp.text() : undefined
  return { error }
}

export function createPrompt(workflow: PersistedWorkflowDocument, widgets: Record<string, Widget>, clientId?: string): PromptRequest {
  const prompt: Record<NodeId, Node> = {}
  const data: Record<NodeId, PersistedWorkflowNode> = {}

  for (const [id, node] of Object.entries(workflow.nodes)) {
    const fields = { ...node.value.fields }
    // const params = [];
    // const inputs = node.value.inputs;
    // const inputKeys = inputs.map((input) => input.name);

    for (const [property, value] of Object.entries(fields)) {
      const input = widgets[node.value.widget].input.required[property]
      if (Input.isInt(input) && value === -1) {
        fields[property] = Math.trunc(Math.random() * input[1].max!)
      }
    }

    data[id] = {
      id,
      position: node.position,
      value: { ...node.value, fields },
    }
    prompt[id] = {
      class_type: node.value.widget,
      inputs: fields,
    }
  }

  for (const edge of workflow.connections) {
    const source = workflow.nodes[edge.source!]
    if (source === undefined) {
      continue
    }
    const outputIndex = widgets[source.value.widget].output.findIndex((f) => f === edge.sourceHandle)
    if (prompt[edge.target!] !== undefined) {
      prompt[edge.target!].inputs[edge.targetHandle!.toLocaleLowerCase()] = [edge.source, outputIndex]
    }
  }

  return {
    prompt,
    client_id: clientId,
    extra_data: { extra_pnginfo: { workflow: { connections: workflow.connections, data } } },
  }
}
