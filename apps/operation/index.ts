import dotenv from 'dotenv';
import path from 'path';

// 初始化环境变量
dotenv.config({
  path: path.resolve(process.cwd(), '../web/.env.local'),
});

import { Command } from 'commander';

const program = new Command();

program
  .command('XXX')
  .description('XXX')
  .action(async (options) => {
    try {
      // XXX
    } catch (e) {
      console.log('Error: ', e);
    }
  });


program.parse();
