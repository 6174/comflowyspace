import { SDNode, Widget } from "@comflowy/common/comfui-interfaces"
import { useAppStore } from "@comflowy/common/store"
import { Dimensions, NodeProps } from "reactflow";
import {shallow} from "zustand/shallow";
import {NodeComponent} from "./reactflow-node";
import { memo } from "react";

export type  FlowNodeProps = NodeProps<{
  widget: Widget;
  value: SDNode;
  dimensions: Dimensions
}>
export const NodeContainer = memo((props: FlowNodeProps): JSX.Element => {
  const progressBar = useAppStore(st => st.nodeInProgress?.id === props.id ? st.nodeInProgress.progress : undefined);
  const imagePreviews = useAppStore(st => st.graph[props.id]?.images || []);
  return (
    <NodeComponent
      node={props}
      progressBar={progressBar}
      imagePreviews={imagePreviews}
    />
  )
});