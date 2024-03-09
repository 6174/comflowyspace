/**
 * @fileoverview ControlBoard component
 * - ControlBoard component is a wrapper for the control board of the workflow editor
 * - It read appstate nodes and controlboard data to render the control board, follow rules write in "./readme.md"
 */
import {type Node} from "reactflow";
import { useAppStore } from "@comflowy/common/store";
import styles from "./control-board.module.scss";
import { useEffect } from "react";
import { ControlBoardNodeConfig, ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { InputContainer } from "../reactflow-input/reactflow-input-container";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import { getWidgetIcon } from "../reactflow-node/reactflow-node-icons";
import { ComfyUINodeError } from "@comflowy/common/comfui-interfaces/comfy-error-types";
import { PreviewImage } from "@comflowy/common/comfui-interfaces";
import { NodeError } from "../reactflow-node/reactflow-node";

export function ControlBoard() {
  const nodes = useAppStore(st => st.nodes);
  const controlboardConfig = useAppStore(st => st.controlboard);
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); // Assuming you have a setter for controlboard in your store

  useEffect(() => {
    if (!controlboardConfig && nodes.length > 0) {
      // Create controlboard info based on nodes
      const newControlboardConfig = ControlBoardUtils.createControlboardInfoFromNodes(nodes); // Assuming you have a function to create controlboard info
      onChangeControlBoard(newControlboardConfig);
    }
  }, [controlboardConfig, nodes]);
  
  console.log("controlboardConfig", controlboardConfig);
  const nodesToRenderHere: ControlBoardNodeProps[] = [];

  (controlboardConfig?.nodes || []).forEach(nodeControl => {
    const node = nodes.find(n => n.id === nodeControl.id);
    if (node) {
      nodesToRenderHere.push({
        nodeControl,
        node
      })
    }
  });
  
  return (
    <div className={styles.controlboard}>
      control board is here
      <div className="control-board-main">
        {nodesToRenderHere.map(props => <ControlBoardNode {...props} key={props.node.id}/>)}
      </div>
      <div className="control-board-actions">

      </div>
    </div>
  )
}

type ControlBoardNodeProps = {
  nodeControl: ControlBoardNodeConfig;
  node: Node,
}

export function ControlBoardNode({nodeControl, node}: ControlBoardNodeProps) {
  const {id, title, params, widget} = getNodeRenderInfo(node as any);
  const progressBar = useAppStore(st => st.nodeInProgress?.id === id ? st.nodeInProgress.progress : undefined);
  const imagePreviews = useAppStore(st => st.graph[id]?.images || []);
  const isPositive = useAppStore(st => st.graph[id]?.isPositive);
  const isNegative = useAppStore(st => st.graph[id]?.isNegative);
  const nodeError = useAppStore(st => st.promptError?.node_errors[id]);
  const {fields} = nodeControl;
  const paramsToRender = params.filter(param => {
    return fields.includes(param.property);
  });

  return (
    <div className={`${nodeStyles.reactFlowNode}`}>
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