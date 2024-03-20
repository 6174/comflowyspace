import { CSSProperties, MutableRefObject, memo, use, useCallback, useState } from "react";
import { NodeWrapperProps } from "../reactflow-node/reactflow-node-wrapper";
import { useAppStore } from "@comflowy/common/store";
import { NodeVisibleState, SDNODE_DEFAULT_COLOR } from "@comflowy/common/types";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import Color from "color";
import { ComflowyNodeResizer, useNodeAutoResize } from "../reactflow-node/reactflow-node-resize";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import {Slot} from "../reactflow-node/reactflow-node-slot";
import { Position } from "reactflow";

/**
 * group node
 */
export const GroupNode = memo((props: NodeWrapperProps) => {
  const node = props;
  const id = props.id;
  const nodeVisibleState = node.data.visibleState;
  const isDraggingNodeOverCurrentGroup = useAppStore(st => st.draggingOverGroupId === id);
  let nodeColor = props.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = props.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;
  const transform = useAppStore(st => st.transform);
  const invisible = transform < 0.2;

  let $view;
  if (invisible) {
    return (
      <>
        <div className="node-header"></div>
        <div className="node-main"></div>
      </>
    )
  }
  switch (nodeVisibleState) {
    case NodeVisibleState.Collapsed:
      $view = <GroupCollapsed node={props} />
      break;
    default:
      $view = <GroupExpanded node={props} />;
      break;
  }

  const collapsed = nodeVisibleState === NodeVisibleState.Collapsed;
  return (
    <div className={`
      ${nodeStyles.reactFlowNode} 
      ${(node.selected || isDraggingNodeOverCurrentGroup) ? nodeStyles.reactFlowSelected : ""} 
      ${collapsed ? nodeStyles.nodeCollapsed : ""}
      `} style={{
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color':  Color(nodeBgColor).alpha(.95).hexa(),
      } as CSSProperties}> 
      {$view}
    </div>
  )
});

/**
 * 
 * @param params 
 */
function GroupCollapsed(props: {
  node: NodeWrapperProps,
}) {
  const { node } = props;
  const sdnode = node.data.value;
  const { title } = getNodeRenderInfo(sdnode, node.data.widget);
  const childrenIds = node.data.children || [];
  const children = useAppStore(st => childrenIds.map(id => st.graph[id].flowNode));
  const childrenWidthRenderInfo = children.map(child => {
    return {
      node: child,
      renderInfo: getNodeRenderInfo(child.data.value, child.data.widget)
    }
  })
  // render slots of children
  return (
    <div className="node-inner">
      <div className="node-header">
        <h2 className="node-title">
          {title}({children.length} children)
        </h2>
      </div>
      <div className="node-main">
        <div className="node-slots">
          <div className="node-inputs">
            {childrenWidthRenderInfo.map(childWidthRenderInfo => {
              const { inputs, outputs, title } = childWidthRenderInfo.renderInfo;
              return inputs.map((input, index) => (
                <Slot key={input.name + index} valueType={input.type} id={input.name} label={input.name} type="target" position={Position.Left} />
              ))
            })}
          </div>
          <div className="node-outputs">
            {childrenWidthRenderInfo.map(childWidthRenderInfo => { 
              const { inputs, outputs, title } = childWidthRenderInfo.renderInfo;
              return outputs.map((output, index) => (
                <Slot key={output.name + index} valueType={output.type} id={output.name} label={output.name} type="source" position={Position.Right} />
              ))
            })}
          </div>
        </div>
      </div>
  </div>
  )
}

function GroupExpanded(props: {
  node: NodeWrapperProps,
}) {
  const {node} = props;
  const sdnode = node.data.value;
  const { title } = getNodeRenderInfo(sdnode, node.data.widget);
  const { mainRef, minHeight, minWidth, setResizing } = useNodeAutoResize(node, []);
  return (
    <>
      <ComflowyNodeResizer setResizing={setResizing} minWidth={minWidth} minHeight={minHeight} node={node} /> 
      <div className="node-inner">
        <div className="node-header">
          <h2 className="node-title">
            {title}
          </h2>
        </div>
        <div className="node-main" ref={mainRef}>
        </div>
      </div>
    </>
  )
}

function GroupCollapsedAsNode(props: NodeWrapperProps) {
  return (
    <>
    </>
  )
}