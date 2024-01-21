import { uuid } from "@comflowy/common";
import { useAppStore } from "@comflowy/common/store";
import { ReactFlowInstance, XYPosition } from "reactflow";
import cloneDeep from "lodash";
import { PersistedWorkflowNode } from "@comflowy/common/storage";
import { message } from "antd";
export type EditorClipBoardData = {
  nodes: PersistedWorkflowNode[],
}

const CLIPBOARD_TYPE = '@comflowy/nodes';
export function copyNodes(nodes: PersistedWorkflowNode[], ev: ClipboardEvent) {
  if (nodes.length === 0) {
    // Normal prompt text copying
    return;
  } 
  const clipboardData = JSON.stringify({
    nodes,
  });
  ev.clipboardData.setData(
    CLIPBOARD_TYPE,
    clipboardData
  )
  ev.preventDefault();
  message.success("copy success");
}

export function pasteNodes(ev: ClipboardEvent) {
  console.log("onpaste");
  const state = useAppStore.getState();
  if (!ev.clipboardData) {
    return;
  }
  if (ev.target instanceof HTMLInputElement) {
    return;
  }
  const clipboardData = ev.clipboardData.getData(CLIPBOARD_TYPE);
  console.log("clipboard", clipboardData);
  if (!clipboardData) {
    return;
  }
  try {
    const data = JSON.parse(clipboardData) as EditorClipBoardData;
    const nodes = data.nodes;
    const pastePosition = state.editorInstance.screenToFlowPosition({
      x: document.body.offsetWidth / 2 - 100,
      y: document.body.offsetHeight / 2 - 100
    });

    let minX: number = Infinity;
    let minY: number = Infinity;
    nodes.forEach(node => {
      const position = node.position || {x: 0, y: 0};
      if (position.x < minX) {
        minX = position.x;
      }
      if (position.y < minY) {
        minY = position.y;
      }
    });
    const diff = {
      x: minX - pastePosition.x,
      y: minY - pastePosition.y
    };

    nodes.forEach((node => {
      node.id = uuid();
      const position = node.position || {x: 0, y: 0};
      const newPosition: XYPosition = {
        x: position.x - diff.x,
        y: position.y - diff.y,
      }
      node.position = newPosition;
    }))

    state.onPasteNodes(nodes);
  } catch (err) {
    console.log(err);
  }
}

function cloneNodes(nodes: PersistedWorkflowNode[]): PersistedWorkflowNode[] {
  const newNodes = cloneDeep(nodes) as unknown as PersistedWorkflowNode[];
  return newNodes.map(node => {
    return {
      ...node,
      id: uuid(),
    }
  })
}
