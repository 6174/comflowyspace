import { PanelContainerProps } from "./panel.types";
import styles from "./panel-container.module.scss";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { AsyncComflowyConsole } from "../comflowy-console/comflowy-console-async";
import { Tabs, TabsProps } from "antd";
import { isWindow } from "ui/utils/is-window";
import { useDashboardState } from "@comflowy/common/store/dashboard-state";
import { useRouter } from "next/router";
import { KEYS, t } from "@comflowy/common/i18n";
import { ControlBoard } from "../workflow-editor/reactflow-controlboard/controlboard";
import { ReactFlowShare } from "../workflow-editor/reactflow-share/reactflow-share";

export function PanelsContainerServerAdapter(props: PanelContainerProps) {
  const [visible, setVisible] = useState(false);
  const { bootstraped } = useDashboardState();
  const router = useRouter();
  const isApp = router.pathname === "/app";
  useEffect(() => {
    if (isWindow) {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return (
      <div className="">
        loading...
      </div>
    )
  }

  // app page use different container
  if (isApp) {
    return <>{props.children}</>;
  }

  if (!isApp && !bootstraped) {
    return (
      <>
        {props.children}
      </>
    )
  }

  return <PanelsContainer {...props} isAppPage={false}/>
}

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
  const localState = readPanelStateFromLocalStorage();
  const [panelsVisible, setPanelsVisible] = useState(localState.panelsVisible);
  const [panelWidth, setPanelWidth] = useState(localState.panelWidth);
  const [activePanel, setActivePanel] = useState(localState.activePanel);
  const onChangePanelWidth = (width: number) => {
    setPanelStateToLocalStorage({panelWidth: width});
    setPanelWidth(width);
  }

  useEffect(() => {
    const dragger = draggerRef.current;
    if (!dragger || !panelsVisible) {
      return;
    }
    const onMousedown = (e) => {
      const startX = e.clientX;
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

  const onPannelVisibleChange = useCallback((visible: boolean) => {
    setPanelsVisible(visible);
    setPanelStateToLocalStorage({
      panelsVisible: visible
    })
  }, [])

  useEffect(() => {
    const key = getPanelKey("panel-visible");
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        const {panelsVisible} = readPanelStateFromLocalStorage();
        setPanelsVisible(panelsVisible);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.active_panel_changed) {
        setActivePanel(ev.data.panel);
        if (!panelsVisible) {
          onPannelVisibleChange(true)
        }
      }

      if (ev.type === GlobalEvents.toggle_panel_container) {
        onPannelVisibleChange(!panelsVisible);
        if (ev.data?.panel) {
          setActivePanel(ev.data?.panel);
        }
      }
    });

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      disposable.dispose();
    };
  }, [panelsVisible]);


  let items: TabsProps['items'] = [];

  if (props.isAppPage) {
    items = [
      {
        key: "controlboard",
        label: t(KEYS.controlboard),
        children: <ControlBoard />
      },
      {
        key: 'messages',
        label: t(KEYS.notifications),
        children: <AsyncComflowyConsole />,
      },
    ]
    if (process.env.NEXT_PUBLIC_FG_ENABLE_SUBFLOW === "enabled") {
      items.push({
        key: "share",
        label: "Share",
        children: <ReactFlowShare/>
      });
    }
  } 

  const onChange = (key: string) => {
    setActivePanel(key);
    setPanelStateToLocalStorage({ activePanel: key });
  };

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
            <Tabs defaultActiveKey="controlboard" activeKey={activePanel} items={items} onChange={onChange} />
            <div className="close-action">
              <div className="action" onClick={ev => {
                onPannelVisibleChange(false);
              }}>
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.125 13.5049C6.125 14.0674 6.52051 14.4629 7.10059 14.4629H15.2832L17.1377 14.375L14.5537 16.7217L12.7695 18.5322C12.5938 18.708 12.4883 18.9453 12.4883 19.2178C12.4883 19.7539 12.8838 20.1494 13.4287 20.1494C13.6836 20.1494 13.9209 20.0439 14.1318 19.833L19.6953 14.2168C19.8447 14.0762 19.9414 13.9004 19.9854 13.707V19.3145C19.9854 19.8506 20.3896 20.2373 20.9346 20.2373C21.4707 20.2373 21.875 19.8506 21.875 19.3145V7.7041C21.875 7.15918 21.4707 6.76367 20.9346 6.76367C20.3896 6.76367 19.9854 7.15918 19.9854 7.7041V13.3027C19.9414 13.1094 19.8447 12.9336 19.6953 12.7842L14.1318 7.16797C13.9209 6.95703 13.6836 6.86035 13.4287 6.86035C12.8838 6.86035 12.4883 7.24707 12.4883 7.7832C12.4883 8.05566 12.5938 8.29297 12.7695 8.46875L14.5537 10.2793L17.1289 12.626L15.2832 12.5381H7.10059C6.52051 12.5381 6.125 12.9336 6.125 13.5049Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export type PanelContainerState = {
  activePanel?: string;
  panelWidth?: number;
  panelsVisible?: boolean;
}

export function readPanelStateFromLocalStorage(): PanelContainerState {
  let ret:PanelContainerState = {
    panelsVisible: true,
    panelWidth: 400,
    activePanel: undefined,
  };
  try {
    const key = getPanelKey("state");
    const rawData = localStorage.getItem(key);
    if (rawData) {
      const data = JSON.parse(rawData);
      return {
        ...ret,
        ...data
      }
    } else {
      localStorage.setItem(key, JSON.stringify(ret));
    }
    return ret;
  } catch(err) {
    console.log(err);
  }
  return ret;
}

export function setPanelStateToLocalStorage(state: Partial<PanelContainerState>) {
  try {
    const key = getPanelKey("state");
    const rawData = localStorage.getItem(key);
    if (rawData) {
      const data = JSON.parse(rawData);
      localStorage.setItem(key, JSON.stringify({
        ...data,
        ...state
      }));
    } else {
      localStorage.setItem(key, JSON.stringify(state));
    }
  } catch(err) {
    console.log(err);
  }
}


function getPanelKey(prefix: string): string {
  let pathname = document.location.pathname + document.location.search;
  if (['/', '/templates', '/models', '/tutorials', '/extensions'].some(key => pathname === key)) {
    pathname = 'workspace'
  }

  const key = `${prefix}-${pathname}`;
  return key;
}
