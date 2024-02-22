import { PanelContainerProps } from "./panel.types";
import styles from "./panel-container.module.scss";
import { use, useEffect, useRef, useState } from "react";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { AsyncComflowyConsole } from "../comflowy-console/comflowy-console-async";

/**
 * PanelContainer
 * 1) panels container 's layout struture :
 *   - main-content: the main content area
 *   - spliter: the spliter between main content and panels
 *   - panels: panels in tabs
 * 2) It's a flexbox layout structure 
 *   - main-content: flex 1 
 *   - panel-spliter: fixed width
 *   - panels: dynamic-width
 */
export function PanelsContainer(props: PanelContainerProps) {
  const draggerRef = useRef<HTMLDivElement>();
  const mainRef = useRef<HTMLDivElement>();
  const panelsRef = useRef<HTMLDivElement>();
  const [panelsVisible, setPanelsVisible] = useState(readPanelVisibleFromLocalStorage());
  const [panelWidth, setPanelWidth] = useState(readPanelWidthFromLocalStorage());
  const onChangePanelWidth = (width: number) => {
    setPanelWidthToLocalStorage(width);
    setPanelWidth(width);
  }

  useEffect(() => {
    const dragger = draggerRef.current;
    if (!dragger) {
      return;
    }
    const onMousedown = (e) => {
      const startX = e.clientX;
      const mainContent = mainRef.current;
      const panels = panelsRef.current;

      const startWidth = panels.offsetWidth;
      const maxWidth = window.innerWidth - 200; // 计算最大宽度
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        let newWidth = startWidth - dx;
        newWidth = Math.max(newWidth, 200);
        newWidth = Math.min(newWidth, maxWidth);
        onChangePanelWidth(newWidth);
      }
      
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }
    dragger.addEventListener("mousedown", onMousedown)
    return () => {
      dragger.removeEventListener("mousedown", onMousedown)
    }
  }, [draggerRef, panelsVisible])

  const [activePanel, setActivePanel] = useState(props.panels[0]?.id);

  useEffect(() => {
    const key = getPanelKey("panel-visible");
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        const visible = readPanelVisibleFromLocalStorage();
        setPanelsVisible(visible);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.active_panel_changed) {
        setActivePanel(ev.data.id);
        if (!panelsVisible) {
          setPanelsVisible(true);
        }
      }
    });
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      disposable.dispose();
    };
  }, [panelsVisible]);


  return (
    <div className={styles.panelsWrapper}>
      <div className="main-content box" ref={mainRef}>
        {props.children}
      </div>
      {panelsVisible && (
        <>
          <div className="gap" ref={draggerRef}>
          </div>
          <div className="panels box" ref={panelsRef} style={{
            width: panelWidth
          }}>
            <AsyncComflowyConsole />
          </div>
        </>
      )}
    </div>
  )
}

export function readPanelWidthFromLocalStorage() {
  const panelKey = getPanelKey("panel-width");
  try {
    const width = localStorage.getItem(panelKey);
    if (width) {
      return Number(width);
    } else {
      return 200;
    }
  } catch(err) {
    return 200;
  }
} 

export function setPanelWidthToLocalStorage(panelWidth: number) {
  const panelKey = getPanelKey("panel-width");
  try {
    localStorage.setItem(panelKey, panelWidth.toString());
  } catch(err) {
    console.log(err);
  }
}

export function readPanelVisibleFromLocalStorage() {
  const panelKey = getPanelKey("panel-visible");
  try {
    const visible = localStorage.getItem(panelKey);
    return visible === "true";
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function setPanelVisibleToLocalStorage(visible: boolean) {
  const panelKey = getPanelKey("panel-visible");
  try {
    localStorage.setItem(panelKey, visible ? "true" : "false");
  } catch (err) {
    console.log(err);
  }
}

function getPanelKey(prefix: string): string {
  let pathname = document.location.pathname + document.location.hash;
  if (['/', '/templates', '/models', '/tutorials', '/extensions'].some(key => pathname === key)) {
    pathname = 'workspace'
  }
  const key = `${prefix}-${pathname}`;
  return key;
}
