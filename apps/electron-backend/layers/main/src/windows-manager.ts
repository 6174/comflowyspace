import { BrowserView, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";

import { isMacOS, uuid } from "./utils";
import path from "path";
import { format } from "url";
import contextMenu from 'electron-context-menu';

// type define
export interface IWindowInstance {
  window: BrowserView;
  name: string;
}

export const DEFAULT_WINDOW_URL = isDev
  ? 'http://localhost:3000'
  : format({
    pathname: path.join(__dirname, '../renderer/out/index.html'),
    protocol: 'file:',
    slashes: true,
  });
const PRELOAD_JS_PATH = path.resolve(__dirname, "../../preload/dist/", "index.js");

/**
 * Manager All Windows
 */
class WindowManager {
  // golbal data
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
      width: 800,
      height: 600,
      backgroundColor: isMacOS ? "#D1D5DB" : "#6B7280",
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

    window.loadURL(`${DEFAULT_WINDOW_URL}/tabs`);
    window.show();

    const windowView = this.mainWebView = await this.createWindow(DEFAULT_WINDOW_URL + "/");
    this.setActiveTab(windowView);
  }

  createWindow = async (href: string) => {
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
    contextMenu({ window });
    window.webContents.loadURL(href);
    if (isDev) {
      window.webContents.openDevTools({ mode: 'detach' })
    }
    window.webContents.on("did-finish-load", () => {
      // window.webContents.send("set-socket", {});
    });
    this.listWindow.push({
      window,
      name: `Tab-${uuid()}`
    });
    return window;
  };

  getTabData = (): {
    tabs: number[];
    active: number;
  } => {
    return {
      tabs: this.listWindow.map((instance) => instance.window.webContents.id),
      active: this.mainWindow!.getBrowserView()?.webContents?.id!
    }
  }

  setActiveTab = (instance: BrowserView) => {
    this.mainWindow!.setBrowserView(instance);
    instance.setBounds({ x: 0, y: 36, width: this.mainWindow!.getBounds().width, height: this.mainWindow!.getBounds().height - 36 })
    instance.setAutoResize({ width: true, height: true, horizontal: false, vertical: false });
    this.dispatchChangeEvent();
  }

  dispatchChangeEvent = () => {
    ipcMain.emit("window-tabs-change", this.getTabData());
  }

  newTab = async (url: string) => {
    const window = await this.createWindow(url);
    this.setActiveTab(window);
    return window
  }

  initEventListener() {
    ipcMain.on("open-new-tab", async (_event, url: string) => {
      const window = await this.newTab(url)
      this.dispatchChangeEvent();
      return window.webContents.id;
    });
    
    ipcMain.on("close-tab", (_event, id: number) => {
      this.listWindow.forEach(win => {
        if (win.window.webContents.id === id) {
          (win.window.webContents as any).destroy();
          this.listWindow = this.listWindow.filter(instance => instance.window.webContents.id !== id);
        }
      });
      this.setActiveTab(this.mainWebView);
      this.dispatchChangeEvent();
    });
    
    ipcMain.on("switch-tab", (_event, id: number) => {
      const tab = this.listWindow.find(instance => instance.window.webContents.id === id);
      if (tab) {
        this.setActiveTab(tab.window)
      }
      this.dispatchChangeEvent();
    });

    ipcMain.on("get-tabs-data", (_event) => {
      return this.getTabData();
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
