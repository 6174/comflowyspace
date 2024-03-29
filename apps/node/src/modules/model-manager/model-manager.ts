import * as path from 'path';
import { getFolderNamesAndPaths, getModelDir } from './model-paths';
import * as fs from 'fs';
import {models} from './models';
import { AllModels, MarketModel, ModelType } from './types';
import { getFileSizeSync } from '../utils/file-size';

class ModelManager {
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
        return models as MarketModel[];
    }

    getModelDir = (type: ModelType, save_path: string = "default") => {
        return getModelDir(type, save_path);
    }
}

export const modelManager = new ModelManager();
