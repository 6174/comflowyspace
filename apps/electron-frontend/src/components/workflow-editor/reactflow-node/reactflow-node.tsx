import { memo } from 'react'
import { type NodeProps, Position, Dimensions} from 'reactflow'
import { Widget, SDNode, PreviewImage, SDNODE_DEFAULT_COLOR } from '@comflowy/common/types';
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
export const NODE_IDENTIFIER = 'sdNode'

interface Props {
  node: NodeProps<{
    widget: Widget;
    value: SDNode;
    dimensions: Dimensions
  }>
  isPositive: boolean;
  isNegative: boolean;
  progressBar?: number;
  nodeError?: ComfyUINodeError;
  widget: Widget;
  imagePreviews?: PreviewImage[]
}

export const NodeComponent = memo(({
  node,
  nodeError,
  progressBar,
  isPositive,
  isNegative,
  widget,
  imagePreviews,
}: Props): JSX.Element => {
  const { inputs, title, outputs, params } = getNodeRenderInfo(node.data.value, node.data.widget);
  const isInProgress = progressBar !== undefined
  const {mainRef, minHeight, minWidth, setResizing} = useNodeAutoResize(node, imagePreviews);

  const transform = useAppStore(st => st.transform);
  const invisible = transform < 0.2;
  
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
      `} style={{
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color': (isInProgress || !!nodeError) ? nodeBgColor : Color(nodeBgColor).alpha(.95).hexa(),
    } as React.CSSProperties}>

      <ComflowyNodeResizer setResizing={setResizing} minWidth={minWidth} minHeight={minHeight} node={node} />

      {!invisible ? (
        <div className='node-inner'>
          <div className="node-header">
            <h2 className="node-title">
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

          <div className="node-main" ref={mainRef}>
            <div className="node-slots">
              <div className="node-inputs">
                {inputs.map((input, index) => (
                  <Slot key={input.name + index} valueType={input.type} id={input.name} label={input.name} type="target" position={Position.Left} />
                ))}
              </div>
              <div className="node-outputs">
                {outputs.map((output, index) => (
                  <Slot key={output.name + index} valueType={output.type} id={output.name} label={output.name} type="source" position={Position.Right} />
                ))}
              </div>
            </div>
            
            <div className="node-params">
              {params.map(({ property, input }) => (
                <InputContainer key={property} name={property} id={node.id} node={node.data.value} input={input} widget={widget} />
              ))}
            </div>
            <InstallMissingWidget nodeError={nodeError} node={node.data.value} />
            <div style={{ height: 10 }}></div>
          </div>
          <NodeImagePreviews imagePreviews={imagePreviews}/>
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



