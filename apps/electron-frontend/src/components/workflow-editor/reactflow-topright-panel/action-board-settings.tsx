import { useAppStore } from "@comflowy/common/store";
import { Popover, Radio, Space } from "antd";
import { useCallback, useState } from "react";
import { SettingsIcon } from "ui/icons";
import styles from "./action-board-settings.module.scss";
import MenuStyles from "../reactflow-context-menu/reactflow-context-menu.module.scss";
export function ActionBoardSettingEntry() {
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
    <Popover
      title={null}
      content={<BoardSettings/>}
      trigger="click"
      arrow={false}
      overlayClassName={MenuStyles.reactflowContextMenu + " " + MenuStyles.reactflowPopoverMenuNoPadding}
      align={{ offset: [0, 10] }}
      placement="bottomRight"
      onOpenChange={(visible) => setVisible(visible)}
    >
      <div className="action action-settings" onClick={ev => {
        ev.preventDefault();
        showModal();
      }}>
        <SettingsIcon/>
      </div>
    </Popover>
  )
}

function BoardSettings() {
  const edgeType = useAppStore(st => st.edgeType || 'bezier');
  const onChangeEdgeType = useAppStore(st => st.onChangeEdgeType);
  return (
    <div className={styles.boardSettings}>
      <div className="change-edge-type setting-item">
        <div className="setting-title">Edge Style</div>
        <div className="setting-content">
          <Radio.Group size="small" value={edgeType} onChange={(e) => onChangeEdgeType(e.target.value)}>
            <Radio.Button value="straight">Straight</Radio.Button>
            <Radio.Button value="step">Step</Radio.Button>
            <Radio.Button value="smoothstep">SmoothStep</Radio.Button>
            <Radio.Button value="bezier">Bezier</Radio.Button>
          </Radio.Group>
        </div>
      </div>
    </div>
  )
}