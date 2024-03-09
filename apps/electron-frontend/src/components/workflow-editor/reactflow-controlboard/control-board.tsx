/**
 * @fileoverview ControlBoard component
 * - ControlBoard component is a wrapper for the control board of the workflow editor
 * - It read appstate nodes and controlboard data to render the control board, follow rules write in "./readme.md"
 */
import { useAppStore } from "@comflowy/common/store";
import styles from "./control-board.module.scss";
import { useEffect } from "react";
import { ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
export function ControlBoard() {
  const nodes = useAppStore(st => st.nodes);
  const controlboardConfig = useAppStore(st => st.controlboard);
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); // Assuming you have a setter for controlboard in your store

  useEffect(() => {
    if (controlboardConfig === null && nodes) {
      // Create controlboard info based on nodes
      const newControlboardConfig = ControlBoardUtils.createControlboardInfoFromNodes(nodes); // Assuming you have a function to create controlboard info
      onChangeControlBoard(newControlboardConfig);
    }
  }, [controlboardConfig, nodes]);
  
  return (
    <div className={styles.controlboard}>
      <div className="control-board-main">

      </div>
      <div className="control-board-actions">

      </div>
    </div>
  )
}