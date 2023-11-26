import { IpcMainEvent, ipcMain } from "electron"

export function startIPC() {
  // listen the channel `message` and resend the received message to the renderer process
  ipcMain.on('message', (event: IpcMainEvent, message: any) => {
    console.log(message)
    setTimeout(() => event.sender.send('message', 'hi from electron'), 500)
  })
}
