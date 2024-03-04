import { getBackendUrl, getComfyUIBackendUrl } from '../config'
import { Widget, type NodeId, type PropertyKey, type WidgetKey } from '../comfui-interfaces'

export interface Node {
  class_type: WidgetKey
  inputs: Record<PropertyKey, any>
}

export interface Queue {
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

export async function getExtensionInfos(doUpdateCheck = false): Promise<any> {
  let ret;
  try {
    const rest = await fetch(getBackendUrl(doUpdateCheck ? '/api/extension_infos?update_check=true' : '/api/extension_infos'));
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

  const specialWidgets = {
    Note: {
      "name": "Note",
      "display_name": "Note",
      "description": "Note",
      "input": {
        "required": {
          "text": [
            "STRING",
            {
              "multiline": true
            }
          ]
        }
      },
      "output": [],
      "category": "utils",
    },
    Group: {
      "name": "Group",
      "display_name": "Group",
      "description": "Group",
      "input": {
        "required": {}
      },
      "output": [],
      "category": "utils"
    },
    Primitive_STRING: createPrimitiveWidget("STRING"),
    Primitive_BOOLEAN: createPrimitiveWidget("BOOLEAN"),
    Primitive_INT: createPrimitiveWidget("INT"),
    Primitive_FLOAT: createPrimitiveWidget("FLOAT"),
    // Reroute: {
    //   "name": "Reroute",
    //   "input": {
    //     "required": {}
    //   },
    //   "output": [],
    //   "display_name": "Reroute",
    //   "description": "Reroute",
    //   "category": "utils",
    // }
  }

  return {
    ...specialWidgets,
    ...ret
  };

  function createPrimitiveWidget(type: string) {
    return {
      "name": `Primitive_${type}`,
      "input": {
        "required": {}
      },
      "output": [
        type
      ],
      "display_name": `Primitive ${type}`,
      "description": `Primitive type of ${type}`,
      "category": "utils",
    }
  }
}

export async function getQueueApi(): Promise<Queue> {
  return await fetch(getComfyUIBackendUrl('/queue')).then(async (r) => await r.json())
}

export function getUploadImageUrl(): string {
  return getComfyUIBackendUrl('/upload/image')
}

export function getModelImagePreviewUrl(type: 'lora' | 'checkpoints', name: string): string {
  switch (type) {
    case 'lora':
      return getBackendUrl(`/static/models/loras/${name}`)
    case 'checkpoints':
      return getBackendUrl(`/static/models/checkpoints/${name}`)
    default:
      return ''
  }
}

export function getImagePreviewUrl(name: string, type = "input", subfolder = ""): string {
  const parsedName = name.split("/");
  if (parsedName.length > 1 && subfolder === "") {
    return getComfyUIBackendUrl(`/view?filename=${encodeURIComponent(parsedName[1])}&type=${type}&subfolder=${parsedName[0]}`)
  }
  return getComfyUIBackendUrl(`/view?filename=${encodeURIComponent(name)}&type=${type}&subfolder=${subfolder}`)
}

export async function deleteFromQueue(id: number): Promise<void> {
  await fetch(getComfyUIBackendUrl('/queue'), {
    method: 'POST',
    body: JSON.stringify({ delete: [id] }),
  })
}

export async function clearQueue(): Promise<void> {
  await fetch(getComfyUIBackendUrl('/queue'), {
    method: 'POST',
    body: JSON.stringify({ clear: true }),
  })
}

export async function interruptQueue(): Promise<void> {
  await fetch(getComfyUIBackendUrl('/interrupt'), {
    method: 'POST'
  })
}

export async function getHistory(): Promise<History> {
  return await fetch(getComfyUIBackendUrl('/history')).then(async (r) => await r.json())
}


