import path from 'path'
import { app } from 'electron'
// import prepareNext from 'electron-next'
import { createMainWindow, restoreOrCreateWindow } from "./windows-manager";
import "./prelaunch";
import { startAutoUpdater } from './auto-update';
import { startIPC } from './ipc';

// Prepare the renderer once the app is ready
const rendererPath = path.join(__dirname, "../renderer");
console.log("started:", rendererPath);

/**
 * Disable Hardware Acceleration for more power-save
 */
app.disableHardwareAcceleration();

app.on('ready', async () => {
  // run next frontend service
  // await prepareNext(rendererPath)

  // start desktop window
  await createMainWindow();

  // message hub
  startIPC();

  // auto update listener
  startAutoUpdater()
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

app.on("activate", restoreOrCreateWindow);

