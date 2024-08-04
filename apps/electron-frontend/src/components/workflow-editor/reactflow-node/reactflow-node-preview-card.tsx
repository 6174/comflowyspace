import { useAppStore } from "@comflowy/common/store";
import { PersistedWorkflowNode, SDNode, Widget } from "@comflowy/common/types";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import styles from "./reactflow-node-preview-card.style.module.scss"
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
import nodeStyles from "./reactflow-node.style.module.scss";
import Color from "color";
import { getTransformStyle } from "./reactflow-node";
import { getWidgetIcon } from "./reactflow-node-icons";
import { Slot } from "./reactflow-node-slot";
import { InputContainer } from "../reactflow-input/reactflow-input-container";
import { Position } from "reactflow";
/**
 * 预览一个 widget
 * @param props 
 * @returns 
 */
export function ReactflowWidgetPreviewCard(props: {
  widget: Widget
}) {
  const widget = props.widget;
  const sdnode = SDNode.fromWidget(props.widget);
  const { title, inputs, outputs, params, nodeBgColor, nodeColor } = getNodeRenderInfo(sdnode, props.widget);
  const node_id = (new Date()).getTime() + "";
  return (
    <div className={`
      ${nodeStyles.reactFlowNode}
      ${styles.nodePreview}
      `} style={{
        '--node-width': "200px",
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color': Color(nodeBgColor).alpha(.92).hexa(),
      } as React.CSSProperties}>
      <div className={`node-inner`}>
        <div className="node-header">
          <h2 className="node-title" style={getTransformStyle(1)}>
            {getWidgetIcon(widget)}
            {title}
          </h2>
        </div>
        <div className="node-main">
          <div className="node-main-inner">
            <div className="node-slots">
              <div className="node-inputs">
                {inputs.map((input, index) => (
                  <Slot node_id={node_id} key={input.name + index} widget={widget.name} valueType={input.type} id={input.name} label={input.name} type="target" position={Position.Left} />
                ))}
              </div>
              <div className="node-outputs">
                {outputs.map((output, index) => (
                  <Slot node_id={node_id} key={output.name + index} widget={widget.name} valueType={output.type} id={output.name} label={output.name} type="source" position={Position.Right} />
                ))}
              </div>
            </div>
            <>
              <div className="node-params">
                {params.map(({ property, input }) => (
                  <InputContainer env="main" key={property} onChange={v => {
                    console.log("change", v)
                  }} name={property} id={node_id} node={sdnode} input={input} widget={widget} />
                ))}
              </div>
              <div style={{ height: 10 }}></div>
            </>
          </div>
        </div>
      </div>
    </div>
  )
}