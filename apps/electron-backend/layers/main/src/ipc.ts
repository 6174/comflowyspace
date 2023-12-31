import { ipcMain, dialog } from "electron"
import * as os from "os"
import { shell } from 'electron';

export function startIPC() {
  ipcMain.handle('select-directory', openDirectoryDialog)
  ipcMain.handle('select-home-dir', getHomeDir)
  ipcMain.handle('open-url', openURL) 
  ipcMain.handle('open-directory', openDirectory)
}
async function openURL(ev: any, url: string) {
  console.log(url);
  await shell.openExternal(url);
  return true;
}

async function openDirectory(ev: any, directoryPath: string) {
  console.log(directoryPath);
  await shell.openPath(directoryPath);
  return true;
}

async function openDirectoryDialog() {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.filePaths;
}

async function getHomeDir() {
  const homeDir = os.homedir();
  return homeDir;
}