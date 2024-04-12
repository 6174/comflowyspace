import exifr from 'exifr';
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode, ComfyUIWorkflow, ComfyUIWorkflowConnection, ComfyUIWorkflowGroup, ComfyUIWorkflowNode, Widget } from '../types';
import { Widgets, NODE_PRIMITIVE } from '../types';
import { uuid } from '../utils';

/**
 *  1) Transform comflowyspace workflow JSON format to comfyui JSON format
 *  2) Download as JSON file
 * @param workflow 
 */
export async function exportWorkflowToJSONFile(workflow: PersistedWorkflowDocument, widgets: Widgets): Promise<void> {
  const a = document.createElement('a')
  a.download =  `${workflow.title || "workflow"}.json`
  const comfyUIWorkflow = persistedWorkflowDocumentToComfyUIWorkflow(workflow, widgets);
  a.href = URL.createObjectURL(new Blob([JSON.stringify(comfyUIWorkflow)], { type: 'application/json' }))
  a.click();
}

export async function readWorkflowFromFile( file: File, widgets: Widgets ): Promise<PersistedWorkflowDocument> {
  const reader = new FileReader()
  reader.readAsText(file)
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', (ev) => {
      if (ev.target?.result != null && typeof ev.target.result === 'string') {
        resolve(safeLoadWorkflow(JSON.parse(ev.target.result), widgets))
      }
    })
    reader.addEventListener('error', reject)
  });
}

export function writeWorkflowToFile(workflow: PersistedWorkflowDocument): void {
  const a = document.createElement('a')
  a.download = 'workflow.json'
  a.href = URL.createObjectURL(new Blob([JSON.stringify(workflow)], { type: 'application/json' }))
  a.click()
}

function safeLoadWorkflow(workflow: any, widgets: Widgets): PersistedWorkflowDocument {
  console.log("source workflow", workflow);
  if (!workflow || !workflow.nodes) {
    throw new Error('Invalid workflow file. Please check if the file is correct workflow format.')
  }
  // if (workflow.version !== 1) {
  //   throw new Error('Invalid workflow file version. Please check if the file is corrupted.')
  // }
  if (workflow.comflowy_version) {
    // comflowy_type workflow
    return workflow;
  } else {
    // comfyUI type
    return comfyUIWorkflowToPersistedWorkflowDocument(workflow, widgets)
  }
}

export async function readWorkflowFromPng(file: File, widgets: Widgets): Promise<PersistedWorkflowDocument> {
  if (file.type !== 'image/png') {
    throw new Error('Invalid file type. Only PNG images are supported.');
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const onloadHandler = async () => {
      try {
        const exifData = await exifr.parse(image);
        const workflow = JSON.parse(exifData.workflow) as ComfyUIWorkflow
        resolve(safeLoadWorkflow(workflow, widgets));
        console.log('EXIF data:', workflow);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(image.src);
      }
    };

    image.onload = onloadHandler;

    image.onerror = () => {
      reject(new Error('Failed to load image.'));
    };

    image.src = URL.createObjectURL(file);
  });
}

export function comfyUIWorkflowToPersistedWorkflowDocument(comfyUIWorkflow: ComfyUIWorkflow, widgets: Widgets): PersistedWorkflowDocument {
  const { nodes, links, groups } = comfyUIWorkflow;
  const nodesMap: Record<string, PersistedWorkflowNode> = {};
  const missed_widget = [];
  nodes.forEach((node) => {
    const widget = widgets[node.type];
    const fields: any = {};
    if (widget && node.widgets_values) {
      const params: string[] = [];
      const inputs = node.inputs || [];
      const inputKeys = inputs.map(input => input.name);
      for (const [property, input] of Object.entries(widget.input.required)) {
        if (!inputKeys.includes(property)) {
          params.push(property)
        }
      }

      if (widget.input.optional) {
        for (const [property, input] of Object.entries(widget.input.optional)) {
          if (!inputKeys.includes(property)) {
            params.push(property);
          }
        }
      }

      // if (node.type === "KSamplerAdvanced") {
      //   debugger
      //   // params.splice(1, 0, "control_after_generated")
      // }

      const seedIndex = params.findIndex(param => Widget.isSeedParam(param));
      if (seedIndex >= 0 ) {
        params.splice(seedIndex + 1, 0, "control_after_generated")
      }
      
      // if (node.type === "KSamplerAdvanced" || 
      //   node.type === "ImpactKSamplerBasicPipe" || 
      //   node.type === "SamplerCustom" || 
      //   node.type === "ImpactKSamplerAdvancedBasicPipe" || 
      //   node.type === "KSampler (Efficient)"
      //   ) {
      //   params.splice(2, 0, "control_after_generated")
      // }

      node.widgets_values.forEach((value, index) => {
        const key = params[index];
        fields[key] = value;
      });

    } else {
      if (node.type === NODE_PRIMITIVE) {
        const fieldName = node.outputs[0].name;
        fields[fieldName] = node.widgets_values[0];
      }
      missed_widget.push(node.type);
    }

    const newNode: PersistedWorkflowNode = {
      id: node.id + "",
      value: {
        widget: node.type,
        fields,
        inputs: node.inputs || [],
        outputs: node.outputs || [],
        title: node.title,
        bgcolor: node.bgcolor,
        color: node.color,
        properties: node.properties
      },
      dimensions: {
        width: node.size[0],
        height: node.size[1],
      },
      position: {
        x: node.pos[0],
        y: node.pos[1],
      }
    }
    nodesMap[node.id + ""] = newNode;
  });

  const connections: PersistedWorkflowConnection[] = links.map((link) => {
    const linkId = link[0] + "";
    const sourceNodeId = link[1] + "";
    const sourceHandleId = link[2];
    const targetNodeId = link[3] + "";
    const targetHandleId = link[4];
    const connectionType = link[5];

    const sourceNode = nodesMap[sourceNodeId];
    const targetNode = nodesMap[targetNodeId];
    // const sourceWidget = widgets[sourceNode.value.widget];
    // const targetWidget = widgets[targetNode.value.widget];
    if (!sourceNode || !targetNode) {
      console.log("Error!!!!: source node or target node not found");
      return undefined
      // throw new Error("sourceNode or targetNode not found");
    }

    const outputKeys = sourceNode.value.outputs.map((output) => {
      let ret = output.name;
      // "Reroute" Widget
      if (!ret || ret === "") {
        ret = output.type
      }
      return ret;
    });
    const outputKey = outputKeys[sourceHandleId];
    if (!outputKey) {
      throw new Error("outputKey not found");
    }
    const sourceHandle = outputKey.toUpperCase();

    const inputs = targetNode.value.inputs.map((input) => {
      let ret = input.name;
      // "Reroute" Widget
      if (!ret || ret === "") {
        ret = input.type
      }
      return ret;
    });
    const inputKey = inputs[targetHandleId];
    if (!inputKey) {
      throw new Error("inputKey not found");
    }
    const targetHandle = inputKey.toUpperCase();

    return {
      id: linkId,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
      targetHandle,
      handleType: connectionType,
    }
  }).filter(it => it !== undefined) as PersistedWorkflowConnection[];

  groups.forEach((group) => {
    const groupId = uuid();
    const groupNode: PersistedWorkflowNode = {
      id: groupId,
      value: {
        widget: "Group",
        fields: {},
        inputs: [],
        outputs: [],
        title: group.title,
        color: group.color,
      },
      dimensions: {
        width: group.bounding[2],
        height: group.bounding[3]
      },
      position: {
        x: group.bounding[0],
        y: group.bounding[1]
      }
    }
    nodesMap[groupId] = groupNode;
  });

  return {
    id: comfyUIWorkflow.id || uuid(),
    title: comfyUIWorkflow.title || "Untitled",
    nodes: nodesMap,
    connections,
  };
}

