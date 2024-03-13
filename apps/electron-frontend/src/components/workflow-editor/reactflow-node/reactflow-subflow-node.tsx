/**
 * Rendering flow type node
 */

import { SDSubFlowNode, Widget } from "@comflowy/common/types";
import { Dimensions, NodeProps } from "reactflow";

type SubFlowNodeProps = NodeProps<{
  value: SDSubFlowNode;
  dimensions: Dimensions
}>

export function SubFlowNode(props: {
  node: SubFlowNodeProps
}) {
  const sdSubFlowNode = props.node.data.value;
  
  return (
    <div className="flow">
      rendering-flowtype-of-node
    </div>
  )
}