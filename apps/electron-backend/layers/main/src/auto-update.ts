import { app, dialog, MessageBoxOptions } from "electron";
import { autoUpdater, UpdateDownloadedEvent } from 'electron-updater';
import isDev from "electron-is-dev";
import log from 'electron-log';

export function startAutoUpdater() {
    if (require('electron-squirrel-startup')) {
        app.quit();
    }
    if (!isDev) {
        setInterval(() => {
            autoUpdater.checkForUpdates();
        }, 60000);

        autoUpdater.on('update-available', () => {
            log.debug('Update available.');
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
            log.error('There was a problem updating the application');
            log.error(err);
        });
    }
}