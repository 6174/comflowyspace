import * as path from 'path';
import { getFolderNamesAndPaths, getModelDir, getModelPath, supported_pt_extensions } from './model-paths';
import * as fs from 'fs';
import {models} from './models';
import { AllModels, MarketModel, ModelType } from './types';
import { getFileSizeSync } from '../utils/file-size';
import { getAppDataDir } from '../utils/get-appdata-dir';
import { channelService } from '../channel/channel.service';
import { CHANNELS, CHANNEL_EVENTS } from '@comflowy/common/types/channel.types';
import { calculateSHA } from '../utils/sha';
import { getCivitModelByHash } from './civitai';
import { turnCivitAiModelToMarketModel } from '@comflowy/common/types/model.types';
import { TaskEventDispatcher } from '../task-queue/task-queue';

let updatingMetaFromCivitAI = false;
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

    tryUpdateMetaFromCivitAI = async (dispatch: TaskEventDispatcher) => {
        if (updatingMetaFromCivitAI) {
            return;
        }
        updatingMetaFromCivitAI = true;
        const metas = this.getModelMetas();
        const metaPath = this.getMetaFilePath();
        dispatch({
            message: "Updating model meta from CivitAI, you can config your api token key in settings pannel"
        });
        try {
            const modelFiles = await this.getAllInstalledModels();
            for (const modelType in modelFiles) {
                const models = modelFiles[modelType];
                for (const model of models) {
                    const modelKey = this.getModelMetaKey(modelType, model.name)
                    if (!metas[modelKey]) {
                        await fetchFileInfo(modelKey, model.path);
                    } else {
                        const meta = metas[modelKey];
                        if (meta.failed) {
                            const lastCheck = new Date(metas[modelKey].last_check);
                            if (new Date().getTime() - lastCheck.getTime() > 1000 * 60 * 60 * 24 * 3) {
                                await fetchFileInfo(modelKey, model.path);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to update model meta from CivitAI', error);
        }

        updatingMetaFromCivitAI = false;
        fs.writeFileSync(metaPath, JSON.stringify(metas, null, 2));

        channelService.emit(CHANNELS.MAIN, {
            type: CHANNEL_EVENTS.MODEL_META_UPDATED,
            payload: {
                message: "Model meta updated from CivitAI successrm "
            }
        });

        async function fetchFileInfo(modelKey: string, file: string) {
            try {
                dispatch({
                    message: "Start check model file: " + file
                });
                const fileHash = await calculateSHA(file);
                const ext = path.extname(file);
                if (supported_pt_extensions.indexOf(ext as any) === -1) {
                    return
                }
                const civitAIModelVersion = await getCivitModelByHash(fileHash) as any;
                if (civitAIModelVersion.model) {
                    dispatch({
                        message: "Check model file: " + file + " with hash: " + fileHash + " on CivitAI success"
                    });
                    const marketModel = turnCivitAiModelToMarketModel(civitAIModelVersion.model, civitAIModelVersion)
                    metas[modelKey] = marketModel
                } else {
                    dispatch({
                        message: "Check model file: " + file + " with hash: " + fileHash + " on CivitAI failed"
                    });
                    metas[modelKey] = {
                        failed: true,
                        last_check: new Date().toISOString(),
                    }
                }
            } catch (err: any) {
                dispatch({
                    message: "Check model file: " + file + " on CivitAI failed " + err.message
                });
                console.log(err);
                metas[modelKey] = {
                    failed: true,
                    last_check: new Date().toISOString(),
                }
            }
        }
    }

    /**
     * update market model meta info
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
            const modelKey = this.getModelMetaKey(model.save_path, model.filename);
            data[modelKey] = model;
        });

        fs.writeFileSync(metaPath, JSON.stringify(data, null, 2));
    }

    getModelMetaKey = (save_path: string, filename: string) => {
        return `${save_path}__${filename}`;
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

    getAllInstalledModels = async (): Promise<AllModels> => {
        const models: AllModels = {};
        const {FOLDER_NAMES_AND_PATHS} = getFolderNamesAndPaths();
        const metas = this.getModelMetas();
        Object.entries(FOLDER_NAMES_AND_PATHS).forEach(([folderName, [paths, extensions]]) => {
            if (Array.isArray(extensions)) {
                const supportedExtensions: string[] = extensions; // Remove dot from extensions
                const files: {
                    name: string,
                    size: string,
                    dir: string,
                    path: string,
                    meta: any
                }[] = [];
                paths.forEach((dir: string) => {
                    try {
                        const dirContents = fs.readdirSync(dir);
                        dirContents.forEach(file => {
                            if (supportedExtensions.includes(path.extname(file))) {
                                files.push({
                                    dir: dir,
                                    meta: metas[this.getModelMetaKey(folderName, file)],
                                    path: path.resolve(dir, file),
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
