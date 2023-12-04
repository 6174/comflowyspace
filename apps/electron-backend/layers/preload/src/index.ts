/**
 * @module preload
 */
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("comfyElectronApi", { 
    name: "comfyElectronApi",
    version: 0.1,
    openNewTab: async (url: string) => {
        const ret = await ipcRenderer.sendSync('open-new-tab', url);
        return ret;
    },
    closeTab: async (id: number) => {
        await ipcRenderer.sendSync('close-tab', id);
    },
    swtichTab: async (id: number) => {
        await ipcRenderer.sendSync('switch-tab', id);
    },
    getTabsData: async () => {
        const ret = await ipcRenderer.sendSync('get-tabs-data');
        return ret;
    }
});