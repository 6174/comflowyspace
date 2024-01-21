import { app, dialog, MessageBoxOptions } from "electron";
import { autoUpdater, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';
import isDev from "electron-is-dev";
import log from 'electron-log';
import logger from "@comflowy/node/src/modules/utils/logger";

export function startAutoUpdater() {
    if (require('electron-squirrel-startup')) {
        app.quit();
    }
    if (!isDev) {
        autoUpdater.on('update-available', (info: UpdateInfo) => {
            log.debug('Update available.');
            logger.info("update-available: " + JSON.stringify(info));
        });

        autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
            log.debug('Update downloaded.');

            const dialogOpts: MessageBoxOptions = {
                type: 'info',
                buttons: ['Restart', 'Later'],
                title: 'Application Update',
                message: info.version,
                detail: 'A new version has been downloaded. Restart the application to apply the updates.'
            };

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) autoUpdater.quitAndInstall();
            });
        });

        autoUpdater.on('error', (err) => {
            logger.error('There was a problem updating the application: ' + err.message);
        });

        try {
            autoUpdater.checkForUpdates();
            setInterval(() => {
                autoUpdater.checkForUpdates();
            }, 60000);
        } catch(err: any) {
            logger.error("auto update error: " + err.message)
            // dialog.showMessageBox({
            //     type: 'info',
            //     title: 'Fetch new version failed',
            //     message: 'Error: ' + err.message,
            //     buttons: ['OK']
            // })
        }
    }
}