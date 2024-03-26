import { NodeProps, type Node } from 'reactflow';
import { Input, SDNODE_DEFAULT_COLOR, SDNode, ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput,ContrlAfterGeneratedValuesOptions, Widget, SubflowNodeWithControl, WorkflowNodeRenderInfo, SubflowNodeRenderingInfo, NODE_REROUTE } from '../types';
import { useEffect, useState } from 'react';
import { useSubflowStore } from '../store/subflow-state';
import { useAppStore } from '../store';

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
  let bypass = node.bypass || false;

  if (node.parent) {
    const parent = useAppStore.getState().graph[node.parent];
    if (parent && parent.bypass) {
      bypass = true;
    }
  }

  const inputKeys = inputs.map(input => input.name);

  if (widget.name === NODE_REROUTE) {
    outputs = [{ name: "*", type: "*", links: [], slot_index: 0 }];
    inputs = [{ name: "value", type: "*" }];
  }

  if ((widget?.input?.required?.image?.[1] as any)?.image_upload === true) {
    widget.input.required.upload = ["IMAGEUPLOAD"];
  }

  for (const [property, input] of Object.entries(widget?.input?.required || {})) {
    if (!inputKeys.includes(property)) {
      params.push({ property, input })
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
  const seedFieldName = Widget.findSeedFieldName(widget);
  if (seedFieldName) {
    const index = params.findIndex(param => param.property === seedFieldName);
    params.splice(index + 1, 0, {
      property: "control_after_generated",
      input: [ContrlAfterGeneratedValuesOptions, {
        default: ""
      }]
    });
  }

  let nodeColor = node.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  console.log("bypass", bypass, node);

  return {
    title: node.title || widget?.name,
    widget,
    inputs,
    params,
    outputs,
    nodeColor,
    nodeBgColor,
    bypass
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
  let bypass = node.bypass || false;

  if (node.parent) {
    const parent = useAppStore.getState().graph[node.parent];
    if (parent && parent.widget === NODE_REROUTE) {
      bypass = parent.bypass || bypass;
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
      bypass
    }
  }

  const targetNode = st.graph[edge.target];
  const targetHandle = edge.targetHandle;
  const targetWidget = st.widgets[targetNode.widget];

  const inputs = [...Object.entries(targetWidget?.input?.required), ...Object.entries(targetWidget?.input?.optional || {})]

  const refParams = [];
  for (const input of inputs) {
    if (input[0].toUpperCase() === targetHandle) {
      refParams.push({
        property: input[0],
        input: input[1]
      })
    }
  }

  const input = refParams[0]?.input;
  let typeName = "*";
  let name = "Connect to widget input";
  if (input) {
    typeName = Input.getTypeName(input);
    name = typeName;
  }


  return {
    title,
    widget,
    inputs: [],
    outputs: [{
      type: typeName,
      name,
      links: [],
      slot_index: 0
    }],
    params: refParams,
    nodeBgColor,
    nodeColor,
    bypass
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