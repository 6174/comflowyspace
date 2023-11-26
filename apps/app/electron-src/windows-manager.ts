import { BrowserView, BrowserWindow } from "electron";
import isDev from "electron-is-dev";

import { isMacOS } from "./utils";
import path from "path";
import { uuid } from "@comflowy/common";


interface IWindowInstance {
  window: BrowserView;
  name: string;
}

let listWindow: IWindowInstance[] = [];
let mainWindow: BrowserWindow | null;

export async function createMainWindow() {
  if (mainWindow) {
    return mainWindow;
  }
  const window = new BrowserWindow({
    show: false,
    width: 1000,
    height: 1000,
    backgroundColor: isMacOS ? "#D1D5DB" : "#6B7280",
    icon: path.join(__dirname, '../assets/icon.icns'),
    titleBarStyle: isMacOS ? 'hiddenInset' : 'default',
    frame: isMacOS,
    webPreferences: {
      devTools: isDev,
      // enableRemoteModule: false,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/tab-preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  mainWindow = window;

  if (isDev) {
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  window.on('closed', () => {
    mainWindow = null;
    listWindow.forEach(instance => {
      (instance.window.webContents as any)?.destroy() // TODO: electron haven't make document for it. Ref: https://github.com/electron/electron/issues/26929
    });
    listWindow = [];
  })

  if (isDev) {
    window.loadURL("http://localhost:3000/tabs.html");
  } else {
    // TODO: What if I need to load the tabs.html file
    window.loadURL("app://-/tabs.html");
  }

  window.maximize();
  window.show();

  const windowView = await createWindow("http://localhost:3000");
  setTab(windowView);
}

export async function createWindow(href: string) {
  // Create the browser view.
  const window = new BrowserView({
    webPreferences: {
      devTools: isDev,
      // enableRemoteModule: false,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/client-preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  // Create sever process
  // const { serverSocket, serverProcess } = await createBackgroundProcess(window);

  // and load the index.html of the app.

  if (isDev) {
    window.webContents.loadURL(href);
  } else {
    window.webContents.loadURL("app://-");
  }

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

interface TabList {
  tabs: string[];
  active: string;
}

const getTabData = (): TabList => {
  return {
    tabs: listWindow.map((instance) => instance.name),
    active: listWindow.find((instance) => instance.window.webContents.id === mainWindow!.getBrowserView()?.webContents?.id)?.name || ''
  }
}

// Set active tab
const setTab = (instance: BrowserView) => {
  mainWindow!.setBrowserView(instance);
  instance.setBounds({ x: 0, y: 36, width: mainWindow!.getBounds().width, height: mainWindow!.getBounds().height - 36 })
  instance.setAutoResize({ width: true, height: true, horizontal: false, vertical: false });
  mainWindow!.webContents.send('tabChange', getTabData());
}



