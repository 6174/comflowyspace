import { useAppStore } from "@comflowy/common/store";
import { ControlBoardNodeProps, ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Button, Modal } from "antd";
import { useCallback, useState } from "react";

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
      <Button size="small" disabled onClick={showModal}>Settings</Button>
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
  const doNotHaveConfig = !controlboardConfig;
  let allNodes: ControlBoardNodeProps[] = ControlBoardUtils.autoSortNodes(nodes).map(node => {
    return {
      node
    } as ControlBoardNodeProps;
  });
  if (!doNotHaveConfig) {
    const nodesWithControl = ControlBoardUtils.getNodesToRender(controlboardConfig, nodes);
    const otherNodes = allNodes.filter(an => !nodesWithControl.find(n => n.node.id === an.node.id)) 
    allNodes = [...nodesWithControl, ...otherNodes];
  }

  return (
    <div className="edit-control-board">
      {allNodes.map(n => <DraggableControlNodeConfigItem {...n} key={n.node.id}/>)}
    </div>
  )
}

function DraggableControlNodeConfigItem(props: ControlBoardNodeProps) {
  const { id, title, params, widget } = getNodeRenderInfo(props.node as any);
  return (
    <div className="draggable-control-node-config-item">
      node: {title}
    </div>
  )
}