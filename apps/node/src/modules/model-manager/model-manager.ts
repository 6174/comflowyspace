import * as path from 'path';
import { getFolderNamesAndPaths, getModelDir, getModelPath } from './model-paths';
import * as fs from 'fs';
import {models} from './models';
import { AllModels, MarketModel, ModelType } from './types';
import { getFileSizeSync } from '../utils/file-size';
import { getAppDataDir } from '../utils/get-appdata-dir';
import { channel } from 'diagnostics_channel';
import { channelService } from '../channel/channel.service';
import { CHANNELS, CHANNEL_EVENTS } from '@comflowy/common/types/channel.types';

class ModelManager {
    constructor() {
        channelService.on(CHANNELS.MAIN, CHANNEL_EVENTS.UPDATE_MODEL_META, (ev) => {
            this.updateModelMeta(ev.payload);
        });
    }

    getMetaFilePath = () => {
        const appDir = getAppDataDir();
        return path.resolve(appDir, 'models.meta.json');
    }

    /**
     * update market model meta info from file_name
     * @param model 
     */
    updateModelMeta = (models: [MarketModel]) => {
        const metaPath = this.getMetaFilePath();
        const exist = fs.existsSync(metaPath);
        let data:any = {};
        if (exist) {
            data = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        } 

        models.forEach(model => {
            const modelKey = model.filename;
            data[modelKey] = model;
        });

        fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
    }

    /**
     * get all model meta infos
     * @returns 
     */
    getModelMetas = () => {
        const metaPath = this.getMetaFilePath();
        const exist = fs.existsSync(metaPath);
        if (exist) {
            return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        }
        return {};
    }

    /**
     * get meta info of a model
     * @param modelKey 
     * @returns 
     */
    getModelMeta = (modelKey: string) => {
        const metas = this.getModelMetas();
        return metas[modelKey];
    }

    getAllInstalledModels = (): AllModels => {
        const models: AllModels = {};
        const {FOLDER_NAMES_AND_PATHS} = getFolderNamesAndPaths();
        Object.entries(FOLDER_NAMES_AND_PATHS).forEach(([folderName, [paths, extensions]]) => {
            if (Array.isArray(extensions)) {
                const supportedExtensions: string[] = extensions; // Remove dot from extensions
                const files: {
                    name: string,
                    size: string,
                    dir: string,
                    path: string
                }[] = [];
                paths.forEach((dir: string) => {
                    try {
                        const dirContents = fs.readdirSync(dir);
                        dirContents.forEach(file => {
                            if (supportedExtensions.includes(path.extname(file))) {
                                files.push({
                                    dir: dir,
                                    path: file,
                                    name: file,
                                    size: getFileSizeSync(path.resolve(dir, file))
                                });
                            }
                        });
                    } catch (error) {
                        console.error(`Error reading directory ${dir}: ${error}`);
                    }
                });
                models[folderName] = files;
            }
        });

        delete models['configs']
        return models;
    }

    getAllUninstalledModels = () => {
        return models;
    }

    getModelDir = (type: ModelType, save_path: string = "default") => {
        return getModelDir(type, save_path);
    }
}

export const modelManager = new ModelManager();
