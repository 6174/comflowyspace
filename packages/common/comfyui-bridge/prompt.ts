import { getComfyUIBackendUrl } from '../config'
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, ComfyUIExecuteError, Input, Widget, type NodeId, NODE_REROUTE, NODE_PRIMITIVE, NODE_GROUP, SDNode, NODE_SET, NODE_GET, SetNodeInfo, NODE_GET_SELECT_FIELD_NAME } from '../types'
import { persistedWorkflowDocumentToComfyUIWorkflow } from './export-import'
import {Node} from "./bridge";
import { KEYS, t } from "../i18n";
import { uuid } from '../utils'
import _ from 'lodash';
import { getGraphVarPromptValue, isAnywhereWidget, isFieldMatchRegexVar, parseGraphVariables } from '../types/comfy-variables.types';

interface PromptRequest {
  client_id?: string
  prompt: Record<NodeId, Node>
  extra_data?: ExtraData
}

interface ExtraData {
  extra_pnginfo?: Record<string, any>
}


type PromptNodeItem = {
  class_type: string,
  inputs: Record<string, any>
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
      return {
        error: {
          error: {
            type: "server error",
            message: t(KEYS.confyuiNotStarted),
          },
          node_errors: {}
        },
      }
    }
    const error = await resp.json()
    return { error }
  } catch (err: any) {
    return {
      error: {
        error: {
          type: "server error",
          message: t(KEYS.confyuiNotStarted),
        },
        node_errors: {}
      },
    }
  }
}

