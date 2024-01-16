import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import "./tabs.style.scss"
import { useTabsState } from './tabstore';
import HomeIcon from './home.icon';
import DocIcon from './doc.icon';
import CloseIcon from './close.icon';
import {ComfyUIStatusButton} from "./comfyui-status-button";
import { ComfyUIHelpButton } from './comfyui-help-button';

function App() {
  const {active, fullscreen, setActive, tabs, changeTab, closeTab, onInit} = useTabsState();
  const [items, setItems] = useState([]);

  console.log("tabs", tabs, active);
  useEffect(()=> {
    if (tabs) {
      setItems(tabs.map(tab => ({
        key: tab.id + "", 
        label: tab.name
      })));
    }
  }, [tabs])

  const onChangeTab = useCallback((id)=> {
    console.log("onChange", id)
    setActive(id);
    changeTab(Number(id));
  }, [setActive])

  useEffect(() => {
    const dispose = onInit();
    return () => {
      dispose();
    }
  }, [])

  const homeTab = tabs.find(tab => tab.name === "Home") || {} as any;
  const otherTabs = tabs.filter(tab => tab.name !== "Home");
  const totalTabs = tabs.length;
  return (
    <div className={`tabManager ${fullscreen ? "fullscreen" : ""}`}>
      <div className="drag-area"></div>
      <div className="tab-list">
        <div className="tabs">
          <div className={`tab ${homeTab.id === active ? "active" : ""} ${otherTabs[0]?.id === active ? "before-active" : ""}`} key="home" onClick={() => {
            onChangeTab(homeTab.id);
          }} style={{
            flex: 0
          }}>
            <div className="tab-inner">
              <div className="icon">
                <HomeIcon />
              </div>
              <div className="title">
                Home
              </div>
            </div>
          </div>
          {otherTabs.map((tab, index) => {
            let afterIsActiveTab = false;
            if (index < totalTabs - 1 && otherTabs[index + 1]?.id === active) {
              afterIsActiveTab = true;
            }
            return (
              <div className={`tab ${tab.id === active ? "active" : ""} ${afterIsActiveTab ? "before-active" : ""}`} key={tab.id} onClick={() => {
                onChangeTab(tab.id);
              }}>
                <div className="tab-inner">
                  <div className="icon">
                    <DocIcon />
                  </div>
                  <div className="title">
                    {tab.name}
                  </div>
                  <div className="close">
                    <div className="closeIcon" onClick={ev => {
                      closeTab(tab.id);
                    }}>
                      <CloseIcon />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="blank"/>
        <div className="actions">
          <ComfyUIHelpButton/>
          <ComfyUIStatusButton/>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);