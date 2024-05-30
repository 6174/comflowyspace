import _ from "lodash";
import { Widget } from "./comfy-widget.types";

export type LoRAOptionValue = {
  content: string;
  image?: string;
}

export enum BaseModel {
  SD14 = "SD 1.4",
  SD15 = "SD 1.5",
  SD15LCM = "SD 1.5 LCM",
  SD15Hyper = "SD 1.5 Hyper",
  SD20 = "SD 2.0",
  SD21 = "SD 2.1",
  SDXL10 = "SDXL 1.0",
  SD3 = "SD 3",
  SDXL10LCM = "SDXL 1.0 LCM",
  SDXLTurbo = "SDXL Turbo",
  SDXLLightning = "SDXL Lightning",
  SDXLHyper = "SDXL Hyper",
  StableCascade = "Stable Cascade",
  SVD = "SVD",
  SVDXT = "SVD XT",
  PlaygroundV2 = "Playground V2",
  PixArtA = "PixArt A",
  OTHER = "other",
  UNKNOWN = "unknown",
}

export enum BaseModelType {
  INPAINTING = "Inpainting",
  STANDARD = "Standard",
  OUTPAINTING = "Outpainting",
  OTHER = "other",
}

export enum ModelType {
  Checkpoint = "Checkpoint",
  Embedding = "Embedding",
  Hypernetwork = "Hypernetwork",
  AestheticGradient = "Aesthetic Gradient",
  LoRA = "LORA",
  LyCORIS = "LyCORIS",
  DoRA = "DoRA",
  Controlnet = "Controlnet",
  Upscaler = "Upscaler",
  Motion = "Motion",
  VAE = "VAE",
  Poses = "Poses",
  Wildcards = "Wildcards",
  Workflows = "Workflows",
  Other = "Other",
}

export type MarketModel = {
  id?: string;
  name: string;
  type: ModelType;
  base_model: BaseModel;
  base_model_type?: BaseModelType;
  sha256: string;
  download_url: string;
  filename: string;
  save_path: string;
  reference: string;
  description?: string;
  source: "civitai" | "huggingface" | "other",
  meta?: {
    modelId?: number;
    modelVersionId?: number;
    image_url?: string;
    [_: string]: any
  };
  source_data?: any;
}

export enum ModelDownloadChannelEvents {
  onModelDownloadProgress = "onModelDownloadProgress",
  onModelDownloadSuccess = "onModelDownloadSuccess",
  onModelDownloadFailed = "onModelDownloadFailed",
}

export type CivitAIModelVersion = {
  id: number;
  name: string;
  modelId: number;
  baseModel: string;
  nsfwLevel: number;
  baseModelType: string;
  downloadUrl: string;
  files: {
    id: number;
    sizeKB: number;
    type: string;
    name: string;
    metadata: {
      "format": string,
      "size": string,
      "fp": string
    },
    hashes: {
      SHA256: string
    },
    downloadUrl: string;
    primary: boolean;
  }[],
  images: {
    id: number;
    url: string;
    width: number;
    height: number;
    nsfwLevel: number;
    hash: string;
    type: 'image' | string;
  }[],
}

export type CivitAIModel = {
  id: number;
  name: number;
  description: string;
  type: string;
  creator: {
    username: string;
    image: string;
  },
  tags: string[], // ["base model", "asian", "realistic", "photoralistic"],
  modelVersions: CivitAIModelVersion[]
}


export function turnCivitAiModelToMarketModel(civitModel: CivitAIModel, civitModelVersion: CivitAIModelVersion): MarketModel {
  let save_path = "";
  switch (civitModel.type) {
    case ModelType.Checkpoint:
      save_path = "checkpoints";
      break;
    case ModelType.LoRA:
      save_path = "loras";
      break;
    case ModelType.Controlnet:
      save_path = "controlnet";
      break;
    default:
      break;
  }

  return {
    id: civitModel.id + "",
    name: civitModel.name + "/" + civitModelVersion.name,
    type: civitModel.type as any,
    base_model: civitModelVersion.baseModel as any,
    base_model_type: civitModelVersion.baseModelType as any,
    sha256: civitModelVersion.files[0].hashes.SHA256,
    download_url: civitModelVersion.files[0].downloadUrl.replace("api.", ""),
    filename: civitModelVersion.files[0].name,
    save_path,
    source: "civitai",
    reference: `https://civitai.com/models/${civitModel.id}`,
    meta: {
      modelId: civitModel.id,
      modelVersionId: civitModelVersion.id,
      image_url: civitModelVersion.images.filter(img => img.nsfwLevel <= 5)[0].url,
    }
  }
}

export function getFilePathFromMarktModel(model: MarketModel): { withHashPath: string, withOutHashPath: string} {
  const withOutHashPath = `${model.filename}`
  const withHashPath = `${model.source}___${model.sha256}___${model.filename}`
  return {
    withHashPath,
    withOutHashPath
  }
}

export function findValueInModelOptions(options: (string[] | LoRAOptionValue[]), value: string | LoRAOptionValue | MarketModel): string  | LoRAOptionValue | undefined {
  if (typeof value === "string") {
    const ret = options.find(opt => {
      return opt === value;
    })
    return ret as string
  }

  const loraValue = value as LoRAOptionValue;
  if (loraValue.content) {
    const ret = options.find((opt) => {
      return (opt as LoRAOptionValue).content === loraValue.content;
    })
    return ret as LoRAOptionValue
  }
}

export function isMarketModel(value: any): value is MarketModel {
  return _.isObject(value) && "type" in value && "download_url" in value && "filename" in value;
}

export function isLoRAOptionValue(value: any): value is LoRAOptionValue {
  return _.isObject(value) && "content" in value;
}

export function isLoRAField(widget: Widget, fieldName: string): boolean {
  return fieldName === "lora_name";
}

export function isStringValue(value: any): value is string {
  return _.isString(value)
}

export function isCustomModelField(
  widget: Widget,
  fieldName: string
): boolean {
  if (widget.name === "CheckpointLoaderSimple") {
    if (fieldName === "ckpt_name") {
      return true
    }
  }
  if (fieldName === "lora_name") {
    return true
  }
  return false;
}