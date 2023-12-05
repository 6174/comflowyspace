import * as path from 'path';
import { FOLDER_NAMES_AND_PATHS, ModelType, getModelDir } from './model-paths';
import * as fs from 'fs';
import models from './models';

/**
 * Manage models
 */
type AllModels = { [key: string]: string[] }
class ModelManager {
    getAllInstalledModels = (): AllModels => {
        const models: AllModels = {};
        Object.entries(FOLDER_NAMES_AND_PATHS).forEach(([folderName, [paths, extensions]]) => {
            if (Array.isArray(extensions)) {
                const supportedExtensions: string[] = extensions.map(ext => ext.slice(1)); // Remove dot from extensions
                const files: string[] = [];
                paths.forEach((dir: string) => {
                    try {
                        const dirContents = fs.readdirSync(dir);
                        dirContents.forEach(file => {
                            if (supportedExtensions.includes(path.extname(file))) {
                                files.push(file);
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
        return models.models;
    }

    getModelDir = (type: ModelType, save_path: string = "default") => {
        return getModelDir(type, save_path);
    }

    installModel = async (modelUrl: string, save_path: string) => {

    }

    unInstallModel = async (model_path: string) => {

    }
}

export const modelManager = new ModelManager();