export function persistedWorkflowDocumentToComfyUIWorkflow(persistedWorkflowDocument: PersistedWorkflowDocument, widgets: Widgets): ComfyUIWorkflow {
  const { nodes, connections, id, title } = persistedWorkflowDocument;
  const comfyUIWorkflow: ComfyUIWorkflow = {
    id: id,
    title: title || "Untitled",
    nodes: [],
    links: [],
    groups: [],
    version: 0,
    config: undefined,
    extra: {
      comflowy_version: process.env.NEXT_PUBLIC_APP_VERSION
    }
  };

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const widget = widgets[node.value.widget];
    const comfyUINode: ComfyUIWorkflowNode = {
      id: nodeId,
      type: node.value.widget,
      title: node.value.title,
      bgcolor: node.value.bgcolor!,
      color: node.value.color!,
      properties: node.value.properties,
      pos: [node.position.x, node.position.y],
      size: [node.dimensions!.width, node.dimensions!.height],
      inputs: node.value.inputs,
      outputs: node.value.outputs,
      widgets_values: [],
      flags: undefined,
      order: 0,
      mode: 0
    };

    if (widget && node.value.fields) {
      const params: string[] = [];
      const inputs = node.value.inputs || [];
      const inputKeys = inputs.map(input => input.name);
      for (const [property, input] of Object.entries(widget.input.required)) {
        if (!inputKeys.includes(property)) {
            params.push(property)
        }
      }

      const seedIndex = params.findIndex(param => Widget.isSeedParam(param));
      if (seedIndex >= 0 ) {
        params.splice(seedIndex + 1, 0, "control_after_generated")
      }

      // if (node.value.widget === "KSampler") {
      //   params.splice(1, 0, "control_after_generated")
      // }

      // if (node.value.widget === "KSamplerAdvanced" ||
      //   node.value.widget === "ImpactKSamplerBasicPipe" ||
      //   node.value.widget === "SamplerCustom" ||
      //   node.value.widget === "ImpactKSamplerAdvancedBasicPipe"
      // ) {
      //   params.splice(2, 0, "control_after_generated")
      // }

      comfyUINode.widgets_values = params.map(param => node.value.fields[param]);
    } else {
      if (node.value.widget === NODE_PRIMITIVE) {
        const fieldName = node.value.outputs[0].name;
        comfyUINode.widgets_values.push(node.value.fields[fieldName]);
      }
    }

    comfyUIWorkflow.nodes.push(comfyUINode);
  }

  connections.forEach((connection) => {
    const link: ComfyUIWorkflowConnection = [
      connection.id,
      connection.source!,
      nodes[connection.source!].value.outputs.findIndex(output => output.name.toUpperCase() === connection.sourceHandle),
      connection.target,
      nodes[connection.target].value.inputs.findIndex(input => input.name.toUpperCase() === connection.targetHandle),
      connection.handleType as any
    ];
    comfyUIWorkflow.links.push(link);
  });

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    if (node.value.widget === "Group") {
      const group: ComfyUIWorkflowGroup = {
        title: node.value.title!,
        color: node.value.color!,
        bounding: [node.position.x, node.position.y, node.dimensions!.width, node.dimensions!.height]
      };
      comfyUIWorkflow.groups.push(group);
    }
  }

  return comfyUIWorkflow;
}