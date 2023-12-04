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
  
contextBridge.exposeInMainWorld("comfyElectronApi", { 
    name: "comfyElectronApi",
    version: 0.1,
    windowTabManager: {
        onWindowTabsChange: (callback: (tabsData: {
            tabs: WindowTab[];
            active: number;
        }) => void) => {
            ipcRenderer.on('window-tabs-change', (_, tabsData) => callback(tabsData));
            return () => ipcRenderer.removeListener('window-tabs-change', callback);
        },
        openNewTab: async (config: Partial<WindowTab>) => {
            const ret = await ipcRenderer.sendSync('open-new-tab', config);
            return ret;
        },
        closeTab: async (id: number) => {
            await ipcRenderer.sendSync('close-tab', id);
        },
        swtichTab: async (id: number) => {
            await ipcRenderer.sendSync('switch-tab', id);
        },
        replaceTab: async (id: number, newTab: WindowTab) => {
            await ipcRenderer.sendSync('replace-tab', {id, newTab});
        },
        getTabsData: async () => {
            const ret = await ipcRenderer.sendSync('get-tabs-data');
            return ret;
        }
    }
});