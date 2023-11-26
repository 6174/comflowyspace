import log from 'electron-log';
import { isDev } from './utils';

// logs
if (!isDev) {
  log.transports.file.level = "verbose";
}

// err handle
process.on('unhandledRejection', log.error);