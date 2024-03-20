import { NodeVisibleState, SDNode, SUBFLOW_WIDGET_TYPE_NAME, UnknownWidget, Widget } from "@comflowy/common/types"
import { useAppStore } from "@comflowy/common/store"
import { Dimensions, NodeProps } from "reactflow";
import {NodeComponent} from "./reactflow-node";
import { memo } from "react";
import { SubflowNode } from "./reactflow-subflow-node";

export type NodeWrapperProps = NodeProps<{
  widget: Widget;
  value: SDNode;
  dimensions: Dimensions;
  visibleState: NodeVisibleState;
  children: string[]
}>

export const NodeWrapper = memo((props: NodeWrapperProps): JSX.Element => {
  const progressBar = useAppStore(st => st.nodeInProgress?.id === props.id ? st.nodeInProgress.progress : undefined);
  const imagePreviews = useAppStore(st => st.graph[props.id]?.images || []);
  const isPositive = useAppStore(st => st.graph[props.id]?.isPositive);
  const isNegative = useAppStore(st => st.graph[props.id]?.isNegative);
  const widget = useAppStore(st => st.widgets[props.data.widget.name]) || {
    ...UnknownWidget,
    name: props.data.value.widget,
    display_name: props.data.value.widget
  };
  const nodeError = useAppStore(st => st.promptError?.node_errors[props.id]);

  if (props.data.value.widget === SUBFLOW_WIDGET_TYPE_NAME) {
    return <SubflowNode node={props} imagePreviews={imagePreviews} nodeError={nodeError} />
  }
  
  return (
    <NodeComponent
      node={props}
      isPositive={isPositive}
      isNegative={isNegative}
      widget={widget}
      nodeError={nodeError}
      progressBar={progressBar}
      imagePreviews={imagePreviews}
    />
  )
});