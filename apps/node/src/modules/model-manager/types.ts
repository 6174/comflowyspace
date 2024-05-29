export type ModelExt = '.ckpt' | '.pt' | '.bin' | '.pth' | '.safetensors';
export type ModelType =
  'checkpoints' | 'unclip' | 'T2I-Adapter' | 'T2I-Style' |
  'lora' | 'VAE' | 'clip' | 'unet' | 'clip_vision' |
  'style_models' | 'embeddings' | 'diffusers' |
  'vae_approx' | 'controlnet' | 'gligen' | 'upscale';

export type SDModelBase = 'SDXL' | 'SD1.5' | 'SD2' | 'SD2.1' | 'SD2.2' | 'SD2.3' | 'SD2.4' | 'SD2.5' | 'SD2.6';

export interface FolderPaths {
  checkpoints: [string[], ModelExt[]];
  configs: [string[], string[]];
  loras: [string[], ModelExt[]];
  vae: [string[], ModelExt[]];
  clip: [string[], ModelExt[]];
  unet: [string[], ModelExt[]];
  clip_vision: [string[], ModelExt[]];
  style_models: [string[], ModelExt[]];
  embeddings: [string[], ModelExt[]];
  diffusers: [string[], string[]];
  vae_approx: [string[], ModelExt[]];
  controlnet: [string[], ModelExt[]];
  gligen: [string[], ModelExt[]];
  upscale_models: [string[], ModelExt[]];
  // custom_nodes: [string[], any[]]; // Adjust 'any' based on the actual value type
  hypernetworks: [string[], ModelExt[]];
  classifiers: [string[], { '': any }]; // Adjust 'any' based on the actual value type
  'T2I-Adapter': [string[], ModelExt[]];
  'T2I-Style': [string[], ModelExt[]];
}

export {type MarketModel} from '@comflowy/common/types/model.types';

/**
 * Manage models
 */
export type AllModels = {
  [key: string]: {
    name: string,
    size: string
  }[]
}