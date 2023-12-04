import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import simpleGit from 'simple-git';
import { Extension } from './comfy-extension-manager';

const custom_nodes_path = '/path/to/custom_nodes'; // Change this to your custom nodes path
const js_path = '/path/to/js'; // Change this to your JS path

export async function gitRepoHasUpdates(dirPath: string, doFetch: boolean, doUpdate: boolean): Promise<boolean> {
  const git = simpleGit(dirPath);

  if (doFetch) {
    await git.fetch();
  }

  const status = await git.status();

  if (status.behind > 0 || (doUpdate && status.ahead > 0)) {
    if (doUpdate) {
        await git.pull();
    }
    return true;
  }

  return false;
}

export async function checkAExtensionInstalled(item: Extension, doFetch = false, doUpdateCheck = true, doUpdate = false): Promise<void> {
  item.installed = false;
  item.need_update = false;
  item.disabled = false;

  if (item.install_type === "git-clone" && item.files.length === 1) {
    let url = item.files[0];

    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const dirName = path.parse(url).name.replace('.git', '');
    const dirPath = path.join(custom_nodes_path, dirName);

    if (fs.existsSync(dirPath)) {
      try {
        if (doUpdateCheck && (await gitRepoHasUpdates(dirPath, doFetch, doUpdate))) {
          item.need_update = true;
          item.installed = true;
        } else {
          item.installed = true;
        }
      } catch {
        item.installed = true;
      }
    } else if (fs.existsSync(dirPath + '.disabled')) {
      item.installed = true;
      item.disabled = true;
    } else {
      item.installed = false;
    }
  } else if (item.install_type === 'copy' && item.files.length === 1) {
    const dirName = path.basename(item.files[0]);
    let base_path;

    if (item.files[0].endsWith('.py')) {
      base_path = custom_nodes_path;
    } else if (item.js_path) {
      base_path = path.join(js_path, item.js_path);
    } else {
      base_path = js_path;
    }

    const filePath = path.join(base_path, dirName);

    if (fs.existsSync(filePath)) {
      item.installed = true;
    } else if (fs.existsSync(filePath + '.disabled')) {
      item.installed = true;
      item.disabled = true;
    } else {
      item.installed = false;
    }
  }
}

export async function checkExtensionsInstalled(extensions: Extension[], doFetch = false, doUpdateCheck = true, doUpdate = false): Promise<void> {
  if (doFetch) {
    console.log('Start fetching...');
  } else if (doUpdate) {
    console.log('Start updating...');
  } else if (doUpdateCheck) {
    console.log('Start update check...');
  }

  async function processExtension(item: Extension): Promise<void> {
    await checkAExtensionInstalled(item, doFetch, doUpdateCheck, doUpdate);
  }

  await Promise.all(extensions.map(processExtension));

  if (doFetch) {
    console.log('\x1b[2K\rFetching done.');
  } else if (doUpdate) {
    const updateExists = extensions.some((item) => item.need_update);
    if (updateExists) {
      console.log('\x1b[2K\rUpdate done.');
    } else {
      console.log('\x1b[2K\rAll extensions are already up-to-date.');
    }
  } else if (doUpdateCheck) {
    console.log('\x1b[2K\rUpdate check done.');
  }
}

