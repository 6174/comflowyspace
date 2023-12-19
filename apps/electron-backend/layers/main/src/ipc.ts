import { ipcMain, dialog } from "electron"

export function startIPC() {
  ipcMain.handle('select-directory', openDirectoryDialog)
}

async function openDirectoryDialog() {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.filePaths;
}