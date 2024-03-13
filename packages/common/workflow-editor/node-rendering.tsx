import { NodeProps, type Node } from 'reactflow';
import { Input, SDNODE_DEFAULT_COLOR, SDNode, ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput,ContrlAfterGeneratedValuesOptions, Widget, SDSubFlowNode } from '../types';
import { useEffect, useState } from 'react';
import { useSubWorkflowStore } from '../store/sub-workflows-state';
export type NodeRenderInfo = {
  id: string;
  title: string;
  widget: Widget;
  sdnode: SDNode;
  params: { property: string, input: Input }[];
  inputs: ComfyUIWorkflowNodeInput[];
  outputs: ComfyUIWorkflowNodeOutput[];
  nodeColor: string;
  nodeBgColor: string;
}

/**
 * Get the info needed for render a node
 * @param node 
 * @returns 
 */
export function getNodeRenderInfo(node: NodeProps<{
  widget: Widget;
  value: SDNode;
}>): NodeRenderInfo {
  const { value, widget } = node.data;
  const params: { property: string, input: Input }[] = []
  const nodeId = node.id;
  const inputs = node.data.value.inputs || [];
  const outputs = node.data.value.outputs || [];
  const inputKeys = inputs.map(input => input.name);

  if ((widget?.input?.required?.image?.[1] as any)?.image_upload === true) {
    widget.input.required.upload = ["IMAGEUPLOAD"];
  }

  for (const [property, input] of Object.entries(widget.input.required)) {
    if (!inputKeys.includes(property)) {
      params.push({ property, input })
    }
  }

  if (widget.input.optional) {
    for (const [property, input] of Object.entries(widget.input.optional)) {
      if (!inputKeys.includes(property)) {
        params.push({ property, input })
      }
    }
  }

  // If it is a primitive node , add according primitive type params
  if (Widget.isPrimitive(widget.name)) {
    const paramType = node.data.value.outputs[0].type;
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
  const seedFieldName = Widget.findSeedFieldName(widget);
  if (seedFieldName) {
    const index = params.findIndex(param => param.property === seedFieldName);
    params.splice(index + 1, 0, {
      property: "control_after_generated",
      input: [ContrlAfterGeneratedValuesOptions]
    });
  }

  let nodeColor = node.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  return {
    id: nodeId,
    title: node.data.value.title || widget?.name,
    widget,
    sdnode: value,
    inputs,
    params,
    outputs,
    nodeColor,
    nodeBgColor
  }
}

/**
 * Get the info needed for render a subflow node
 * @param node 
 * @returns 
 */
export type SubFlowRenderingInfo = {
  inputs: ComfyUIWorkflowNodeInput[];
  outputs: ComfyUIWorkflowNodeOutput[];
  params: any[];
  title: string;
  id: string;
}

export function useSubFlowNodeRenderingInfo(node: NodeProps<{
  value: SDSubFlowNode;
}>): SubFlowRenderingInfo {
  const sdSubFlowNode = node.data.value;
  const nodeId = node.id;
  const { flowId, fields, custom_fields, images} = sdSubFlowNode;
  const workflow = useSubWorkflowStore(st => st.mapping[flowId]);
  const onLoadSubWorkfow = useSubWorkflowStore(st => st.onLoadSubWorkfow);
  const [nodeTitle, setNodeTitle] = useState(sdSubFlowNode.title || "SubFlow");
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [params, setParams] = useState([]);

  useEffect(() => {
    if (!workflow && flowId) {
      onLoadSubWorkfow(flowId)
    }
  }, [flowId, workflow])

  return {
    id: nodeId,
    title: nodeTitle,
    inputs,
    outputs,
    params
  }
}