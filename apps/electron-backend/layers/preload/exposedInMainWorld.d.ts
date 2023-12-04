interface Window {
    readonly comfyElectronApi: { name: string; version: number; openNewTab: (url: string) => Promise<any>; closeTab: (id: number) => Promise<void>; swtichTab: (id: number) => Promise<void>; getTabsData: () => Promise<any>; };
}
