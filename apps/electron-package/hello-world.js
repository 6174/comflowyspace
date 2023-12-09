// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
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
  win.loadFile(path.resolve(__dirname, './layers/renderer/index.html'));
  // Open the DevTools (remove this line in production)
  win.webContents.openDevTools();
}

// Event handler for when the app is ready
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create a new window if the app is activated (on macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
