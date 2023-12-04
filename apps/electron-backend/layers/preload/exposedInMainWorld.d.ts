interface Window {
    readonly comfyElectronApi: { name: string; version: number; windowTabManager: { onWindowTabsChange: (callback: (tabsData: { tabs: WindowTab[]; active: number; }) => void) => () => Electron.IpcRenderer; openNewTab: (config: Partial<WindowTab>) => Promise<any>; closeTab: (id: number) => Promise<void>; swtichTab: (id: number) => Promise<void>; replaceTab: (id: number, newTab: WindowTab) => Promise<void>; getTabsData: () => Promise<any>; }; };
}
