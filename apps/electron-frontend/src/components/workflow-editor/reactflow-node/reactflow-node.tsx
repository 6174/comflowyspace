import { memo } from 'react'
import { type NodeProps, Position, Dimensions} from 'reactflow'
import { Widget, SDNode, PreviewImage, SDNODE_DEFAULT_COLOR, NodeVisibleState } from '@comflowy/common/types';
import { InputContainer } from '../reactflow-input/reactflow-input-container';
import nodeStyles from "./reactflow-node.style.module.scss";
import { useAppStore } from '@comflowy/common/store';
import Color from "color";
import { getWidgetIcon } from './reactflow-node-icons';
import { ComfyUINodeError } from '@comflowy/common/types';
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Slot } from './reactflow-node-slot';
import { InstallMissingWidget, NodeError } from './reactflow-node-errors';
import { ComflowyNodeResizer, useNodeAutoResize } from './reactflow-node-resize';
import { NodeImagePreviews } from './reactflow-node-imagepreviews';
import { NodeWrapperProps } from './reactflow-node-wrapper';
import { ReactFlowNodeDynamic } from './reactflow-node-dynamic';
export const NODE_IDENTIFIER = 'sdNode'

interface Props {
  node: NodeWrapperProps
  isPositive: boolean;
  isNegative: boolean;
  progressBar?: number;
  nodeError?: ComfyUINodeError;
  widget: Widget;
  imagePreviews?: PreviewImage[]
}

export const INVISIBLE_TRANSFORM_THRSHOLD = 0.25;

export const NodeComponent = memo(({
  node,
  nodeError,
  progressBar,
  isPositive,
  isNegative,
  widget,
  imagePreviews,
}: Props): JSX.Element => {
  const renderInfo = getNodeRenderInfo({ id: node.id, ...node.data.value }, node.data.widget);
  const { inputs, title, outputs, params } = renderInfo;
  const isInProgress = progressBar !== undefined
  const collapsed = node.data.visibleState === NodeVisibleState.Collapsed;
  const {mainRef, minHeight, minWidth, setResizing} = useNodeAutoResize(node, imagePreviews);
  const transform = useAppStore(st => st.transform || 1);
  const invisible = transform < INVISIBLE_TRANSFORM_THRSHOLD;
  
  let nodeColor = node.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  if (isPositive) {
    nodeBgColor = "#212923";
    nodeColor = "#67A166";
  }

  if (isNegative) {
    nodeBgColor = "#261E1F";
    nodeColor = "#DE654B";
  }
  
  return (
    <div className={`
      ${nodeStyles.reactFlowNode}
      ${node.selected && !isInProgress && !nodeError ? nodeStyles.reactFlowSelected : ""} 
      ${isInProgress ? nodeStyles.reactFlowProgress : ""}
      ${nodeError ? nodeStyles.reactFlowError : ""}
      ${isPositive ? "positive-node" : ""}
      ${isNegative ? "negative-node" : ""}
      ${collapsed ? nodeStyles.nodeCollapsed : ""}
      `} style={{
        '--node-width': node.data.dimensions.width + "px",
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        'opacity': renderInfo.enabled ? 0.5 : 1,
        '--node-bg-color': (isInProgress || !!nodeError) ? nodeBgColor : Color(nodeBgColor).alpha(.95).hexa(),
    } as React.CSSProperties}>

      {!collapsed && <ComflowyNodeResizer setResizing={setResizing} minWidth={minWidth} minHeight={minHeight} node={node} /> }

      {!invisible ? (
        <div className={`node-inner ${widget.input.required.upload ? "LoadImage" : ""}`}>
          <div className="node-header">
            <h2 className="node-title" style={getTransformStyle(transform)}>
              {getWidgetIcon(widget)} 
                {title}
                {isPositive && <span>{"("}Positive{")"}</span>} 
                {isNegative && <span>{"("}Negative{")"}</span>} 
                <NodeError nodeError={nodeError}/>
            </h2>

            {isInProgress? 
              <div className="progress-bar">
                <div className="progress-indicator" style={{
                  width: `${progressBar * 100}%`
                }}></div>
              </div>
              : null}
          </div>

          <div className="node-main">
            <div className="node-main-inner" ref={mainRef}>
              <div className="node-slots">
                <div className="node-inputs">
                  {inputs.map((input, index) => (
                    <Slot node_id={node.id}  key={input.name + index} widget={widget.name} valueType={input.type} id={input.name} label={input.name} type="target" position={Position.Left} />
                  ))}
                </div>
                <div className="node-outputs">
                  {outputs.map((output, index) => (
                    <Slot node_id={node.id} key={output.name + index} widget={widget.name} valueType={output.type} id={output.name} label={output.name} type="source" position={Position.Right} />
                  ))}
                </div>
              </div>
              {
                !collapsed && (
                  <>
                    <div className="node-params">
                      {params.map(({ property, input }) => (
                        <InputContainer env={"main"} key={property} name={property} id={node.id} node={node.data.value} input={input} widget={widget} />
                      ))}
                    </div>
                    <InstallMissingWidget nodeError={nodeError} node={node.data.value} />
                    <div style={{ height: 10 }}></div>
                  </>
                )
              }
            </div>
            {!collapsed && <ReactFlowNodeDynamic renderInfo={renderInfo} node={node}  imagePreviews={imagePreviews}/>}
          </div>
        </div>
      ) : (
        <>
          <div className="node-header"></div>
          <div className="node-main"></div>
        </>
      )}
    </div>
  )
});


export function getTransformStyle(transformScale: number) {
  const transform = Math.max(1, 1 / transformScale);
  const switchState = transform > 1.6;
  const ret: React.CSSProperties = {
    transformOrigin: '0 50%',
    transform: `scale(${transform})`
  }

  if (transform > 1.3) {
    ret.fontSize = 10;
  }

  if (switchState) {
    ret.transform = `scale(${transform})`
    ret.transformOrigin = '0 90%';
    ret.top = -16;
    ret.left = 0;
    ret.opacity = .8
    ret.fontSize = 10
    ret['--icon-size'] = "14px";
    // ret.maxWidth = 140
    // ret.overflow = 'hidden'
    // ret.fontWeight = "bold";
    // ret.color = 'var(--node-color)';
    // ret.textShadow = 'var(--node-color) 1px 1px 3px';
  }
  return ret;
}
