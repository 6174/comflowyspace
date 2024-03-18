import { SDNode } from "../types";

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