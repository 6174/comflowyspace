import { ChildProcess } from "child_process";
import { BrowserView, BrowserWindow } from "electron";
import isDev from "electron-is-dev";

import log from 'electron-log';
import { isMacOS } from "./utils";
import path from "path";

if (!isDev) {
    log.transports.file.level = "verbose";
}

process.on('unhandledRejection', log.error);

interface IWindowInstance {
    window: BrowserView;
    serverSocket: string;
    serverProcess: ChildProcess;
    name: string;
}
  
let listWindow: IWindowInstance[] = [];
let mainWindow: BrowserWindow;

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
        instance.serverProcess.kill();
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
  
    const windowView = await createWindow();
    setTab(windowView);
  }