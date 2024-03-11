import { ControlBoardNodeConfig, ControlBoardNodeProps, ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { NodeRenderInfo, getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { InputContainer } from "../reactflow-input/reactflow-input-container";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import { getWidgetIcon } from "../reactflow-node/reactflow-node-icons";
import { NodeError } from "../reactflow-node/reactflow-node";
import { useStoreApi, type Node, useReactFlow } from "reactflow";
import { useAppStore } from "@comflowy/common/store";
import { Checkbox } from "antd";

export function ControlBoardNode({ nodeControl, node, onChangeNodeControl }: ControlBoardNodeProps) {
  const { id, title, params, widget } = getNodeRenderInfo(node as any);
  const isPositive = useAppStore(st => st.graph[id]?.isPositive);
  const isNegative = useAppStore(st => st.graph[id]?.isNegative);
  const nodeError = useAppStore(st => st.promptError?.node_errors[id]);
  const controlFields = nodeControl?.fields;

  const paramsToRender = params.filter(param => {
    if (!controlFields) {
      return true;
    }
    return controlFields.includes(param.property);
  });
  if (!nodeControl || !nodeControl?.select || paramsToRender.length === 0) {
    return null;
  }
  return (
    <div className={`${nodeStyles.reactFlowNode} control-node`}>
      <NodeHeader
        widget={widget}
        title={title}
        isPositive={isPositive}
        isNegative={isNegative}
        node={node}
        nodeError={nodeError}
      />
      {paramsToRender.map(({ property, input }) => (
        <InputContainer key={property} name={property} id={node.id} node={node.data.value} input={input} widget={widget} />
      ))}
    </div>
  )
}

export function NodeHeader({ widget, title, isPositive, isNegative, node, nodeError }: Partial<NodeRenderInfo> & { node: Node, nodeError: any, isPositive?: boolean, isNegative?: boolean }) {
  const { setCenter } = useReactFlow();
  return (
    <div className="node-header">
      <div className="node-title">
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
      </div>
      <div className="node-control"></div>
    </div>
  )
}