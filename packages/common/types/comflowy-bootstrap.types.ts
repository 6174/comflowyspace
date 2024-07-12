import { ComfyUIRunConfig, ComfyUIRunFPMode, ComfyUIRunPreviewMode, ComfyUIRunVAEMode } from "./comfy-workflow.types";

export type EnvRequirements = {
  isCondaInstalled: boolean;
  isPythonInstalled: boolean;
  isGitInstalled: boolean;
  isTorchInstalled: boolean;
  isComfyUIInstalled: boolean;
  isBasicModelInstalled: boolean;
  isBasicExtensionInstalled: boolean;
  isComfyUIStarted: boolean;
  isCustomComfyEnv: boolean;
  isSetupedConfig: boolean;
  comfyUIVersion: string;
}

export type AppConfigs = {
  appSetupConfig: {
    pythonPath: string;
    isCustomComfyEnv: boolean,
    comfyUIDir: string,
    stableDiffusionDir?: string
    civitaiToken?: string
  },
  runConfig: ComfyUIRunConfig
};

export type BootstrapError = {
  title: string;
  type: string;
  level?: "warn" | "error";
  message: string;
  createdAt?: number;
  data?: Record<string, any>;
}

