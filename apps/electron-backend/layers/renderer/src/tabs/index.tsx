import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import "./tabs.style.scss"
import { useTabsState } from './tabstore';
function App() {
  const {active, setActive, tabs, changeTab, closeTab, onInit} = useTabsState();
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
  return (
    <div className="tabManager">
      <div className="drag-area"></div>
      <div className="tab-list">
        <div className={`tab ${homeTab.id === active ? "active" : ""}`} key="home" onClick={() => {
            onChangeTab(homeTab.id);
          }}>
            Home
        </div>
        {otherTabs.map(tab => {
          return (
            <div className={`tab ${tab.id === active ? "active" : ""}`} key={tab.id} onClick={() => {
              onChangeTab(tab.id);
            }}>
              {tab.name}
            </div>
          )
        })}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);