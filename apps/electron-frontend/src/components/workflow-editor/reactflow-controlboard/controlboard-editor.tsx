import { useAppStore } from "@comflowy/common/store";
import { ControlBoardNodeProps, ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Button, Modal } from "antd";
import { useCallback, useEffect, useState } from "react";

import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import styles from "./controlboard.module.scss";
/**
 * @description Editor entry for the control board config data
 */
export function EditControlBoardEntry() {
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = useCallback(e => {
    console.log(e);
    setVisible(false);
  }, [setVisible]);

  return (
    <>
      <Modal 
        title="Edit Control Board"
        open={visible}
        onOk={handleOk}
        okText={"Save"}
        onCancel={handleCancel}
      >
        <EditControlBoard/>
      </Modal>
      <Button size="small" onClick={showModal}>Settings</Button>
    </>
  )
}

/**
 * The Control Båoard Config Editor
 * @returns 
 */
function EditControlBoard() {
  const nodes = useAppStore(st => st.nodes);
  const controlboardConfig = useAppStore(st => st.controlboard);
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); // Assuming you have a setter for controlboard in your store
  const [allNodes, setAllNodes] = useState<ControlBoardNodeProps[]>([]);

  useEffect(() => {
    let newAllNodes = ControlBoardUtils.autoSortNodes(nodes).map(node => {
      return {
        node
      } as ControlBoardNodeProps;
    });
    if (controlboardConfig) {
      const nodesWithControl = ControlBoardUtils.getNodesToRender(controlboardConfig, nodes);
      const otherNodes = allNodes.filter(an => !nodesWithControl.find(n => n.node.id === an.node.id)) 
      newAllNodes = [...nodesWithControl, ...otherNodes];
    }
    setAllNodes(newAllNodes);
  }, [nodes, controlboardConfig]);

  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const moveNode = useCallback((dragIndex: number, hoverIndex: number) => {
    const newAllNodes = [...allNodes];
    const dragNode = newAllNodes[dragIndex]
    setDraggingNode(dragNode.node.id);
    newAllNodes.splice(dragIndex, 1)
    newAllNodes.splice(hoverIndex, 0, dragNode)
    setAllNodes(newAllNodes);
  }, [allNodes]);

  return (
    <div className={styles.editControlboard}>
      <DndProvider backend={HTML5Backend}>
        {allNodes && allNodes.map((n, i) => (
          <>
            {/* <DropTarget index={i} moveNode={moveNode} /> */}
            <DraggableControlNodeConfigItem setDraggingNode={setDraggingNode} draggingNodeId={draggingNode} data={n} id={n.node.id} key={n.node.id} index={i} moveNode={moveNode} />
          </>
        ))}
        {/* <DropTarget index={allNodes.length} moveNode={moveNode} /> */}
      </DndProvider>
    </div>
  )
}

function DraggableControlNodeConfigItem({ id, index, moveNode, draggingNodeId, setDraggingNode, data }: {
  id: string,
  draggingNodeId: string | null,
  index: number,
  moveNode: (dragIndex: number, hoverIndex: number) => void,
  setDraggingNode: (id: string | null) => void,
  data: ControlBoardNodeProps
}) {
  const { title, params, widget } = getNodeRenderInfo(data.node as any);
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'node',
    item: () => ({ id, index }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      setDraggingNode(null);
    }
  })

  const [, drop] = useDrop({
    accept: 'node',
    hover(item: any, monitor: any) {
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      moveNode(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
  })

  return (
    <div 
        className={`control-node ${(isDragging || draggingNodeId === id) ? "dragging" : ""}`} 
        ref={node => {
          drag(drop(node));
          preview(node);
        }}
      >
      node: {title} {isDragging ? "Dragging" : ""}
    </div>
  )
}


/**
 * drop target in node gap
 * @param param0 
 * @returns 
 */
function DropTarget({ index, moveNode }: any) {
  const [dropHover, setDropHover] = useState(false);
  const [, drop] = useDrop({
    accept: 'node',
    hover: (item: any) => {
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      moveNode(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
    drop(item: any, monitor: any) {
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      moveNode(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
  })

  return (
    <div ref={drop} className="control-node-drop-target" />
  )
}