  export interface ComfyElectronApi {
  name: string;
  version: number;
  selectDirectory: () => Promise<any>;
  selectHomeDir:() => Promise<string>;
  receiveFromMain:(channel: string, func: any) => () => void;
  windowTabManager: {
    onWindowTabsChange: (
      callback: (tabsData: {
        tabs: WindowTab[];
        active: number;
      }) => void
    ) => () => void;
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
    // comfyElectronApi.windowTabManager.openNewTab(tab);
  } else {
    window.open(url, '_blank');
  }
}