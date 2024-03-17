/**
 * Rendering flow type node
 */
import { ComfyUINodeError, PreviewImage, SDNODE_DEFAULT_COLOR, SDNode, SubflowNodeWithControl, Widget, getSubflowFieldId, getSubflowSlotId } from "@comflowy/common/types";
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
  const {title, id, nodesWithControl} = useSubflowNodeRenderingInfo(node);
  const { mainRef, minHeight, minWidth, setResizing } = useNodeAutoResize(node, imagePreviews);

  const isInProgress = false;

  let nodeColor = node.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;
  const transform = useAppStore(st => st.transform);
  const invisible = transform < 0.2;

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

      {!invisible ? (
        <div className="node-inner">
          <div className="node-header">
            <h2 className="node-title">
              {title}
              <NodeError nodeError={nodeError} />
            </h2>
          </div>
          <div className="node-main" ref={mainRef}>
            <SubflowSlots nodesWithControl={nodesWithControl}/>
            <SubflowParams nodesWithControl={nodesWithControl} subflowNode={node}/>
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

export function SubflowSlots({ nodesWithControl }: {
  nodesWithControl: SubflowNodeWithControl[]
}) {
  const inputs = nodesWithControl.reduce((acc, {inputs, title, id}) => {
    return [...acc, ...inputs.map(input => {
      return {
        ...input, 
        id: getSubflowSlotId(id, input.name),
        name: `${title}:${input.name}`
      }
    })]
  }, []);
  const outputs = nodesWithControl.reduce((acc, { outputs, title, id }) => {
    return [...acc, ...outputs.map(output => {
      return {
        ...output,
        id: getSubflowSlotId(id, output.name),
        name: `${title}:${output.name}`
      }
    })];
  }, []);
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

export function SubflowParams({ nodesWithControl, subflowNode, onChangeHandler }: {
  nodesWithControl: SubflowNodeWithControl[];
  subflowNode: NodeProps<{
    value: SDNode
  }>
  onChangeHandler?: (val, fieldName) => void;
}) {
  const fieldValues = useAppStore((st) => st.graph[subflowNode.id]?.fields || {});
  // console.log(fieldValues);
  const params = nodesWithControl.reduce((acc, { sdnode, params, title, id, widget}) => {
    return [...acc, ...params.map(param => {
      return {
        param,
        sdnode,
        title,
        widget,
        id
      }
    })]
  }, []);
  const onNodeFieldChange = useAppStore((st) => st.onNodeFieldChange);
  const _onChangeHandler = onChangeHandler || useCallback((val: any, fieldName: string) => onNodeFieldChange(subflowNode.id, fieldName, val), [onNodeFieldChange])
  return (
    <div className="node-params">
      {params.map(({ param, sdnode, title, id, widget }) => {
        const realFieldName = getSubflowFieldId(id, param.property);
        const visibleName = `${title}:${param.property}`
        return (
          <InputContainer
            key={realFieldName}
            name={visibleName}
            id={id}
            value={fieldValues[realFieldName]}
            node={sdnode}
            input={param.input}
            onChange={(val) => {
              _onChangeHandler(val, realFieldName);
            }}
            widget={widget} />
        )
      })}
    </div>
  )
}