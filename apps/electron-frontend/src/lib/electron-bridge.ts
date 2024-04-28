import { useEffect, useState } from "react";
import { isWindow } from "ui/utils/is-window";

  export interface ComfyElectronApi {
  name: string;
  version: number;
  selectDirectory: (type?: "directory" | "file" | "both") => Promise<any>;
  selectHomeDir:() => Promise<string>;
  receiveFromMain:(channel: string, func: any) => () => void;
  openURL: (url: string) => Promise<any>;
  openDirectory: (directoryPath: string) => Promise<any>;
  windowTabManager: {
    onWindowTabsChange: (
      callback: (tabsData: {
        tabs: WindowTab[];
        active: number;
      }) => void
    ) => () => void;
    changeTab: (tabData: WindowTab) => Promise<void>;
    openNewTab: (config: Partial<WindowTab>) => Promise<any>;
    closeTab: (id: number) => Promise<void>;
    swtichTab: (id: number) => Promise<void>;
    replaceTab: (id: number, newTab: WindowTab) => Promise<void>;
    getTabsData: () => Promise<{
      tabs: WindowTab[];
      active: number;
    }>;
    triggerAction: (data: {
      type: string,
      [_:string]: any
    }) => Promise<void>;
  };
}

export interface WindowTab {
  pageName: string, 
  query?: string,
  name: string, 
  type: "DOC" | "MANGEMENT" | "THIRD_PARTY", 
  id: number
}

let comfyElectronApi: ComfyElectronApi;
if (typeof window !== "undefined") {
  comfyElectronApi = (window as any).comfyElectronApi as ComfyElectronApi;
}

export {
  comfyElectronApi
}

export function openTabPage(tab: WindowTab) {
  if (comfyElectronApi) {
    comfyElectronApi.windowTabManager.openNewTab(tab);
  } else {
    window.open(tab.pageName + "?" + tab.query, '_blank');
  }
}

export function listenElectron(channel: string, func: any) {
  if (comfyElectronApi) {
    return comfyElectronApi.receiveFromMain(channel, func);
  } else {
    return () => {};
  }
}

export function openExternalURL(url: string) {
  if (comfyElectronApi) {
    comfyElectronApi.openURL(url);
  } else {
    window.open(url, '_blank');
  }
}

export function openDirectory(path: string) {
  if (comfyElectronApi) {
    comfyElectronApi.openDirectory(path);
  }
}

export function isElectron() {
  if (comfyElectronApi && comfyElectronApi.version) {
    return true
  }
  return false;
}

export function useIsElectron() {
  const [electronEnv, setElectronEnv] = useState(false);
  useEffect(() => {
    if (isWindow) {
      setElectronEnv(isElectron());
    }
  }, [])
  return electronEnv;
}