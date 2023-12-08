import * as path from 'path';
import { FOLDER_NAMES_AND_PATHS, ModelType, getModelDir } from './model-paths';
import * as fs from 'fs';
import {models} from './models';

export type MarketModel = {
    name: string;
    type: ModelType;
    base: string;
    save_path: string;
    description: string;
    reference: string;
    filename: string;
    url: string;
}
  
/**
 * Manage models
 */
export type AllModels = { [key: string]: {
    name: string,
    size: number
}[]}

class ModelManager {
    getAllInstalledModels = (): AllModels => {
        const models: AllModels = {};
        Object.entries(FOLDER_NAMES_AND_PATHS).forEach(([folderName, [paths, extensions]]) => {
            if (Array.isArray(extensions)) {
                const supportedExtensions: string[] = extensions; // Remove dot from extensions
                const files: {
                    name: string,
                    size: number
                }[] = [];
                paths.forEach((dir: string) => {
                    try {
                        const dirContents = fs.readdirSync(dir);
                        dirContents.forEach(file => {
                            if (supportedExtensions.includes(path.extname(file))) {
                                files.push({
                                    name: file,
                                    size: 1
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

