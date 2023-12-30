import { SDNode, Widget } from "@comflowy/common/comfui-interfaces"
import { useAppStore } from "@comflowy/common/store"
import { NodeProps } from "reactflow";
import {shallow} from "zustand/shallow";
import NodeComponent from "./reactflow-node";

export type  FlowNodeProps = NodeProps<{
  widget: Widget;
  value: SDNode;
}>
export function NodeContainer(props: FlowNodeProps): JSX.Element {
    const { progressBar, imagePreviews, onDuplicateNode, onNodesDelete } = useAppStore(
      (st) => ({
        progressBar: st.nodeInProgress?.id === props.id ? st.nodeInProgress.progress : undefined,
        imagePreviews: st.graph[props.id]?.images || [],
        onNodeFieldChange: st.onNodeFieldChange,
        onDuplicateNode: st.onDuplicateNode,
        onNodesDelete: st.onNodesDelete,
      }),
      shallow
    )
    return (
      <NodeComponent
        node={props}
        progressBar={progressBar}
        imagePreviews={imagePreviews}
        onDuplicateNode={onDuplicateNode}
        onNodesDelete={onNodesDelete}
      />
    )
  }