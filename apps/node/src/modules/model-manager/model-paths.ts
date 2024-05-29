import * as path from 'path';
import { getComfyUIDir } from "../utils/get-appdata-dir";
import { FolderPaths, MarketModel, ModelExt, ModelType } from './types';
import * as fsExtra from "fs-extra";
import yaml from 'js-yaml';
import { uuid } from '@comflowy/common';
import logger from '../utils/logger';
import { isWindows } from '../utils/env';
export const supported_pt_extensions: ModelExt[] = ['.ckpt', '.pt', '.bin', '.pth', '.safetensors'];

export function getFolderNamesAndPaths() {
  const BASE_PATH = getComfyUIDir();
  const MODELS_DIR = `${BASE_PATH}/models`;
  const FOLDER_NAMES_AND_PATHS: FolderPaths = {
    checkpoints: [[`${MODELS_DIR}/checkpoints`], supported_pt_extensions],
    configs: [[`${MODELS_DIR}/configs`], ['.yaml']],
    loras: [[`${MODELS_DIR}/loras`], supported_pt_extensions],
    vae: [[`${MODELS_DIR}/vae`], supported_pt_extensions],
    clip: [[`${MODELS_DIR}/clip`], supported_pt_extensions],
    unet: [[`${MODELS_DIR}/unet`], supported_pt_extensions],
    'T2I-Adapter': [[`${MODELS_DIR}/clip`], supported_pt_extensions],
    'T2I-Style': [[`${MODELS_DIR}/unet`], supported_pt_extensions],
    clip_vision: [[`${MODELS_DIR}/clip_vision`], supported_pt_extensions],
    style_models: [[`${MODELS_DIR}/style_models`], supported_pt_extensions],
    embeddings: [[`${MODELS_DIR}/embeddings`], supported_pt_extensions],
    diffusers: [[`${MODELS_DIR}/diffusers`], ['folder']],
    vae_approx: [[`${MODELS_DIR}/vae_approx`], supported_pt_extensions],
    controlnet: [
      [`${MODELS_DIR}/controlnet`, `${MODELS_DIR}/t2i_adapter`],
      supported_pt_extensions,
    ],
    gligen: [[`${MODELS_DIR}/gligen`], supported_pt_extensions],
    upscale_models: [[`${MODELS_DIR}/upscale_models`], supported_pt_extensions],
    // custom_nodes: [[`${BASE_PATH}/custom_nodes`], []], // Adjust 'any' based on the actual value type
    hypernetworks: [[`${MODELS_DIR}/hypernetworks`], supported_pt_extensions],
    classifiers: [[`${MODELS_DIR}/classifiers`], { '': null }], // Adjust 'null' based on the actual value type
  };
  const OUTPUT_DIRECTORY = `${BASE_PATH}/output`;
  const TEMP_DIRECTORY = `${BASE_PATH}/temp`;
  const INPUT_DIRECTORY = `${BASE_PATH}/input`;
  const EXTRA_MODEL_PATH_CONFIG = `${BASE_PATH}/extra_model_paths.yaml`

  if (fsExtra.existsSync(EXTRA_MODEL_PATH_CONFIG)) {
    parseExtraModelConfig(EXTRA_MODEL_PATH_CONFIG, add_model_folder_path);
  }

  return {
    BASE_PATH,
    MODELS_DIR,
    FOLDER_NAMES_AND_PATHS,
    OUTPUT_DIRECTORY,
    TEMP_DIRECTORY,
    INPUT_DIRECTORY
  };

  function add_model_folder_path(type: string, path: string) {
    const value = (FOLDER_NAMES_AND_PATHS as any)[type];
    if (value) {
      value[0].push(path);
    }
  }

}

