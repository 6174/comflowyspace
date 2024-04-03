import { getComfyUIBackendUrl } from '../config'
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, ComfyUIExecuteError, Input, Widget, type NodeId, NODE_REROUTE, NODE_PRIMITIVE, NODE_GROUP } from '../types'
import { persistedWorkflowDocumentToComfyUIWorkflow } from './export-import'
import {Node} from "./bridge";
import { KEYS, t } from "../i18n";
import { uuid } from '../utils'
import _ from 'lodash';

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
    if (resp.status >= 500) {
      throw new Error(t(KEYS.confyuiNotStarted));
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

/**
 * if node has bypass properties, skip the connection and the node
 * @param workflow 
 * @param widgets 
 * @param clientId 
 * @returns 
 */
export function createPrompt(workflowSource: PersistedWorkflowDocument, widgets: Record<string, Widget>, clientId?: string): PromptRequest {
  const workflow = _.cloneDeep(workflowSource);
  const prompt: Record<NodeId, Node> = {}
  const data: Record<NodeId, PersistedWorkflowNode> = {}

  const nodes = Object.entries(workflow.nodes)

  // set bypass for group nodes;
  nodes.forEach(([pid, node]) => {
    if (node.value.widget === NODE_GROUP && node.value.bypass) {
      nodes.forEach(([id, node]) => {
        if (node.value.parent === pid) {
          node.value.bypass = true;
        }
      });
    }
  });

  for (const [id, node] of nodes) {
    const widget = widgets[node.value.widget];
    if (!widget || Widget.isPrimitive(widget.name) ||  widget.name === "Note" || widget.name === "Group" || Widget.isStaticPrimitive(widget.name) || widget.name === NODE_REROUTE) {
      continue
    }

    if (node.value.bypass) {
      continue
    }

    // attach default values
    const defaultFields: any = {};
    if (widget.input.optional) {
      for (const [inputKey, input] of [...Object.entries(widget.input.optional), ...Object.entries(widget.input.required)]) {
        const defaultConfig = input[1] as any;
        if (defaultConfig && defaultConfig.default) {
          defaultFields[inputKey] = defaultConfig.default;
        }
      }
    }
    const fields = { ...defaultFields, ...node.value.fields }

    // set random value
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
    // target must be exist in prompt nodes
    if (!target) {
      continue
    }

    const value = findEdgeSourceValue(edge);
    if (value) {
      target.inputs[edge.targetHandle!.toLocaleLowerCase()] = value;
    }
  }

  return {
    prompt,
    client_id: clientId,
    extra_data: { extra_pnginfo: { workflow: persistedWorkflowDocumentToComfyUIWorkflow(workflow, widgets) } },
  }

  function findEdgeSourceValue(edge: PersistedWorkflowConnection) {
    const source = workflow.nodes[edge.source!]

    // edge should be valid
    if (!source) {
      return undefined
    }

    let value;
    // source
    const outputs = source.value.outputs || [];
    const outputIndex = outputs.findIndex((output) => output.name.toUpperCase() === edge.sourceHandle);
    value = [edge.source, outputIndex];
    // special widget such as primitive_string & reroute node & combo 
    if (Widget.isStaticPrimitive(source.value.widget)) {
      value = source.value.fields[source.value.outputs[0].name];
    }

    if (source.value.widget === NODE_REROUTE) {
      value = findRerouteNodeInputValue(source);
    }

    if (source.value.widget === NODE_PRIMITIVE) {
      value = findPrimitiveNodeValue(source);
    }

    return value;
  }

  function findRerouteNodeInputValue(source: PersistedWorkflowNode): any {
    const rerouteId = source.id;
    const edge = workflow.connections.find((connection) => connection.target === rerouteId);
    if (edge) {
      return findEdgeSourceValue(edge);
    }
  }

  /**
   * primitive value is the first field value
   * @param node 
   */
  function findPrimitiveNodeValue(node: PersistedWorkflowNode): any {
    const fieldKeys = Object.keys(node.value.fields).filter(it => it !== "undefined");
    const value = node.value.fields[fieldKeys[0]];
    return value;
  }
}

