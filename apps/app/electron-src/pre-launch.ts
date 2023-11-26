import log from 'electron-log';
import { isDev } from './utils';
import { startAutoUpdater } from './auto-update';

// auto-updater
startAutoUpdater()

// logs
if (!isDev) {
  log.transports.file.level = "verbose";
}

// err handle
process.on('unhandledRejection', log.error);