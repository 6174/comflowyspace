import { getBackendUrl, getComfyUIBackendUrl } from '../config'
import { Input, Widget, type NodeId, type PropertyKey, type WidgetKey } from '../comfui-interfaces'
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode } from '../storage'
import { ComfyUIError, ComfyUIExecuteError } from '../comfui-interfaces/comfy-error-types'
import { persistedWorkflowDocumentToComfyUIWorkflow } from './export-import'
import {Node} from "./bridge";
import { uuid } from '../utils'

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
  } catch (err: any) {
    return {
      error: {
        error: {
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
    if (!widget || widget.name === "Note" || widget.name === "Group" || Widget.isPrimitive(widget.name) || widget.name === "Reroute") {
      continue
    }

    const fields = { ...node.value.fields }

    for (const [property, value] of Object.entries(fields)) {
      const input = widgets[node.value.widget].input.required[property]
      if (input && Input.isInt(input) && value === -1) {
        fields[property] = Math.trunc(Math.random() * input[1].max!)
      }
    }

    if (widget.name === "SaveImage") {
      const filename_prefix = fields.filename_prefix || "";
      fields.filename_prefix = `${filename_prefix}_${uuid().substring(0, 4)}`;
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
    extra_data: { extra_pnginfo: { workflow: persistedWorkflowDocumentToComfyUIWorkflow(workflow, widgets) } },
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

    let value;
    // source
    const outputs = source.value.outputs || [];
    const outputIndex = outputs.findIndex((output) => output.name.toUpperCase() === edge.sourceHandle);
    value = [edge.source, outputIndex];
    // special widget such as primitiveNode & reroute node & combo 
    if (Widget.isPrimitive(source.value.widget)) {
      value = source.value.fields[source.value.outputs[0].name];
    }
    if (source.value.widget === "Reroute") {
      value = findRerouteNodeInputValue(source);
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

