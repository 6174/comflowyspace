import { BrowserView, BrowserWindow } from "electron";
import isDev from "electron-is-dev";

import { isMacOS } from "./utils";
import { uuid } from "@comflowy/common";
import path from "path";
import { format } from "url";

// type define
export interface IWindowInstance {
  window: BrowserView;
  name: string;
}
export interface TabList {
  tabs: string[];
  active: string;
}

// golbal data
let listWindow: IWindowInstance[] = [];
let mainWindow: BrowserWindow;
const defaultWindowUrl = isDev
  ? 'http://localhost:8000'
  : format({
    pathname: path.join(__dirname, '../renderer/out/index.html'),
    protocol: 'file:',
    slashes: true,
  });

/**
 * create main window to manager tab windows
 * https://www.electronjs.org/docs/latest/api/browser-view
 * @returns 
 */
export async function createMainWindow() {
  if (mainWindow) {
    return mainWindow;
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
      // enableRemoteModule: false,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  mainWindow = window;

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  window.on('closed', () => {
    // @ts-ignore
    mainWindow = null;
    listWindow.forEach(instance => {
      (instance.window.webContents as any)?.destroy() // TODO: electron haven't make document for it. Ref: https://github.com/electron/electron/issues/26929
    });
    listWindow = [];
  })

  if (isDev) {
    window.loadURL(`${defaultWindowUrl}/tabs`);
  } else {
    // TODO: What if I need to load the tabs.html file
    window.loadURL("app://-/tabs");
  }

  // window.maximize();
  window.show();

  const windowView = await createWindow(defaultWindowUrl);
  setTab(windowView);
}

export async function createWindow(href: string) {
  // Create the browser view.
  const window = new BrowserView({
    webPreferences: {
      devTools: isDev,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  window.webContents.loadURL(href);

  if (isDev) {
    window.webContents.openDevTools({ mode: 'detach' })
  }

  window.webContents.on("did-finish-load", () => {
    // window.webContents.send("set-socket", {});
  });

  listWindow.push({
    window,
    name: `Tab-${uuid()}`
  });

  mainWindow!.webContents.send('tabChange', getTabData());
  return window;
};

export function getTabData(): TabList{
  return {
    tabs: listWindow.map((instance) => instance.name),
    active: listWindow.find((instance) => instance.window.webContents.id === mainWindow!.getBrowserView()?.webContents?.id)?.name || ''
  }
}

// Set active tab
export function setTab(instance: BrowserView) {
  mainWindow!.setBrowserView(instance);
  instance.setBounds({ x: 0, y: 36, width: mainWindow!.getBounds().width, height: mainWindow!.getBounds().height - 36 })
  instance.setAutoResize({ width: true, height: true, horizontal: false, vertical: false });
  mainWindow!.webContents.send('tabChange', getTabData());
}

export async function newTab(){
  const window = await createWindow(mainWindow.getBrowserView()?.webContents.getURL()!);
  setTab(window);
}