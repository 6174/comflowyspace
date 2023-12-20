import { ipcMain, dialog } from "electron"
import * as os from "os"
export function startIPC() {
  ipcMain.handle('select-directory', openDirectoryDialog)
  ipcMain.handle('select-home-dir', getHomeDir) 
}

async function openDirectoryDialog() {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.filePaths;
}

async function getHomeDir() {
  const homeDir = os.homedir();
  return homeDir;
}