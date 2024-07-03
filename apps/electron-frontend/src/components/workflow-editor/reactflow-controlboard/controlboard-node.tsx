import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { InputContainer } from "../reactflow-input/reactflow-input-container";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import { getWidgetIcon } from "../reactflow-node/reactflow-node-icons";
import { NodeError } from "../reactflow-node/reactflow-node-errors";
import { type Node, useReactFlow } from "reactflow";
import { useAppStore } from "@comflowy/common/store";
import { ControlBoardNodeProps, WorkflowNodeRenderInfo } from "@comflowy/common/types";
import React from "react";
import { ReactFlowNodeDynamic } from "../reactflow-node/reactflow-node-dynamic";

export const ControlBoardNode = React.memo(({ nodeControl, node }: ControlBoardNodeProps) => {
  const id = node.id;
  const renderInfo = getNodeRenderInfo({id: node.id, ...node.data.value}, node.data.widget);
  const { title, params, widget } = renderInfo;
  const isPositive = useAppStore(st => st.graph[id]?.isPositive);
  const isNegative = useAppStore(st => st.graph[id]?.isNegative);
  const imagePreviews = useAppStore(st => st.graph[id]?.images || []);
  const nodeError = useAppStore(st => st.promptError?.node_errors[id]);
  const controlFields = nodeControl?.fields;

  const paramsToRender = params.filter(param => {
    if (!controlFields) {
      return true;
    }
    return controlFields.includes(param.property);
  });
  if ((nodeControl && !nodeControl?.select) || paramsToRender.length === 0) {
    return null;
  }
  return (
    <div className={`${nodeStyles.reactFlowNode} control-node`}>
      <NodeHeader
        widget={widget}
        title={title}
        isPositive={isPositive}
        isNegative={isNegative}
        node={node as any}
        nodeError={nodeError}
      />
      {paramsToRender.map(({ property, input }) => (
        <InputContainer key={property} name={property} id={node.id} node={node.data.value} input={input} widget={widget} />
      ))}
      <ReactFlowNodeDynamic node={node} renderInfo={renderInfo} imagePreviews={imagePreviews}/>
    </div>
  )
});

export const NodeHeader = React.memo(({ widget, title, isPositive, isNegative, node, nodeError }: Partial<WorkflowNodeRenderInfo> & { node: Node, nodeError: any, isPositive?: boolean, isNegative?: boolean }) => {
  const { setCenter } = useReactFlow();
  return (
    <div className="node-header">
      <div className="node-title action" onClick={ev => {
        setCenter(node.position.x + (node.width || 100) / 2, node.position.y + (node.height || 100) / 2, {
          zoom: 1,
          duration: 800
        })
        ev.preventDefault();
      }}>
        <div className="inner">
          {getWidgetIcon(widget)}
          {title}
          {isPositive && <span>{"("}Positive{")"}</span>}
          {isNegative && <span>{"("}Negative{")"}</span>}
          <NodeError nodeError={nodeError} />
        </div>
      </div>
      <div className="node-control"></div>
    </div>
  )
});

export function LocatableNodeTitle({ title, node }: { title: string, node: Node }) {
  const { setCenter } = useReactFlow();
  return (
    <span className="node-title action" onClick={ev => {
      setCenter(node.position.x + (node.width || 100) / 2, node.position.y + (node.height || 100) / 2, {
        zoom: 1,
        duration: 800
      })
      ev.preventDefault();
    }}>
      {title}
    </span>
  )
}