import exifr from 'exifr';
import { PersistedWorkflowConnection, PersistedWorkflowDocument, PersistedWorkflowNode } from '../local-storage';
import { ComfyUIWorkflow } from '../comfui-interfaces/comfy-workflow';
import { Input, Widget, WidgetKey, Widgets } from '../comfui-interfaces';
import { uuid } from '../utils';

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
  if (!workflow) {
    throw new Error('Invalid workflow file. Please check if the file is corrupted.')
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

  const image = new Image();
  image.src = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    image.onload = async () => {
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

    image.onerror = () => {
      reject(new Error('Failed to load image.'));
    };
  });
}


export function comfyUIWorkflowToPersistedWorkflowDocument(comfyUIWorkflow: ComfyUIWorkflow, widgets: Widgets): PersistedWorkflowDocument {
  const { nodes, links } = comfyUIWorkflow;
  const nodesMap: Record<string, PersistedWorkflowNode> = {};
  const missed_widget = [];
  nodes.forEach((node) => {
    const widget = widgets[node.type];
    const fields: any = {};
    if (widget) {
      const inputKeys = Object.keys(widget.input.required);
      inputKeys.forEach((key, index) => {
        const value = node.widgets_values[index];
        fields[key] = value;
      });
    } else {
      missed_widget.push(node.type);
    }

    const newNode: PersistedWorkflowNode = {
      id: node.id + "",
      value: {
        widget: node.type,
        fields,
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
    const sourceWidget = widgets[sourceNode.value.widget];
    const targetWidget = widgets[targetNode.value.widget];
    if (!sourceNode || !targetNode) {
      throw new Error("sourceNode or targetNode not found");
    }

    let sourceHandle = "";
    let targetHandle = "";
    if (sourceWidget) {
      const outputKeys = sourceWidget.output;
      const outputKey = outputKeys[sourceHandleId];
      if (!outputKey) {
        throw new Error("outputKey not found");
      }
      sourceHandle = outputKey;
    }

    if (targetWidget) {
      const inputs = [];
      for (const [property, input] of Object.entries(targetWidget.input.required)) {
        if (!Input.isParameterOrList(input)) {
          inputs.push(property)
        }
      }
      const inputKey = inputs[targetHandleId];
      if (!inputKey) {
        throw new Error("inputKey not found");
      }
      targetHandle = inputKey;
    }

    return {
      id: linkId,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
      targetHandle,
      handleType: connectionType,
    }
  });

  return {
    id: uuid(),
    title: "Untitled",
    nodes: nodesMap,
    connections,
  };
}


