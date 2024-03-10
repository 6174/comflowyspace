/**
 * @fileoverview ControlBoard component
 * - ControlBoard component is a wrapper for the control board of the workflow editor
 * - It read appstate nodes and controlboard data to render the control board, follow rules write in "./readme.md"
 */
import {type Node} from "reactflow";
import { useAppStore } from "@comflowy/common/store";
import styles from "./controlboard.module.scss";
import { ControlBoardNodeConfig, ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { InputContainer } from "../reactflow-input/reactflow-input-container";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import { getWidgetIcon } from "../reactflow-node/reactflow-node-icons";
import { NodeError } from "../reactflow-node/reactflow-node";
import { Button, Space } from "antd";

export function ControlBoard() {
  const nodes = useAppStore(st => st.nodes);
  const controlboardConfig = useAppStore(st => st.controlboard);
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); // Assuming you have a setter for controlboard in your store
  const doNotHaveConfig = !controlboardConfig;

  console.log("controlboardConfig", controlboardConfig);
  const nodesToRenderHere: ControlBoardNodeProps[] = [];

  /**
   * if do not have config: 
   *  - render all nodes
   * else:
   *  - render all nessessary nodes
   */
  if (doNotHaveConfig) { 
    ControlBoardUtils.autoSortNodes(nodes).forEach(node => {
      nodesToRenderHere.push({
        node
      });
    })
  } else {
    (controlboardConfig?.nodes || []).forEach(nodeControl => {
      const node = nodes.find(n => n.id === nodeControl.id);
      if (node) {
        nodesToRenderHere.push({
          nodeControl,
          node
        })
      }
    });
  }
  
  return (
    <div className={styles.controlboard}>
      <div className="control-board-main">
        {nodesToRenderHere.map(props => <ControlBoardNode {...props} key={props.node.id}/>)}
      </div>
      <div className="control-board-actions">
        <Space>
          <Button>Setting</Button>
          <Button>Share</Button>
        </Space>
      </div>
    </div>
  )
}

type ControlBoardNodeProps = {
  nodeControl?: ControlBoardNodeConfig;
  node: Node,
}

export function ControlBoardNode({nodeControl, node}: ControlBoardNodeProps) {
  const {id, title, params, widget} = getNodeRenderInfo(node as any);
  const progressBar = useAppStore(st => st.nodeInProgress?.id === id ? st.nodeInProgress.progress : undefined);
  const imagePreviews = useAppStore(st => st.graph[id]?.images || []);
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
  if (paramsToRender.length === 0) {
    return null;
  }
  return (
    <div className={`${nodeStyles.reactFlowNode} control-node`}>
      <div className="node-header">
        <div className="node-title">
          <h2 className="node-title">
            {getWidgetIcon(widget)}
            {title}
            {isPositive && <span>{"("}Positive{")"}</span>}
            {isNegative && <span>{"("}Negative{")"}</span>}
            <NodeError nodeError={nodeError} />
          </h2>
        </div>
        <div className="node-control"></div>
      </div>
      {paramsToRender.map(({ property, input }) => (
        <InputContainer key={property} name={property} id={node.id} node={node.data.value} input={input} widget={widget} />
      ))}
    </div>
  )
}