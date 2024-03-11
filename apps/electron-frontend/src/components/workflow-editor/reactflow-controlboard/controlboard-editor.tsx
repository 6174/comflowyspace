import { useAppStore } from "@comflowy/common/store";
import { ControlBoardNodeConfig, ControlBoardNodeProps, ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { NodeRenderInfo, getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Button, Checkbox, Modal, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import styles from "./controlboard.module.scss";
import { ControlBoardNode, NodeHeader } from "./controlboard-node";
import { DragIcon } from "ui/icons";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import {Node} from "reactflow";

/**
 * The Control Båoard Config Editor
 * @returns 
 */
export function EditControlBoard() {
  const nodes = useAppStore(st => st.nodes);
  const controlboardConfig = useAppStore(st => st.controlboard);
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
      <div className="control-board-main">
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
      <div className="control-board-actions">
        <Space>
          <Button size="small" type="primary"> Done </Button>
        </Space>
      </div>
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
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); 
  const controlboardConfig = useAppStore(st => st.controlboard);
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

  const isPositive = useAppStore(st => st.graph[id]?.isPositive);
  const isNegative = useAppStore(st => st.graph[id]?.isNegative);
  const nodeError = useAppStore(st => st.promptError?.node_errors[id]);
  const controlFields = data.nodeControl?.fields;

  return (
    <div className={`editable-control-node-wrapper ${(isDragging || draggingNodeId === id) ? "dragging" : ""}`} 
        ref={node => {
          drop(node);
          preview(node);
        }}
      >
      <div className="dragger action" ref={node => {
        drag(node);
      }}>
        <DragIcon/>
      </div>
      <Checkbox onChange={(e) => {
        console.log("changed me");
      }}/>
      <div className={`${nodeStyles.reactFlowNode} editable-control-node`}>
        <NodeHeader
          widget={widget}
          title={title}
          isPositive={isPositive}
          isNegative={isNegative}
          node={data.node}
          nodeError={nodeError}
        />
        <NodeControlParamsEditor params={params} node={data.node} nodeControl={data.nodeControl} onChangeNodeControl={(newCtrl) => {
          onChangeControlBoard({
            ...controlboardConfig,
            nodes: controlboardConfig?.nodes.map(n => n.id === id ? newCtrl : n) || []
          });
        }} />
      </div>
    </div>
  )
}


function NodeControlParamsEditor({ params, node, nodeControl, onChangeNodeControl }: { nodeControl: ControlBoardNodeConfig, params: NodeRenderInfo['params'], node: Node, onChangeNodeControl: (cfg: ControlBoardNodeConfig) => void }) {
  // checked = { nodeControl?.fields.includes(property) }
  return (
    <div className="node-control-params">
      {params.map(({ property, input }) => (
        <div key={property} className="param">
          <Checkbox onChange={ev => { }}>{property}</Checkbox>
        </div>
      ))}
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