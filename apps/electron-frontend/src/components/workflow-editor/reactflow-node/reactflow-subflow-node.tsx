/**
 * Rendering flow type node
 */

import { SDSubFlowNode, Widget } from "@comflowy/common/types";
import { useSubFlowNodeRenderingInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Dimensions, NodeProps } from "reactflow";

type SubFlowNodeProps = NodeProps<{
  value: SDSubFlowNode;
  dimensions: Dimensions
}>

export function SubFlowNode(props: {
  node: SubFlowNodeProps,
}) {
  const renderingInfo = useSubFlowNodeRenderingInfo(props.node);
  return (
    <div className="flow">
      {renderingInfo.title}
    </div>
  )
}