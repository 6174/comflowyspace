/**
 * Rendering flow type node
 */
import { ComfyUINodeError, PreviewImage, SDNODE_DEFAULT_COLOR, SDNode, SubflowNodeRenderingInfo, SubflowNodeWithControl, Widget, getSubflowFieldId, getSubflowSlotId } from "@comflowy/common/types";
import { useSubflowNodeRenderingInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Dimensions, NodeProps, Position } from "reactflow";
import { ComflowyNodeResizer, useNodeAutoResize } from "./reactflow-node-resize";
import nodeStyles from "./reactflow-node.style.module.scss";
import { CSSProperties, useCallback } from "react";
import Color from "color";
import { useAppStore } from "@comflowy/common/store";
import { NodeError } from "./reactflow-node-errors";
import { NodeImagePreviews } from "./reactflow-node-imagepreviews";
import { Slot } from "./reactflow-node-slot";
import { InputContainer } from "../reactflow-input/reactflow-input-container";
import { INVISIBLE_TRANSFORM_THRSHOLD } from "./reactflow-node";
type SubflowNodeProps = {
  node: NodeProps<{
    value: SDNode;
    dimensions: Dimensions
  }>;
  imagePreviews?: PreviewImage[];
  nodeError?: ComfyUINodeError
}

export function SubflowNode({
  node, 
  imagePreviews,
  nodeError
}: SubflowNodeProps) {
  const subflowRenderingInfo = useSubflowNodeRenderingInfo(node);
  const { mainRef, minHeight, minWidth, setResizing } = useNodeAutoResize(node, imagePreviews);

  const isInProgress = false;

  let nodeColor = node.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;
  const transform = useAppStore(st => st.transform);
  const invisible = transform < INVISIBLE_TRANSFORM_THRSHOLD;

  return (
    <div className={`
      ${nodeStyles.reactFlowNode} 
      ${node.selected && !isInProgress && !nodeError ? nodeStyles.reactFlowSelected : ""} 
      ${isInProgress ? nodeStyles.reactFlowProgress : ""}
      ${nodeError ? nodeStyles.reactFlowError : ""}
      `} style={{
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color': (isInProgress || !!nodeError) ? nodeBgColor : Color(nodeBgColor).alpha(.95).hexa(),
      } as CSSProperties}> 
      <ComflowyNodeResizer setResizing={setResizing} minWidth={minWidth} minHeight={minHeight} node={node} />

      {(!invisible && subflowRenderingInfo) ? (
        <div className="node-inner">
          <div className="node-header">
            <h2 className="node-title">
              {subflowRenderingInfo.title}
              <NodeError nodeError={nodeError} />
            </h2>
          </div>
          <div className="node-main" ref={mainRef}>
            <SubflowSlots subflowRenderingInfo={subflowRenderingInfo} />
            <SubflowParams subflowRenderingInfo={subflowRenderingInfo} subflowNode={node}/>
          </div>
          <NodeImagePreviews imagePreviews={imagePreviews || []} />
        </div>
      ) : (
          <>
            <div className="node-header"></div>
            <div className="node-main"></div>
          </>
      )}
    </div>
  )
}

export function SubflowSlots({ subflowRenderingInfo }: {
  subflowRenderingInfo: SubflowNodeRenderingInfo;
}) {
  const inputs = subflowRenderingInfo.inputs;
  const outputs = subflowRenderingInfo.outputs;
  return (
    <div className="node-slots">
      <div className="node-inputs">
        {inputs.map((input, index) => (
          <Slot key={input.name + index} valueType={input.type} id={input.id} label={input.name} type="target" position={Position.Left} />
        ))}
      </div>
      <div className="node-outputs">
        {outputs.map((output, index) => (
          <Slot key={output.name + index} valueType={output.type} id={output.id} label={output.name} type="source" position={Position.Right} />
        ))}
      </div>
    </div>
  )
}

export function SubflowParams({ subflowRenderingInfo, subflowNode, onChangeHandler }: {
  subflowRenderingInfo: SubflowNodeRenderingInfo;
  subflowNode: NodeProps<{
    value: SDNode
  }>
  onChangeHandler?: (val, fieldName) => void;
}) {
  const fieldValues = useAppStore((st) => st.graph[subflowNode.id]?.fields || {});
  const params =  subflowRenderingInfo.params;
  const onNodeFieldChange = useAppStore((st) => st.onNodeFieldChange);
  const _onChangeHandler = onChangeHandler || useCallback((val: any, fieldName: string) => onNodeFieldChange(subflowNode.id, fieldName, val), [onNodeFieldChange])
  return (
    <div className="node-params">
      {params.map(({ property, input, sdnode, title, id, widget }) => {
        const realFieldName = getSubflowFieldId(id, property);
        const visibleName = `${title}:${property}`
        return (
          <InputContainer
            key={realFieldName}
            name={visibleName}
            id={id}
            value={fieldValues[realFieldName]}
            node={sdnode}
            input={input}
            onChange={(val) => {
              _onChangeHandler(val, realFieldName);
            }}
            widget={widget} />
        )
      })}
    </div>
  )
}