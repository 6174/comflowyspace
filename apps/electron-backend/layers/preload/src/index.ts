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
        const callback = (event: any, ...args: any[]) => {
            // console.log("receive from main", channel, args);
            func(...args)
        }
        ipcRenderer.on(channel, callback);
        return () => ipcRenderer.removeListener(channel, callback);
    },
    selectDirectory: async (type: "directory" | "file" | "both" = "directory") => {
        const ret = await ipcRenderer.invoke('select-directory', type);
        return ret;
    },
    selectHomeDir: async () => {
        const ret = await ipcRenderer.invoke('select-home-dir');
        return ret;
    },
    openURL: async (url: string) => {
        const ret = await ipcRenderer.invoke('open-url', url);
        return ret;
    },
    openDirectory: async (directoryPath: string) => {
        const ret = await ipcRenderer.invoke('open-directory', directoryPath);
        return ret;
    },
    isWindows: process.platform === "win32",
    windowTabManager: {
        maxmizeWindow: async () => {
            await ipcRenderer.invoke('maxmize-window');
        },
        unmaxmizeWindow: async () => {
            await ipcRenderer.invoke('unmaxmize-window');
        },
        minimizeWindow: async () => {
            await ipcRenderer.invoke('minimize-window');            
        },
        closeWindow: async () => {
            await ipcRenderer.invoke('close-window');
        },
        isMaxmized: async () => {
            return await ipcRenderer.invoke('is-maxmize');
        },
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
        changeTab: async (config: Partial<WindowTab>) => {
            await ipcRenderer.invoke('change-tab', config);
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
            // console.log("trigger action", data);
            const ret = await ipcRenderer.invoke('trigger-action', data);
        }
    }
});