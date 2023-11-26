import { MessageBoxOptions, app, autoUpdater, dialog } from "electron";
import log from 'electron-log';

// const isMacOS = false;
import isDev from "electron-is-dev";

export function startAutoUpdater() {
    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
        app.quit();
    }
    if (!isDev) {
        const server = "https://refi-updater.vercel.app";
        const feed = `${server}/update/${process.platform}/${app.getVersion()}`
    
        autoUpdater.setFeedURL({ url: feed, serverType: "json" })
    
        setInterval(() => {
            autoUpdater.checkForUpdates()
        }, 60000);
    
        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
            log.debug('Downloaded new update');
            const dialogOpts: MessageBoxOptions = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
            }
    
            dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
            })
        });
    
        autoUpdater.on('error', message => {
            log.error('There was a problem updating the application')
            log.error(message)
        })
    } 
}


