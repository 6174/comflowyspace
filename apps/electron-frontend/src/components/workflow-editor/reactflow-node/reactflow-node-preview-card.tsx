import { useAppStore } from "@comflowy/common/store";
import { PersistedWorkflowNode, Widget } from "@comflowy/common/types";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";

/**
 * 预览卡片
 * @param props 
 */
export function ReactflowNodePreviewCard(props: {
  node: PersistedWorkflowNode
}) {
  const widgets = useAppStore(st => st.widgets);
  const widget = widgets[props.node.value.widget];
  const renderingInfo = getNodeRenderInfo(props.node.value, widget);
  return (
    <div className="node-preview">
      
    </div>
  )
}

/**
 * 预览一个 widget
 * @param props 
 * @returns 
 */
export function ReactflowWidgetPreviewCard(props: {
  widget: Widget
}) {
  return (
    <div>
      <div>{props.widget.display_name}</div>
      <div>{props.widget.name}</div>
      <div>{props.widget.description}</div>
    </div>
  )
}