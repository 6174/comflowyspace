import { BrowserView, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import { isMacOS } from "./utils";
import path from "path";
import contextMenu from 'electron-context-menu';
import { APP_SERVER_PORT } from "./config";
import { closeLoadingScreen } from "./loading";
import { setTimeout } from 'timers/promises';
const BASE_URL = isDev ? 'http://localhost:3000' : `http://localhost:${APP_SERVER_PORT}`
export function resolveWindowUrl(pageName: string): string {
  let realPageName = pageName
  if (pageName === "index" && isDev) {
    realPageName = ""
  }
  return isDev ? `${BASE_URL}/${realPageName}` : `${BASE_URL}/${realPageName}.html`
}

export const DEFAULT_WINDOW_URL = resolveWindowUrl("index");

type WindowTab = {
  pageName: string, 
  query?: string,
  name: string, 
  type: "MANAGEMENT" | "DOC", 
  id: number
}
// type define
export interface IWindowInstance {
  window: BrowserView;
  tabData: WindowTab;
}

const PRELOAD_JS_PATH = path.resolve(__dirname, "../../preload/dist/", "index.js");

/**
 * Manager All Windows
 */
class WindowManager {
  listWindow: IWindowInstance[] = [];
  mainWindow!: BrowserWindow;
  mainWebView!: BrowserView;

  constructor() {
    this.initEventListener();
  }

  /**
   * create main window to manager tab windows
   * https://www.electronjs.org/docs/latest/api/browser-view
   * @returns 
   */
  createMainWindow = async () => {
    if (this.mainWindow) {
      return this.mainWindow;
    }
    const window = new BrowserWindow({
      show: false,
      width: 1200,
      height: 800,
      backgroundColor: "#1B1B1F",
      titleBarStyle: isMacOS ? 'hiddenInset' : 'default',
      frame: isMacOS,
      webPreferences: {
        devTools: isDev,
        contextIsolation: true,
        nodeIntegration: false,
        preload: PRELOAD_JS_PATH,
        disableDialogs: false,
        safeDialogs: true,
        enableWebSQL: false,
      },
    });

    this.mainWindow = window;

    if (isDev) {
      this.mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
    
    window.on('closed', () => {
      // @ts-ignore
      this.mainWindow = null;
      this.listWindow.forEach(instance => {
        (instance.window.webContents as any)?.destroy() 
      });
      this.listWindow = [];
    })

    window.on("enter-full-screen", () => {
      this.mainWindow.webContents.send("enter-full-screen");
    });
    window.on("leave-full-screen", () => {
      this.mainWindow.webContents.send("leave-full-screen");
    });

    window.loadFile(path.resolve(__dirname, "../../renderer/dist/tabs.html"));
    await setTimeout(1000);
    closeLoadingScreen();
    window.show();

    const windowView = this.mainWebView = await this.#createWindow({
      pageName: "index",
      name: "Home",
      type: "MANAGEMENT",
      id: 0
    });
    this.#setActiveTab(windowView);
  }

  #createWindow = async (tabData: WindowTab) => {
    // Create the browser view.
    const window = new BrowserView({
      webPreferences: {
        devTools: isDev,
        contextIsolation: true,
        nodeIntegration: false,
        preload: PRELOAD_JS_PATH,
        disableDialogs: false,
        safeDialogs: true,
        enableWebSQL: false,
      },
    });
    contextMenu({ 
      window,
      showSaveImageAs: true
    });
    const url = this.#getRealUrl(tabData);
    window.webContents.frameRate = 60;
    window.webContents.loadURL(url);
    if (isDev) {
      window.webContents.openDevTools({ mode: 'detach' })
    }
    window.webContents.on("did-finish-load", () => {
      // window.webContents.send("set-socket", {});
    });
    this.listWindow.push({
      window,
      tabData: {
        ...tabData,
        id: window.webContents.id
      }
    });
    return window;
  };

  #getRealUrl(tabData: WindowTab): string {
    const { pageName, query } = tabData;
    const url = resolveWindowUrl(pageName);
    if (!query) {
      return url;
    }
    const urlParams = new URLSearchParams(query);
    const urlWithQuery = url + "?" + urlParams.toString();
    return urlWithQuery;
  }

  getTabData = (): {
    tabs: WindowTab[];
    active: number;
  } => {
    return {
      tabs: this.listWindow.map((instance) => instance.tabData),
      active: this.mainWindow!.getBrowserView()?.webContents?.id!
    }
  }

  #setActiveTab = (instance: BrowserView) => {
    this.mainWindow!.setBrowserView(instance);
    instance.setBounds({ x: 0, y: 36, width: this.mainWindow!.getBounds().width, height: this.mainWindow!.getBounds().height - 36 })
    instance.setAutoResize({ width: true, height: true, horizontal: false, vertical: false });
    this.dispatchChangeEvent();
  }

  dispatchChangeEvent = () => {
    console.log("dispatch tabs change event");
    this.mainWindow.webContents.send("window-tabs-change", this.getTabData());
  }

  newTab = async (tabData: WindowTab) => {
    const window = await this.#createWindow(tabData);
    this.#setActiveTab(window);
    return window
  }

  replaceTab = async (id: number, newTabData: WindowTab) => {
    const window = this.listWindow.find(instance => instance.window.webContents.id === id);
    if (window) {
      window.tabData = newTabData;
      const url = this.#getRealUrl(newTabData);
      window.window.webContents.loadURL(url);
    }
  }

  initEventListener() {
    ipcMain.handle("open-new-tab", async (_event, tabData: WindowTab) => {
      const tab = this.listWindow.find(instance => {
        return instance.tabData.query === tabData.query && instance.tabData.pageName === tabData.pageName
      });
      if (tab) {
        this.#setActiveTab(tab.window);
        this.dispatchChangeEvent();
        return tab.window.webContents.id;
      } else {
        const window = await this.newTab(tabData) 
        this.dispatchChangeEvent();
        return window.webContents.id;
      }
    });

    ipcMain.handle("change-tab", async (_event, tabData: WindowTab) => {
      const tab = this.listWindow.find(instance => {
        return instance.tabData.query === tabData.query && instance.tabData.pageName === tabData.pageName
      });
      if (tab) {
        tab.tabData = {
          ...tab.tabData,
          ...tabData
        };
        this.dispatchChangeEvent();
      }
    })

    ipcMain.handle("close-tab", async (_event, id: number) => {
      let tabIndex = 0;
      this.listWindow.forEach((win, index) => {
        if (win.window.webContents.id === id) {
          tabIndex = index;
          (win.window.webContents as any).destroy();
          this.listWindow = this.listWindow.filter(instance => instance.window.webContents.id !== id);
        }
      });
      if (tabIndex > 0) {
        this.#setActiveTab(this.listWindow[tabIndex - 1].window);
      } else {
        this.#setActiveTab(this.mainWebView);
      }
      this.dispatchChangeEvent();
    });
    
    ipcMain.handle("switch-tab", async (_event, id: number) => {
      const tab = this.listWindow.find(instance => instance.window.webContents.id === id);
      console.log("switch tab", id, tab);
      if (tab) {
        this.#setActiveTab(tab.window)
        this.dispatchChangeEvent();
      }
    });

    ipcMain.handle("get-tabs-data", async (_event) => {
      console.log("call get-tabs-data");
      const ret = this.getTabData();
      return ret;
    });

    ipcMain.handle("trigger-action", async (_event, data) => {
      console.log("trigger action");
      this.mainWindow!.getBrowserView()?.webContents?.send("action", data);
    });

    ipcMain.handle('replace-tab', async (_event, data: {
      id: number,
      newTab: WindowTab
    }) => {
      this.replaceTab(data.id, data.newTab);
      this.dispatchChangeEvent();
      return this.getTabData(); 
    });

    ipcMain.handle('maxmize-window', async () => {
      this.mainWindow.maximize();
    });

    ipcMain.handle('unmaxmize-window', async () => {
      this.mainWindow.unmaximize();
    });

    ipcMain.handle('minimize-window', async () => {
      this.mainWindow.minimize();
    });
    
    ipcMain.handle('close-window', async () => {
      this.mainWindow.close();
    });

    ipcMain.handle('is-maxmize', async () => {
      return this.mainWindow.isMaximized();
    });


  }

  restoreOrCreateWindow = async () => {
    let window = this.mainWindow;
  
    if (window === undefined) {
      await this.createMainWindow();
      window = this.mainWindow;
    }
  
    if (window.isMinimized()) {
      window.restore();
    }
  
    window.focus();
  }
}


export const windowManger = new WindowManager();
