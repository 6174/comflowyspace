import {create} from "zustand";
import { WindowTab, comfyElectronApi } from "../lib/bridge";

type TabsState = {
  tabs: WindowTab[],
  active: number;
}

type TabsAction = {
  onInit: () => () => void;
  setActive: (id: number) => void;
  changeTab: (id: number) => void;
  closeTab: (id: number) => void;
}

export const useTabsState = create<TabsState & TabsAction>((set, get) => ({
  tabs: [],
  active: 0,
  onInit: () => {
    comfyElectronApi.windowTabManager.getTabsData().then((ret) => {
      set({tabs: ret.tabs, active: ret.active});
    });
    return comfyElectronApi.windowTabManager.onWindowTabsChange(tabsData => {
      set({tabs: tabsData.tabs, active: tabsData.active});
    });
  },
  setActive: (id: number) => set({active: id}),
  closeTab: async (id: number) => {
    await comfyElectronApi.windowTabManager.closeTab(id);
  },
  changeTab: async (id: number) => {
    await comfyElectronApi.windowTabManager.swtichTab(id);
  }
}));