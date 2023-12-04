import { Button, Space, Tabs } from 'antd';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import styles from  "@/styles/tab-manager.module.scss";
import { WindowTab, comfyElectronApi } from '@/lib/electron-bridge';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
import {create} from "zustand";

type TabsState = {
  tabs: WindowTab[],
  active: number;
}

type TabsAction = {
  onInit: () => () => void;
  changeTab: (id: number) => void;
  closeTab: (id: number) => void;
}

const useTabsState = create<TabsState & TabsAction>((set, get) => ({
  tabs: [],
  active: 0,
  onInit: () => {
    comfyElectronApi.windowTabManager.getTabsData().then((ret) => {
      set({tabs: ret.tabs, active: ret.active});
    });
    return comfyElectronApi.windowTabManager.onWindowTabsChange(tabsData => {
      console.log("tab change event", tabsData);
      set({tabs: tabsData.tabs, active: tabsData.active});
    });
  },
  closeTab: async (id: number) => {
    await comfyElectronApi.windowTabManager.closeTab(id);
  },
  changeTab: async (id: number) => {
    await comfyElectronApi.windowTabManager.swtichTab(id);
  }
}));

export default function WindowTabManager() {
  const {active, tabs, changeTab, closeTab, onInit} = useTabsState();
  const [items, setItems] = useState([]);

  console.log("tabs", tabs);
  useEffect(()=> {
    if (tabs) {
      setItems(tabs.map(tab => ({key: tab.id, label: tab.name})));
    }
  }, [tabs])

  const onChangeTab = useCallback((id)=> {
    changeTab(Number(id));
  }, [])

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      // todo 
    } else {
      closeTab(Number(targetKey));
    }
  };

  useEffect(() => {
    const dispose = onInit();
    return () => {
      dispose();
    }
  }, [])

  return (
    <div className={styles.tabManager}>
      <Space>
        <div className='fixed-tab' onClick={ev => {
          if (active ! == 0) {
            onChangeTab(0);
          }
        }}>
          Home1
        </div>
        <Tabs
          hideAdd
          onChange={onChangeTab}
          activeKey={active + ""}
          type="editable-card"
          onEdit={onEdit}
          items={items}
        />
      </Space>
    </div>
  );
}


