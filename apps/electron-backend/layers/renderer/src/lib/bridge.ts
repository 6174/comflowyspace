export interface ComfyElectronApi {
  name: string;
  version: number;
  openURL: (url: string) => Promise<any>;
  receiveFromMain: (channel: string, func: any) => () => void;
  isWindows: boolean;
  windowTabManager: {
    maxmizeWindow: () => Promise<void>,
    unmaxmizeWindow: () => Promise<void>,
    minimizeWindow: () => Promise<void>,
    closeWindow: () => Promise<void>,
    isMaxmized: () => Promise<boolean>,
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
      [_: string]: any
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