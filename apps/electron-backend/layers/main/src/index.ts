import { BrowserWindow, app, dialog} from 'electron'
import { windowManger } from "./windows-manager";
import log from 'electron-log/main';
import "./prelaunch";

// Prepare the renderer once the app is ready
import { startAppServer } from '@comflowy/node/src/app';
import { isDev } from './utils';
import path from 'path';
import { APP_SERVER_PORT } from './config';
import { showLoadingScreen } from './loading';
import { startIPC } from './ipc';
import { startAutoUpdater } from './auto-update';
// console.log(GPUFeatureStatus)
// app.disableHardwareAcceleration();

// Disable timestamp
log.transports.console.format = '{level} {text}';
log.transports.file.format = '{level} {text}';

app.setAboutPanelOptions({
  applicationName: 'Comflowy',
  applicationVersion: '0.1.7-alpha',
  version: '0.1.7-alpha',
  copyright: 'Copyright © 2024 https://www.comflowy.com',
  authors: ['@Marc Chen', '@Jimmy Wang'],
  website: 'https://www.comflowy.com',
  credits: ''
})

app.on('ready', async () => {
  try {
    startIPC()
    log.info('Start Server');
    showLoadingScreen();
    // run next frontend service
    await startAppServer({
      port: APP_SERVER_PORT,
      staticFolder: isDev ? null : path.resolve(__dirname, "../../renderer/out")
    });
    log.info('create main window');
    // start desktop window
    await windowManger.createMainWindow();
    // createWindow();
    // auto update listener
    log.info('start auto update');

    startAutoUpdater();
  } catch(err: any) {
    log.error(err);
    dialog.showErrorBox('Error', err.message);
  }
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

// app.on("activate", windowManger.restoreOrCreateWindow);

function createWindow() {
  // Create the browser window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the index.html file
  win.loadFile(path.resolve(__dirname, '../../renderer/index.html'));

  // Open the DevTools (remove this line in production)
  win.webContents.openDevTools();
}
