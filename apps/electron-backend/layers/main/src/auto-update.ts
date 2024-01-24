import { app, dialog, MessageBoxOptions } from "electron";
import { autoUpdater, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';
import isDev from "electron-is-dev";
import logger from "@comflowy/node/src/modules/utils/logger";

let findAvaliableUpdate = false;
let updateCheckIntervaId: NodeJS.Timeout;
export function startAutoUpdater() {
    if (require('electron-squirrel-startup')) {
        app.quit();
    }
    if (!isDev) {
        autoUpdater.autoDownload = false;
        autoUpdater.on('update-available', async (info: UpdateInfo) => {
            findAvaliableUpdate = true;
            clearInterval(updateCheckIntervaId);
            logger.info("update-available: " + JSON.stringify(info));
            // showMessage("Update Available", "A new version " + info.version + " is available")

            try {
                await autoUpdater.downloadUpdate();
            } catch(err: any) {
                logger.error("download update error: " + err.message);
                // showMessage("Update App Error", "There was a problem updating the application: " + err.message)
            }
        });

        autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
            logger.info("update-downloaded: " + JSON.stringify(info));
            const dialogOpts: MessageBoxOptions = {
                type: 'info',
                buttons: ['Restart', 'Later'],
                title: 'Application Update',
                message: info.version,
                detail: 'A new version has been downloaded. Restart the application to apply the updates.'
            };

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    autoUpdater.quitAndInstall();
                } else {
                    setTimeout(() => {
                        findAvaliableUpdate = false;
                        startUpdateCheck(60000);
                    }, 1000 * 60 * 60 * 3)
                }
            });
        });

        autoUpdater.on('error', (err) => {
            logger.error('There was a problem updating the application: ' + err.message);
        });

        startUpdateCheck(60000);
    }
}

async function startUpdateCheck(timeInterval: number) {
    try {
        if (!findAvaliableUpdate) {
            await autoUpdater.checkForUpdates();
        }
        updateCheckIntervaId = setInterval(async () => {
            if (!findAvaliableUpdate) {
                try {
                    await autoUpdater.checkForUpdates();
                } catch(err: any) {
                    logger.error("auto update error: " + err.message)   
                }
            }
        }, timeInterval);
    } catch(err: any) {
        logger.error("auto update error: " + err.message)   
        // showMessage("Update App Error", "There was a problem updating the application: " + err.message)
    }
}

function showMessage(title: string, message: string) {
    dialog.showMessageBox({
        title,
        message,
        buttons: ['OK']
    });
}