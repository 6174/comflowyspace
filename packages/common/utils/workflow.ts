import { SDNode } from "../types";
import {Node} from "reactflow";

/**
 * return slot value type of a normal node
 */
export function getValueTypeOfNodeSlot(node: SDNode, handleId: string, handleType: string): string {
  let valueType = "";
  if (handleType === "source") {
    const output = node.outputs.find(output => output.name.toUpperCase() === handleId);
    if (output) {
      valueType = output.type;
    }
  } else {
    const input = node.inputs.find(input => input.name.toUpperCase() === handleId);
    if (input) {
      valueType = input.type;
    }
  }
  return valueType;
}

export function getNodePositionInGroup(node: Node, containerNode: Node) {
  const nodePosition = node.positionAbsolute ?? node.position ?? { x: 0, y: 0 };
  console.log("real node Position", nodePosition, node.position, node.positionAbsolute);
  nodePosition.x = nodePosition.x - containerNode.position.x;
  nodePosition.y = nodePosition.y - containerNode.position.y;

  return nodePosition;
}

export function getNodePositionOutOfGroup(node: Node, containerNode: Node) {
  const nodePosition = node.position ?? { x: 0, y: 0 };
  nodePosition.x = nodePosition.x + containerNode.position.x;
  nodePosition.y = nodePosition.y + containerNode.position.y;
  return nodePosition;
}