import { CSSProperties, memo, useCallback, useState } from "react";
import { NodeWrapperProps } from "../reactflow-node/reactflow-node-wrapper";
import { useAppStore } from "@comflowy/common/store";
import { GroupNodeState, SDNODE_DEFAULT_COLOR } from "@comflowy/common/types";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import Color from "color";
import { ComflowyNodeResizer, useNodeAutoResize } from "../reactflow-node/reactflow-node-resize";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";

/**
 * group node
 */
export const GroupNode = memo((props: NodeWrapperProps) => {
  const node = props;
  const sdnode = props.data.value;
  const id = props.id;
  const { mainRef, minHeight, minWidth, setResizing } = useNodeAutoResize(node, []);

  const groupState = useAppStore(st => st.graph[id]?.properties?.groupState || GroupNodeState.Collapsed);
  const onNodePropertyChange = useAppStore(st => st.onNodePropertyChange);
  const onChangeGroupState = useCallback((v) => {
    onNodePropertyChange(id, "groupState", v);
  }, [id]);

  let nodeColor = props.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = props.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;
  const transform = useAppStore(st => st.transform);
  const invisible = transform < 0.2;

  let $view = <GroupExpanded {...props} />;
  switch (groupState) {
    case GroupNodeState.Collapsed:
      $view = <GroupCollapsed {...props} />
      break;
  }
  const { title } = getNodeRenderInfo(sdnode, node.data.widget);
  return (
    <div className={`
      ${nodeStyles.reactFlowNode} 
      ${node.selected ? nodeStyles.reactFlowSelected : ""} 
      `} style={{
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color':  Color(nodeBgColor).alpha(.95).hexa(),
      } as CSSProperties}> 
      <ComflowyNodeResizer setResizing={setResizing} minWidth={minWidth} minHeight={minHeight} node={node} />
      
      {(!invisible && $view) ? (
        <div className="node-inner">
          <div className="node-header">
            <h2 className="node-title">
              {title}
            </h2>
          </div>
          <div className="node-main" ref={mainRef}>
          </div>
        </div>
      ): (
        <>
          <div className="node-header"></div>
          <div className="node-main"></div>
        </>
      )}
    </div>
  )
});

/**
 * 
 * @param params 
 */
function GroupCollapsed(props: NodeWrapperProps) {
  return (
    <>
    </>
  )
}

function GroupExpanded(props: NodeWrapperProps) {
  return (
    <>
    </>
  )
}

function GroupCollapsedAsNode(props: NodeWrapperProps) {
  return (
    <>
    </>
  )
}