// #config for a1111 ui
// #all you have to do is change the base_path to where yours is installed
// a111:
//     base_path: path/to/stable-diffusion-webui/
//     checkpoints: models/Stable-diffusion
//     configs: models/Stable-diffusion
//     vae: models/VAE
//     loras: |
//         models/Lora
//         models/LyCORIS
//     upscale_models: |
//                   models/ESRGAN
//                   models/RealESRGAN
//                   models/SwinIR
//     embeddings: embeddings
//     hypernetworks: models/hypernetworks
//     controlnet: models/ControlNet
export function parseExtraModelConfig(extraModelConfigFilePath: string, callback: (type: string, path: string) => void) {
  try {
    const fileContent = fsExtra.readFileSync(extraModelConfigFilePath, 'utf8');
    const configGroups = yaml.load(fileContent) as any;
    // multiple config groups
    for (let c in configGroups) {
      let conf = configGroups[c];
      if (conf === null) {
        continue;
      }
      let basePath = null;
      if ("base_path" in conf) {
        basePath = conf["base_path"];
        delete conf["base_path"];
      }

      for (let x in conf) {
        for (let y of conf[x].split("\n")) {
          if (y.length === 0) {
            continue;
          }
          let fullPath = y;
          if (basePath !== null) {
            fullPath = path.join(basePath, fullPath);
          }
          logger.info("Adding extra search path", x, fullPath);
          callback(x, fullPath); // Uncomment this line when the function is available
        }
      }
    }
  } catch (err) {
    logger.info("parse extra model config error", err);
  }
}

export function getModelDir(type: ModelType, save_path: string = "default"): string {
  const { BASE_PATH, MODELS_DIR, FOLDER_NAMES_AND_PATHS } = getFolderNamesAndPaths();
  if (save_path !== 'default') {
    if (save_path.includes('..') || save_path.startsWith('/')) {
      console.warn(`[WARN] '${save_path}' is not allowed path. So it will be saved into 'models/etc'.`);
      return 'etc';
    } else {
      if (save_path.startsWith('custom_nodes')) {
        return `${BASE_PATH}/${save_path}`;
      } else {
        return `${MODELS_DIR}/${save_path}`;
      }
    }
  } else {
    const model_type = type;
    switch (model_type) {
      case 'checkpoints':
      case 'unclip':
        return FOLDER_NAMES_AND_PATHS.checkpoints[0][0];
      case 'VAE':
        return FOLDER_NAMES_AND_PATHS.vae[0][0];
      case 'lora':
        return FOLDER_NAMES_AND_PATHS.loras[0][0];
      case 'T2I-Adapter':
      case 'T2I-Style':
      case 'controlnet':
        return FOLDER_NAMES_AND_PATHS.controlnet[0][0];
      case 'clip_vision':
        return FOLDER_NAMES_AND_PATHS.clip_vision[0][0];
      case 'gligen':
        return FOLDER_NAMES_AND_PATHS.gligen[0][0];
      case 'upscale':
        return FOLDER_NAMES_AND_PATHS.upscale_models[0][0];
      case 'embeddings':
        return FOLDER_NAMES_AND_PATHS.embeddings[0][0];
      default:
        return 'etc';
    }
  }
}

export function getModelPath(type: string, save_path: string, file_name: string): string {
  const modelDir = getModelDir(type as any, save_path);
  return path.join(modelDir, file_name); // Add the appropriate value for getModelPath
}

const STABLE_DIFFUSION_MODEL_MAPPING_CONFIG_NAME = "a1111";
export function createOrUpdateExtraConfigFileFromStableDiffusion(stableDiffusionPath?: string) {
  const BASE_PATH = getComfyUIDir();
  const extraModelConfigFilePath = `${BASE_PATH}/extra_model_paths.yaml`;

  // Load existing config
  let config: any = {};
  if (fsExtra.existsSync(extraModelConfigFilePath)) {
    const fileContent = fsExtra.readFileSync(extraModelConfigFilePath, 'utf8');
    try {
      config = yaml.load(fileContent) || {};
    } catch (err: any) {
      throw new Error("load yaml error:" + err.message)
    }
  }

  delete config[STABLE_DIFFUSION_MODEL_MAPPING_CONFIG_NAME];

  if (stableDiffusionPath && fsExtra.existsSync(stableDiffusionPath)) {
    config[STABLE_DIFFUSION_MODEL_MAPPING_CONFIG_NAME] = {
      base_path: stableDiffusionPath,
      checkpoints: 'models/Stable-diffusion',
      configs: 'models/Stable-diffusion',
      vae: 'models/VAE',
      loras: 'models/Lora\nmodels/LyCORIS',
      upscale_models: 'models/ESRGAN\nmodels/RealESRGAN\nmodels/SwinIR',
      embeddings: 'embeddings',
      hypernetworks: 'models/hypernetworks',
      controlnet: 'models/ControlNet'
    };
  }

  try {
    // Write back to file
    const newYamlContent = yaml.dump(config);
    fsExtra.writeFileSync(extraModelConfigFilePath, newYamlContent, 'utf8');
  } catch (err: any) {
    throw new Error("write yaml error:" + err.message)
  }
}

