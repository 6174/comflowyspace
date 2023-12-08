import dotenv from 'dotenv';
import path from 'path';

// 初始化环境变量
dotenv.config({
  path: path.resolve(process.cwd(), '../web/.env.local'),
});

import { Command } from 'commander';
import { fetchModelSize } from './commands/fetch-model-sizes';

const program = new Command();

program
  .command('fetchModelSize')
  .description('batch get model sizes')
  .action(async (options) => {
    try {
      await fetchModelSize();
    } catch (e) {
      console.log('Error: ', e);
    }
  });


program.parse();
