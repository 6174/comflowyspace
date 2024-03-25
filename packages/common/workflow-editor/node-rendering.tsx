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
  const params: { property: string, input: Input }[] = []
  let inputs = node.inputs || [];
  let outputs = node.outputs || [];
  const inputKeys = inputs.map(input => input.name);

  if (widget.name === NODE_REROUTE) {
    console.log("info", node, widget);
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
        params.push({ property, input })
      }
    }
  }

  // If it is a primitive node , add according primitive type params
  if (Widget.isPrimitive(widget?.name)) {
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
        default: "randomize"
      }]
    });
  }

  let nodeColor = node.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  return {
    title: node.title || widget?.name,
    widget,
    inputs,
    params,
    outputs,
    nodeColor,
    nodeBgColor
  }
}

/**
 * combo node reference to another node
 * @param node 
 */
export function getComboNodeRenderingInfo(node: SDNode): Pick<WorkflowNodeRenderInfo, "outputs" | "params"> {
  const st = useAppStore.getState();
  const edge = st.edges.find(edge => edge.source === node.id);
  if (!edge) {
    return {
      outputs: [{
        type: "*",
        name: "Connect to widget input",
        links: [],
        slot_index: 0
      }],
      params: [],
    }
  }

  const targetNode = st.graph[edge.target];
  const targetHandle = edge.targetHandle;
  const targetWidget = st.widgets[targetNode.widget];

  const {params} = getNodeRenderInfo(targetNode, targetWidget);
  let comboParam;

  for (const param of params) {
    if (param.property.toUpperCase() === targetHandle) {
      comboParam = param;
    }
  }

  return {
    outputs: [{
      type: comboParam?.property || "*",
      name: comboParam?.property || "Combo ",
      links: [],
      slot_index: 0
    }],
    params: [comboParam!],
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