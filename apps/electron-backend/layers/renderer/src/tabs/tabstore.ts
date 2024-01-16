import {create} from "zustand";
import { WindowTab, comfyElectronApi } from "../lib/bridge";

type TabsState = {
  tabs: WindowTab[],
  active: number;
  fullscreen: boolean;
}

type TabsAction = {
  onInit: () => () => void;
  setActive: (id: number) => void;
  changeTab: (id: number) => void;
  closeTab: (id: number) => void;
}

export const useTabsState = create<TabsState & TabsAction>((set, get) => ({
  tabs: [],
  fullscreen: false,
  active: 0,
  onInit: () => {
    comfyElectronApi.windowTabManager.getTabsData().then((ret) => {
      set({tabs: ret.tabs, active: ret.active});
    });
    const dispose1 = comfyElectronApi.receiveFromMain("enter-full-screen", () => {
      console.log("enter full screen");
      set({
        fullscreen: true
      })
    });
    const dispose2 = comfyElectronApi.receiveFromMain("leave-full-screen", () => {
      console.log("leave full screen");
      set({
        fullscreen: false
      })
    });
    const dispose3 = comfyElectronApi.windowTabManager.onWindowTabsChange(tabsData => {
      set({tabs: tabsData.tabs, active: tabsData.active});
    });
    return () => {
      dispose1();
      dispose2();
      dispose3();
    }
  },
  setActive: (id: number) => set({active: id}),
  closeTab: async (id: number) => {
    await comfyElectronApi.windowTabManager.closeTab(id);
  },
  changeTab: async (id: number) => {
    await comfyElectronApi.windowTabManager.swtichTab(id);
  }
}));