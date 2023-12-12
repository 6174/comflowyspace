import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styles from "./tabs.style.scss"
import { useTabsState } from './tabstore';
console.log("styles: ", styles);
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

  return (
    <div className={styles.tabManager}>
      <div className="drag-area"></div>
      <div className="tab-manager-inner">
        <div className='fixed-tab' onClick={ev => {
          if (active ! == 0) {
            onChangeTab(0);
          }
        }}>
          Home5
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);