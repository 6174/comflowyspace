import { Widget } from "@comflowy/common/comfui-interfaces"
import { useAppStore } from "@comflowy/common/store"
import { NodeProps } from "reactflow";
import {shallow} from "zustand/shallow";
import NodeComponent from "./reactflow-node";

export function NodeContainer(props: NodeProps<Widget>): JSX.Element {
    const { progressBar, imagePreviews, onPreviewImage, onDuplicateNode, onDeleteNode } = useAppStore(
      (st) => ({
        progressBar: st.nodeInProgress?.id === props.id ? st.nodeInProgress.progress : undefined,
        imagePreviews: st.graph[props.id]?.images?.flatMap((image) => {
          const index = st.gallery.findIndex((i) => i.image === image)
          return index !== -1 ? { image, index } : []
        }),
        onPreviewImage: st.onPreviewImage,
        onPropChange: st.onPropChange,
        onDuplicateNode: st.onDuplicateNode,
        onDeleteNode: st.onDeleteNode,
      }),
      shallow
    )
    return (
      <NodeComponent
        node={props}
        progressBar={progressBar}
        imagePreviews={imagePreviews}
        onPreviewImage={onPreviewImage}
        onDuplicateNode={onDuplicateNode}
        onDeleteNode={onDeleteNode}
      />
    )
  }