import winston from 'winston';
import { getAppDataDir } from './get-appdata-dir';
import path from 'path';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.File({ filename: 
      path.resolve(getAppDataDir(), 'error.log'),
      level: 'error' 
    }),
    new winston.transports.File({ filename: 
      path.resolve(getAppDataDir(), 'app.log')
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  // logger.add(new winston.transports.Console({
  //   format: winston.format.simple(),
  // }));
}

export default logger;