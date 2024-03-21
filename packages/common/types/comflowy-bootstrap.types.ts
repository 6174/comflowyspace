import { ComfyUIRunFPMode, ComfyUIRunVAEMode } from "./comfy-workflow.types";

export type EnvRequirements = {
  isCondaInstalled: boolean;
  isPythonInstalled: boolean;
  isGitInstalled: boolean;
  isTorchInstalled: boolean;
  isComfyUIInstalled: boolean;
  isBasicModelInstalled: boolean;
  isBasicExtensionInstalled: boolean;
  isComfyUIStarted: boolean;
  isSetupedConfig: boolean;
  comfyUIVersion: string;
}

export type AppConfigs = {
  appSetupConfig?: {
    comfyUIDir: string,
    stableDiffusionDir: string
  },
  runConfig?: {
    fpmode: ComfyUIRunFPMode;
    vaemode: ComfyUIRunVAEMode;
  }
};

export type BootstrapError = {
  title: string;
  type: string;
  level?: "warn" | "error";
  message: string;
  createdAt?: number;
  data?: Record<string, any>;
}

