import { BrowserWindow } from "electron";
import path from "path";

let loadingScreen: Electron.BrowserWindow | null;

export function showLoadingScreen() {
    loadingScreen = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: false,
        backgroundColor: "white"
    });
    loadingScreen.loadFile(path.resolve(__dirname, '../../renderer/dist/loading.html'));
    loadingScreen.on('closed', () => (loadingScreen = null));
    loadingScreen.show();
}

export function closeLoadingScreen() {
    loadingScreen && loadingScreen?.close()
}