import { getBackendUrl, getComfyUIBackendUrl } from '../config'
import { Input, Widget, type NodeId, type PropertyKey, type WidgetKey } from '../comfui-interfaces'
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode } from '../storage'
import { ComfyUIError, ComfyUIExecuteError } from '../comfui-interfaces/comfy-error-types'

interface PromptRequest {
  client_id?: string
  prompt: Record<NodeId, Node>
  extra_data?: ExtraData
}

interface ExtraData {
  extra_pnginfo?: Record<string, any>
}

export interface PromptResponse {
  error: ComfyUIExecuteError;
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

  const specialWidgets = {
    Note: {
      "name": "Note",
      "display_name": "Note",
      "description": "Note",
      "input": { "required": {
        "text": [
          "STRING",
          {
            "multiline": true
          }
        ]
      } },
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

export function getImagePreviewUrl(name: string, type = "input", subfolder = ""): string {
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

export async function sendPrompt(prompt: PromptRequest): Promise<PromptResponse> {
  try {
    const resp = await fetch(getComfyUIBackendUrl('/prompt'), {
      method: 'POST',
      body: JSON.stringify(prompt),
    })
    if (resp.status === 500) {
      throw new Error(await resp.text());
    }
    const error = resp.status !== 200 ? await resp.json() : undefined
    return { error }
  } catch(err: any) {
    return { 
      error: { 
        error : {
          type: "server error",
          message: err.message,
        },
        node_errors: {}
      },
    }
  }
}

export function createPrompt(workflow: PersistedWorkflowDocument, widgets: Record<string, Widget>, clientId?: string): PromptRequest {
  const prompt: Record<NodeId, Node> = {}
  const data: Record<NodeId, PersistedWorkflowNode> = {}

  for (const [id, node] of Object.entries(workflow.nodes)) {
    const widget = widgets[node.value.widget];
    if (!widget || widget.name === "Note" || widget.name === "Group") {
      continue
    }

    const fields = { ...node.value.fields }
    // const params = [];
    // const inputs = node.value.inputs;
    // const inputKeys = inputs.map((input) => input.name);

    for (const [property, value] of Object.entries(fields)) {
      const input = widgets[node.value.widget].input.required[property]
      if (input && Input.isInt(input) && value === -1) {
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
    const target = prompt[edge.target!]
    if (target) {
      const value = findEdgeSourceValue(edge);
      if (value) {
        target.inputs[edge.targetHandle!.toLocaleLowerCase()] = value;
      }
    }
  }

  return {
    prompt,
    client_id: clientId,
    extra_data: { extra_pnginfo: { workflow: { connections: workflow.connections, data } } },
  }
  
  function findEdgeSourceValue(edge: PersistedWorkflowConnection) {
    const target = workflow.nodes[edge.target!]
    if (!target) {
      return undefined
    }
    const inputKeys = (target.value.inputs || []).map((input) => input.name.toUpperCase());
    // This is for some case the edge exist ,but port connection is not exist
    if (!inputKeys.includes(edge.targetHandle!)) {
      return undefined;
    }

    const source = workflow.nodes[edge.source!]
    if (source === undefined) {
      return undefined
    }

    const sourceWidget = widgets[source.value.widget]; 
    let value;
    // source
    if (sourceWidget) {
      const outputIndex = sourceWidget.output.findIndex((f) => f === edge.sourceHandle)
      value = [edge.source, outputIndex];
    } else {
      // special widget such as primitiveNode & reroute node & combo 
      if (Widget.isPrimitive(source.value.widget)) {
        value = source.value.fields[source.value.outputs[0].name];
      }
      if (source.value.widget === "Reroute") {
        value = findRerouteNodeInputValue(source);
      }
    }
    return value;
  }

  function findRerouteNodeInputValue(source: PersistedWorkflowNode): any {
    const inputLinkId = source.value.inputs[0].link + "";
    const edge = workflow.connections.find((connection) => connection.id === inputLinkId);
    if (edge) {
      return findEdgeSourceValue(edge);
    }
  }

}



