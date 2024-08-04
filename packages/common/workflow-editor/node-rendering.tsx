import { NodeProps, type Node } from 'reactflow';
import { Input, SDNODE_DEFAULT_COLOR, SDNode, ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput,ContrlAfterGeneratedValuesOptions, Widget, SubflowNodeWithControl, WorkflowNodeRenderInfo, SubflowNodeRenderingInfo, NODE_REROUTE, NODE_GET, NODE_SET } from '../types';
import { useEffect, useState } from 'react';
import { useSubflowStore } from '../store/subflow-state';
import { useAppStore } from '../store';
import {dt} from '../i18n';
/**
 * Get the info needed for render a node
 * @param node 
 * @returns
 */
export function getNodeRenderInfo(node: SDNode, widget: Widget): WorkflowNodeRenderInfo {
  if (Widget.isPrimitive(widget.name)) {
    return getPrimitiveNodeRenderingInfo(node, widget);
  }

  let params: { property: string, input: Input }[] = []
  let inputs = node.inputs || [];
  let outputs = node.outputs || [];
  let enabled = node.enabled || false;

  if (node.parent) {
    const parent = useAppStore.getState().graph[node.parent];
    if (parent && parent.enabled) {
      enabled = true;
    }
  }

  const inputKeys = inputs.map(input => input.name);

  if (widget.name === NODE_REROUTE) {
    outputs = [{ name: "*", type: "*", links: [], slot_index: 0 }];
    inputs = [{ name: "value", type: "*" }];
  }

  if (widget.name === NODE_GET) {
    outputs = [{ name: "value", type: "*", links: [], slot_index: 0 }];
    inputs = [];
  }

  if (widget.name === NODE_SET) {
    outputs = [{ name: "value", type: "*", links: [], slot_index: 0 }];
    inputs = [{name: "value", type: "*"}];
  }

  if ((widget?.input?.required?.image?.[1] as any)?.image_upload === true) {
    widget.input.required.upload = ["IMAGEUPLOAD", {type: "image"}];
  }

  if (widget?.input?.required?.video && Input.isList(widget?.input?.required?.video)) {
    widget.input.required.upload = ["IMAGEUPLOAD", { type: "video" }];
  }

  for (const [property, input] of Object.entries(widget?.input?.required || {})) {
    if (!inputKeys.includes(property)) {
      params.push({ property, input })
    }
    if (widget.name === "VHS_VideoCombine" && property === "format") {
      const rawOptions = input[0] as any;
      const value = node.fields[property];
      const rawOption = rawOptions.find((it: any) => {
        if (typeof it == "object") {
          return it[0] === value
        }
      })
      if (rawOption) {
        const dynamicParams = rawOption[1]
        if (dynamicParams.length > 0) {
          dynamicParams.forEach((param: any[]) => {
            const fieldName = param[0];
            const fieldInput = param.slice(1);
            params.push({ property: fieldName, input: fieldInput as any as Input })
          })
        }
      }
    }
  }
  
  if (widget && widget?.input?.optional) {
    for (const [property, input] of Object.entries(widget.input.optional)) {
      if (!inputKeys.includes(property)) {
        if (!Input.isParameterOrList(input)) {
          inputKeys.push(property);
        } else {  
          params.push({ property, input })
        }
      }
    }
  }

  const outputNames = widget.output_name;
  if (outputNames && outputNames.length === outputs.length) {
    outputs.forEach((output, index) => {
      output.name = outputNames[index];
    });
  }

  // If it is a primitive node , add according primitive type params
  if (Widget.isStaticPrimitive(widget?.name)) {
    const paramType = node.outputs[0].type;
    const extraInfo: any = {};
    if (paramType === "STRING") {
      extraInfo.multiline = true;
    } else if (paramType === "BOOLEAN") {
      extraInfo.default = true;
    }
    params.push({
      property: paramType,
      input: [paramType as any, extraInfo]
    })
  }

  // if it has a seed, add seed control_after_generated param
  const seedFieldName = Widget.findSeedFieldName(widget, inputs.map(i => i.name));
  if (seedFieldName) {
    const index = params.findIndex(param => param.property === seedFieldName);
    params.splice(index + 1, 0, {
      property: "control_after_generated",
      input: [ContrlAfterGeneratedValuesOptions, {
        default: ""
      }]
    });
  }

  // params 进行排序，如果是 imageUpload 或者 videoUpload, 把这个项放到最后
  const sorted_params = params.sort((a, b) => {
    function paramsIsUpload(param: { property: string, input: Input }) {
      const name = param.property;
      const input = param.input;
      const isImageUpload = name === "image" && (input[1] as any)?.image_upload;
      const isVideoUpload = name === "video" && Input.isList(input);
      const isAudioUpload = name === "audio" && Input.isList(input);
      return isImageUpload || isVideoUpload || isAudioUpload
    }
    const aIsUpload = paramsIsUpload(a);
    const bIsUpload = paramsIsUpload(b);
    if (aIsUpload && !bIsUpload) {
      return 1; // a 是 upload，b 不是，a 排在 b 后面
    } else if (!aIsUpload && bIsUpload) {
      return -1; // a 不是 upload，b 是，a 排在 b 前面
    }
    return 0; //
  });


  let nodeColor = node.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  const title = node.title || dt(`Nodes.${widget?.name}.title`, widget?.display_name);
  return {
    title: `${title}${enabled ? " (Disabled)" : ""}`,
    widget,
    inputs,
    params: sorted_params,
    outputs,
    nodeColor,
    nodeBgColor,
    enabled
  }
}

