/**
 * Rendering flow type node
 */

import { PreviewImage, SDNODE_DEFAULT_COLOR, SDSubFlowNode, Widget } from "@comflowy/common/types";
import { useSubFlowNodeRenderingInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Dimensions, NodeProps } from "reactflow";
import { ComflowyNodeResizer, useNodeAutoResize } from "./reactflow-node-resize";
import nodeStyles from "./reactflow-node.style.module.scss";
import { CSSProperties } from "react";
import Color from "color";


type SubFlowNodeProps = {
  node: NodeProps<{
    value: SDSubFlowNode;
    dimensions: Dimensions
  }>;
  imagePreviews?: PreviewImage[]
}

export function SubFlowNode({
  node, 
  imagePreviews
}: SubFlowNodeProps) {
  const {title, id, nodesWithControl} = useSubFlowNodeRenderingInfo(node);
  const { mainRef, minHeight, minWidth, setResizing } = useNodeAutoResize(node, imagePreviews);

  const isInProgress = false;
  const nodeError = undefined;

  let nodeColor = node.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;
  
  return (
    <div className={`
      ${nodeStyles.reactFlowNode} 
      ${node.selected && !isInProgress && !nodeError ? nodeStyles.reactFlowSelected : ""} 
      ${isInProgress ? nodeStyles.reactFlowProgress : ""}
      ${nodeError ? nodeStyles.reactFlowError : ""}
      `} style={{
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color': (isInProgress || !!nodeError) ? nodeBgColor : Color(nodeBgColor).alpha(.95).hexa(),
      } as CSSProperties}> 
      <ComflowyNodeResizer setResizing={setResizing} minWidth={minWidth} minHeight={minHeight} node={node} />
    </div>
  )
}