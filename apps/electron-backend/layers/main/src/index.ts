import path from 'path'
import { app } from 'electron'
// import prepareNext from 'electron-next'
import { createMainWindow } from "./windows-manager";
import "./prelaunch";
import { startAutoUpdater } from './auto-update';

// Prepare the renderer once the app is ready
const rendererPath = path.join(__dirname, "../renderer");
console.log("started:", rendererPath);

app.on('ready', async () => {
  // run next frontend service
  // await prepareNext(rendererPath)

  // start desktop window
  await createMainWindow();

  // auto update listener
  startAutoUpdater()
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

