/**
 * @fileoverview ControlBoard component
 * - ControlBoard component is a wrapper for the control board of the workflow editor
 * - It read appstate nodes and controlboard data to render the control board, follow rules write in "./readme.md"
 */
import { useAppStore } from "@comflowy/common/store";
import styles from "./controlboard.module.scss";
import { ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { Button, Space } from "antd";
import { EditControlBoard } from "./controlboard-editor";
import { useState } from "react";
import { ControlBoardNode } from "./controlboard-node";

export function ControlBoard() {
  const nodes = useAppStore(st => st.nodes);
  const controlboardConfig = useAppStore(st => st.controlboard);
  const graph = useAppStore(st => st.graph);

  const nodesToRenderHere = ControlBoardUtils.getNodesToRender(controlboardConfig, nodes, graph);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditControlBoard onFinish={() => {
      setEditing(false);
    }}/> 
  }

  return (
    <div className={styles.controlboard}>
      <div className="control-board-main">
        {nodesToRenderHere.map(props => <ControlBoardNode {...props} key={props.node.id} />)}
      </div>
      <div className="control-board-actions">
        <Space>
          <Button size="small" onClick={ev => {
            setEditing(true);
          }}>Edit</Button>
          <Button size="small" disabled>Share</Button>
        </Space>
      </div>
    </div>
  )
}

