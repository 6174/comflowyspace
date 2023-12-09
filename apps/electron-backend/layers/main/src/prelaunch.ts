import log from 'electron-log/main';
import { isDev } from './utils';
import { dialog } from 'electron';

log.initialize({ preload: true });

// logs
if (!isDev) {
  log.transports.file.level = "verbose";
}

// err handle
process.on('unhandledRejection', (error: any) => {
  dialog.showErrorBox('Unhandled Rejection', error.toString())
  log.error(error);
});