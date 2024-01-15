import { SDNode, Widget } from "@comflowy/common/comfui-interfaces";
import { XYPosition } from "reactflow";
import styles from "./widget-tree.style.module.scss";
import { WidgetTree } from "./widget-tree";
import { useEffect, useState } from "react";
export interface WidgetTreeOnPanelContext {
  position: XYPosition,
  sourceConnection?: any,
  filter: (widget: Widget) => boolean,
  showCategory: boolean,
  onNodeCreated?: () => void
}

export const WidgetTreeOnPanel = (props: {
  context: WidgetTreeOnPanelContext
}) => {
  const context = props.context;
  const [id, setId] = useState(0);
  useEffect(() => {
    setId(id + 1);
  }, [context]);

  if (!context) {
    return null;
  }
  
  return (
    <div className={`${styles.widgetTreeOnPanel} ant-popover`} style={{
      left: context.position.x,
      top: context.position.y
    }}>
      <div className="ant-popover-inner">
        <WidgetTree 
          autoFocus={true}
          position={{
            x: context.position.x + 20,
            y: context.position.y + 20
          }} 
          onNodeCreated={context.onNodeCreated}
          id={id} 
          filter={context.filter} 
          showCategory={context.showCategory} 
          />
      </div>
    </div>
  )
}