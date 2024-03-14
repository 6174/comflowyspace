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
import { useAppStore } from "@comflowy/common/store";
import { NodeError } from "./reactflow-node-errors";
import { NodeImagePreviews } from "./reactflow-node-imagepreviews";

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
  const transform = useAppStore(st => st.transform);
  const invisible = transform < 0.2;

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

      {!invisible ? (
        <div className="node-inner">
          <div className="node-header">
            <h2 className="node-title">
              {title}
              <NodeError nodeError={nodeError} />
            </h2>
          </div>
          <div className="node-main" ref={mainRef}>
            <SubflowSlots/>
            <SubflowParams/>
          </div>
          <NodeImagePreviews imagePreviews={imagePreviews} />
        </div>
      ) : (
          <>
            <div className="node-header"></div>
            <div className="node-main"></div>
          </>
      )}

    </div>
  )
}

function SubflowSlots() {
  return (
    <div className="node-slots">
      <div className="node-inputs">
      </div>
      <div className="node-outputs">
      </div>
    </div>
  )
}

function SubflowParams() {
  return (
    <div className="node-params">
    </div>
  )
}