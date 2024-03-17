import { useAppStore } from "@comflowy/common/store";
import {ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Button, Checkbox, Modal, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import styles from "./controlboard.module.scss";
import { NodeHeader } from "./controlboard-node";
import { DragIcon } from "ui/icons";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import {Node} from "reactflow";
import _ from "lodash";
import { ControlBoardConfig, ControlBoardNodeConfig, ControlBoardNodeProps, WorkflowNodeRenderInfo } from "@comflowy/common/types";

/**
 * The Control Board Config Editor
 * @returns 
 */
export function EditControlBoard(props: {onFinish: () => void}) {
  const nodes = useAppStore(st => st.nodes);
  const [allNodes, setAllNodes] = useState<ControlBoardNodeProps[]>([]);
  
  /**
   * editing controlboard data state
   *  */ 
  const savedControlBoardData = useAppStore(st => st.controlboard);
  const [controlboardData, setControlBoardData] = useState<ControlBoardConfig | null>(savedControlBoardData);
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); 
  const triggerChangeControlBoardData = useCallback(async (data: ControlBoardConfig) => {
    setControlBoardData(data);
    console.log("change control data order", data)
    onChangeControlBoard(data);
  }, []);

  // auto update controlboard data from SSOT Source
  useEffect(() => {
    setControlBoardData(controlboardData);
  }, [savedControlBoardData]);

  useEffect(() => {
    let allNodes = ControlBoardUtils.autoSortNodes(nodes).map(node => {
      return {
        node
      } as unknown as ControlBoardNodeProps;
    });
    if (controlboardData) {
      const nodesWithControl = ControlBoardUtils.getNodesToRender(_.cloneDeep(controlboardData), nodes);
      const otherNodes = allNodes.filter(an => !nodesWithControl.find(n => n.node.id === an.node.id)) 
      const newAllNodes = [...nodesWithControl, ...otherNodes];
      setAllNodes(newAllNodes);
      if (otherNodes.length > 0) {
        setControlBoardData({
          nodes: [
            ...controlboardData.nodes,
            ...otherNodes.map(n => {
              return {
                id: n.node.id,
                fields: [],
                select: false
              }
            })
          ]
        })
      }
    } else {
      setControlBoardData(ControlBoardUtils.createControlboardInfoFromNodes(allNodes.map(n => n.node)));
      setAllNodes(allNodes);
    }
  }, [nodes, controlboardData]);

  console.log("control board Data", allNodes);

  /**
   * Drag Move Logic
   */
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const moveNode = useCallback((dragIndex: number, hoverIndex: number) => {
    const newAllNodes = [...allNodes];
    const dragNode = newAllNodes[dragIndex]
    setDraggingNode(dragNode.node.id);
    newAllNodes.splice(dragIndex, 1)
    newAllNodes.splice(hoverIndex, 0, dragNode)
    setAllNodes(newAllNodes);

    const controlData = {
      nodes: newAllNodes.filter(n => n.nodeControl).map(n => n.nodeControl)
    } as ControlBoardConfig;

    triggerChangeControlBoardData(controlData);

  }, [allNodes]);

  return (
    <div className={styles.editControlboard}>
      <div className="control-board-main">
        <DndProvider backend={HTML5Backend}>
          {allNodes && allNodes.map((n, i) => (
            <DraggableControlNodeConfigItem 
              setDraggingNode={setDraggingNode} 
              draggingNodeId={draggingNode} 
              data={n} 
              id={n.node.id} 
              key={`${n.node.id}-${i}`} 
              index={i} 
              moveNode={moveNode}
              controlboardData={controlboardData}
              onChangeControlBoard={triggerChangeControlBoardData} />
          ))}
          {/* <DropTarget index={i} moveNode={moveNode} /> */}
          {/* <DropTarget index={allNodes.length} moveNode={moveNode} /> */}
        </DndProvider>
      </div>
      <div className="control-board-actions">
        <Space>
          <Button size="small" type="primary" onClick={(ev) => {
            props.onFinish();
          }}> Done </Button>
        </Space>
      </div>
    </div>
  )
}

function DraggableControlNodeConfigItem({ 
  id, 
  index, 
  moveNode, 
  draggingNodeId, 
  setDraggingNode, 
  data, 
  onChangeControlBoard,
  controlboardData
}: {
  id: string,
  draggingNodeId: string | null,
  index: number,
  moveNode: (dragIndex: number, hoverIndex: number) => void,
  setDraggingNode: (id: string | null) => void,
  data: ControlBoardNodeProps,
  onChangeControlBoard: (data: ControlBoardConfig) => void,
  controlboardData: ControlBoardConfig
}) {
  const { title, params, widget } = getNodeRenderInfo(data.node.data.value, data.node.data.widget);
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

  if (params.length === 0) {
    return <></>
  }

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
      <Checkbox checked={data.nodeControl && data.nodeControl.select } onChange={(e) => {
        const checked = e.target.checked;
        const newControlData = _.cloneDeep(controlboardData);
        const node = newControlData.nodes.find(n => n.id === id);
        node.select = checked;
        if (!checked) {
          node.fields = [];
        } else {
          const {fields} = ControlBoardUtils.createControlboardInfoFromNode(data.node);
          node.fields = fields;
        }
        onChangeControlBoard(newControlData)
      }}/>
      <div className={`${nodeStyles.reactFlowNode} editable-control-node`}>
        <NodeHeader
          widget={widget}
          title={title}
          isPositive={isPositive}
          isNegative={isNegative}
          node={data.node}
          nodeError={null}
        />
        <NodeControlParamsEditor params={params} node={data.node} nodeControl={data.nodeControl} onChangeNodeControl={(newNodeCtrl) => {
          const newControlData = _.cloneDeep(controlboardData);
          const node = newControlData.nodes.find(n => n.id === id);
          node.fields = newNodeCtrl.fields;
          node.select = newNodeCtrl.select;
          onChangeControlBoard(newControlData);
        }} />
      </div>
    </div>
  )
}


function NodeControlParamsEditor({ 
  params,
  node, 
  nodeControl, 
  onChangeNodeControl,
}: { nodeControl: ControlBoardNodeConfig, params: WorkflowNodeRenderInfo['params'], node: Node, onChangeNodeControl: (cfg: ControlBoardNodeConfig) => void }) {
  return (
    <div className="node-control-params">
      {params.map(({ property, input }) => (
        <div key={property} className="param">
          <Checkbox checked={nodeControl?.fields.includes(property)} onChange={ev => {
            const checked = ev.target.checked;
            const newControl = _.cloneDeep(nodeControl);
            if (checked) {
              newControl.fields.push(property);
              newControl.select = true;
            } else {
              newControl.fields = newControl.fields.filter(f => f !== property);
              if (newControl.fields.length === 0) {
                newControl.select = false;
              }
            }
            onChangeNodeControl(newControl);
          }}>{property}</Checkbox>
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