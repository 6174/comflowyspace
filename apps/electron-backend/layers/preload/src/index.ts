/**
 * @module preload
 */
import { contextBridge, ipcRenderer } from "electron";

type WindowTab = {
    pageName: string, 
    query?: string,
    name: string, 
    type: string, 
    id: number
}

contextBridge.exposeInMainWorld("comfyElectronApi", { 
    name: "comfyElectronApi",
    version: 0.1,
    receiveFromMain: (channel: string, func: any) => {
        const callback = (event: any, ...args: any[]) => func(...args)
        ipcRenderer.on(channel, callback);
        return () => ipcRenderer.removeListener(channel, callback);
    },
    selectDirectory: async () => {
        const ret = await ipcRenderer.invoke('select-directory');
        return ret;
    },
    selectHomeDir: async () => {
        const ret = await ipcRenderer.invoke('select-home-dir');
        return ret;
    },
    windowTabManager: {
        onWindowTabsChange: (callback: (tabsData: {
            tabs: WindowTab[];
            active: number;
        }) => void) => {
            const cb =  (_: any, tabsData: any) => {
                console.log("callback(tabsData)", tabsData);
                callback(tabsData)
            }
            ipcRenderer.on('window-tabs-change', cb);
            return () => ipcRenderer.removeListener('window-tabs-change', cb);
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
        },
        triggerAction: async (data: {
            type: string
        }) => {
            const ret = await ipcRenderer.invoke('trigger-action', data);
        }
    }
});