/**
 * Primitive reference to another node
 * @param node 
 */
export function getPrimitiveNodeRenderingInfo(node: SDNode, widget: Widget): WorkflowNodeRenderInfo {
  const st = useAppStore.getState();
  const edge = st.edges.find(edge => edge.source === node.id);
  const nodeColor = node.color || SDNODE_DEFAULT_COLOR.color;
  const nodeBgColor = node.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;
  const title = node.title || widget?.name;
  let enabled = node.enabled || false;

  if (node.parent) {
    const parent = useAppStore.getState().graph[node.parent];
    if (parent && parent.widget === NODE_REROUTE) {
      enabled = parent.enabled || enabled;
    }
  }

  if (!edge) {
    return {
      title,
      widget,
      inputs: [],
      outputs: [{
        type: "*",
        name: "Connect to widget input",
        links: [],
        slot_index: 0
      }],
      params: [],
      nodeBgColor,
      nodeColor,
      enabled
    }
  }

  const targetNode = st.graph[edge.target];
  const targetHandle = edge.targetHandle;
  const targetWidget = st.widgets[targetNode.widget];

  const inputs = [...Object.entries(targetWidget?.input?.required || {}), ...Object.entries(targetWidget?.input?.optional || {})]

  const refParams = [];
  for (const input of inputs) {
    if (input[0].toUpperCase() === targetHandle) {
      refParams.push({
        property: input[0],
        input: input[1]
      })

      // if it has a seed, add seed control_after_generated param
      if (input[0] === "seed" || input[0] === "noise_seed") {
        refParams.push({
          property: "control_after_generated",
          input: [ContrlAfterGeneratedValuesOptions, {
            default: ""
          }]
        });
      }
    }
  }

  const input = refParams[0]?.input as Input;
  let typeName = "*";
  let name = "Connect to widget input";
  if (input) {
    typeName = Input.getTypeName(input);
    name = typeName;
  }

  return {
    title: `${title}${enabled ? " (Disabled)" : ""}`,
    widget,
    inputs: [],
    outputs: [{
      type: typeName,
      name,
      links: [],
      slot_index: 0
    }],
    params: refParams as any,
    nodeBgColor,
    nodeColor,
    enabled
  }
}

export function useSubflowNodeRenderingInfo(node: NodeProps<{
  value: SDNode;
}>): SubflowNodeRenderingInfo | undefined {
  const sdSubflowNode = node.data.value;
  const nodeId = node.id;
  const { flowId } = sdSubflowNode;

  const workflow = useSubflowStore(st => st.mapping[flowId!]);
  const loadSubWorkfow = useSubflowStore(st => st.loadSubWorkfow);
  const [nodeTitle, setNodeTitle] = useState("Subflow");
  const [nodesWithControl, setNodesWithControl] = useState<SubflowNodeWithControl[]>();
  const subflowRenderingInfo = useSubflowStore(st => st.workflowStates[flowId!]?.renderingInfo);

  useEffect(() => {
    if (!workflow && flowId) {
      loadSubWorkfow(flowId)
    }
  }, [flowId, workflow])

  return subflowRenderingInfo
}