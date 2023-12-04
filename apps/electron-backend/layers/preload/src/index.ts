/**
 * @module preload
 */
import { contextBridge, ipcRenderer } from "electron";

type WindowTab = {
    url: string, 
    name: string, 
    type: string, 
    id: number
}

(window as any).comfyElectronApi = { 
    name: "comfyElectronApi",
    version: 0.1,
    receiveFromMain: (channel: string, func: any) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    windowTabManager: {
        onWindowTabsChange: (callback: (tabsData: {
            tabs: WindowTab[];
            active: number;
        }) => void) => {
            ipcRenderer.on('window-tabs-change', (_, tabsData) => {
                console.log("callback(tabsData)", tabsData);
                callback(tabsData)
            });
            return () => ipcRenderer.removeListener('window-tabs-change', callback);
        },
        openNewTab: async (config: Partial<WindowTab>) => {
            const ret = await ipcRenderer.invoke('open-new-tab', config);
            return ret;
        },
        closeTab: async (id: number) => {
            await ipcRenderer.invoke('close-tab', id);
        },
        swtichTab: async (id: number) => {
            await ipcRenderer.invoke('switch-tab', id);
        },
        replaceTab: async (id: number, newTab: WindowTab) => {
            await ipcRenderer.invoke('replace-tab', {id, newTab});
        },
        getTabsData: async () => {
            const ret = await ipcRenderer.invoke('get-tabs-data');
            return ret;
        }
    }
};

(window as any).comfyElectronApi.receiveFromMain("some-event", (mssg: string) => {
    console.log("mssg", mssg);
})