/**
 * if node has enabled properties, skip the connection and the node
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
  const graph_vars = parseGraphVariables(workflow, widgets)

  // set enabled for group nodes;
  nodes.forEach(([pid, node]) => {
    if (node.value.widget === NODE_GROUP && node.value.enabled) {
      nodes.forEach(([id, node]) => {
        if (node.value.parent === pid) {
          node.value.enabled = true;
        }
      });
    }
  });

  for (const [id, node] of nodes) {
    const widget = widgets[node.value.widget];
    if (
      !widget || 
      Widget.isLocalWidget(widget)
    ) {
      continue
    }

    if (isAnywhereWidget(widget.name)) {
      continue
    }

    if (node.value.enabled) {
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

    if (Widget.isSaveImageNode(widget.name)) {
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

  const setNodes = resolveSetNodesInfo();

  for (const edge of workflow.connections) {
    const target = prompt[edge.target!]
    // target must be exist in prompt nodes
    if (!target) {
      continue
    }
    const value = findEdgeSourceValue(edge);
    if (value) {
      const inputKey = findInputKeyFromHandle(target, edge.targetHandle!);
      target.inputs[inputKey] = value;
    }
  }

  // 如果一些 required 的 input，但是依然没有值，那么尝试通过 graph_vars 来赋值
  for (const [id, node] of Object.entries(prompt)) {
    const widget = widgets[node.class_type];
    const node_title = workflow.nodes[id].value.title || widget.display_name || widget.name;
    const inputs = widget.input.required || {};
    for (const [inputKey, input] of Object.entries(inputs)) {
      if (node.inputs[inputKey] !== undefined) {
        continue
      }
      const input_type = input[0];
      if (typeof input_type == "string") {
        const input_name = inputKey;
        // 在普通的全局变量中查找
        const var_info = graph_vars.global[input_type];
        if (var_info) {
          node.inputs[inputKey] = getGraphVarPromptValue(var_info);
        }
        // 在正则全局变量中查找
        const regex_var = graph_vars.regex[input_type];
        if (regex_var) {
          if (isFieldMatchRegexVar(node_title, input_name, regex_var)) {
            node.inputs[inputKey] = getGraphVarPromptValue(regex_var);
          }
        }
      }
    }
  }

  return {
    prompt,
    client_id: clientId,
    extra_data: { extra_pnginfo: { workflow: persistedWorkflowDocumentToComfyUIWorkflow(workflow, widgets) } },
  }

  /**
   * prepare all set nodes info
   * @returns 
   */
  function resolveSetNodesInfo(): Record<string, SetNodeInfo> {
    const infos: Record<string, SetNodeInfo> = {};
    const connections = workflow.connections;
    connections.forEach((connection) => {
      const target = workflow.nodes[connection.target!];
      const source = workflow.nodes[connection.source!];
      if (target.value.widget === NODE_SET) {
        const key = target.value.fields[NODE_GET_SELECT_FIELD_NAME]
        infos[key] = ({
          id: target.id,
          reference: {
            id: source.id,
            referenceNode: source.value,
            referenceField: connection.sourceHandle!,
            edge: connection
          },
          field: key
        })
      }
    });
    return infos;
  }

  function findInputKeyFromHandle(target: PromptNodeItem, targetHandle: string): string {
    const widget = widgets[target.class_type];
    const inputKeys = [...Object.keys(widget.input?.optional || {}), ...Object.keys(widget.input?.required || {})];
    const inputKey = inputKeys.find((key) => key.toUpperCase() === targetHandle);
    return inputKey ?? targetHandle.toLocaleLowerCase();
  }

  /**
   * find a source value
   * @param source 
   */
  function findGetNodeInputValue(source: PersistedWorkflowNode): any {
    const referenceVarKey = source.value.fields[NODE_GET_SELECT_FIELD_NAME];
    const setNodeInfo = setNodes[referenceVarKey];
    if (setNodeInfo) {
      return findEdgeSourceValue(setNodeInfo.reference.edge as PersistedWorkflowConnection);
    }
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

    if (source.value.widget === NODE_GET) {
      value = findGetNodeInputValue(source);
    }

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

export function reversePrompt(prompt: Record<NodeId, Node>, widgets: Record<string, Widget>): PersistedWorkflowDocument {
 
  const data: Record<NodeId, PersistedWorkflowNode> = {}

  // Reconstruct nodes from prompt
  for (const [id, node] of Object.entries(prompt)) {
    const widget = widgets[node.class_type];
    // Reconstruct fields from inputs
    const fields: any = {};
    for (const [inputKey, inputValue] of Object.entries(node.inputs)) {
      if (Array.isArray(inputValue) && inputValue.length === 2) {
        continue;
      }
      // skip image type
      if (inputValue.length > 300) {
        continue
      }
      fields[inputKey] = inputValue;
    }

    if (!widget) {
      data[id] = {
        id,
        position: { x: 0, y: 0 },
        dimensions: {
          width: 240,
          height: 80
        },
        value: {
          widget: node.class_type,
          fields,
          inputs: [],
          outputs: []
        }
      }
      continue;
    }

    const sdnode = SDNode.fromWidget(widget);
    data[id] = {
      id,
      position: { x: 0, y: 0 },
      dimensions: {
        width: 240,
        height: 80
      },
      value: {
        ...sdnode,
        fields
      },
    }
  }

  // Reconstruct connections from prompt
  const connections: PersistedWorkflowConnection[] = [];
  for (const [id, node] of Object.entries(prompt)) {
    for (const [inputKey, inputValue] of Object.entries(node.inputs)) {
      const source = Array.isArray(inputValue) ? inputValue[0] : undefined;
      const sourceHandle = Array.isArray(inputValue) ? inputValue[1] : undefined;
      if (source && sourceHandle !== undefined) {
        const widget = widgets[data[source].value.widget];
        const output = widget && widgets[data[source].value.widget].output[sourceHandle];
        if (output) {
          connections.push({
            id: uuid(),
            source,
            sourceHandle: output,
            target: id,
            targetHandle: inputKey.toUpperCase(),
          });
        }
      }
    }
  }

  return {
    id: uuid(),
    title: "Untitled",
    nodes: data,
    connections,
  }
}