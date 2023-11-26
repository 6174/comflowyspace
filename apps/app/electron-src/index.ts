import url from "url";
import "./pre-launch";
import path from 'path'
import { BrowserWindow, app } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'

// Prepare the renderer once the app is ready
const rendererPath = path.join(__dirname, "../renderer");
console.log("started:", rendererPath);

app.on('ready', async () => {
  await prepareNext(rendererPath)

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const window_url = isDev
    ? 'http://localhost:8000/'
    : url.format({
        pathname: path.join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(window_url)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

