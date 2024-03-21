import { getComfyUIEnvRequirements } from "../comfyui-bridge/bridge";
import { create } from "zustand";
import { ComfyUIRunPrecisionMode } from "../types";

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
    appConfig: {
        appSetupConfig?: {
            comfyUIDir: string,
            stableDiffusionDir: string
        },
        modeSetupConfig?: {
            mode: ComfyUIRunPrecisionMode
        }
    };
}

export type BootstrapError = {
    title: string;
    type: string;
    level?: "warn" | "error";
    message: string;
    createdAt?: number;
    data?: Record<string, any>;
}

type DashboardState = {
    loading: boolean;
    env?: EnvRequirements;
    bootstrapTasks: BootstrapTask[];
    bootstraped: boolean;
    showComfyUIProcessModal: boolean;
    bootstrapMessages: string[];
    errors: BootstrapError[];
}

export enum BootStrapTaskType {
    "setupConfig" = "setupConfig",
    "installConda" = "installConda",
    "installPython" = "installPython",
    "installGit" = "installGit",
    "installTorch" = "installTorch",
    "installComfyUI" = "installComfyUI",
    "installBasicModel" = "installBasicModel",
    "installBasicExtension" = "installBasicExtension",
    "startComfyUI" = "startComfyUI"
}

export type BootstrapTask = {
    type: BootStrapTaskType;
    title: string;
    description?: string;
    finished?: boolean;
}

type DashboardAction = {
    onInit: () => void,
    setBootstrapTasks: (tasks: BootstrapTask[]) => void;
    addBootstrapMessage: (message: string) => void;
    addBootstrapError: (error: BootstrapError) => void;
}

const useDashboardState = create<DashboardState & DashboardAction>((set, get) => ({
    docs: [],
    appConfig: {},
    bootstraped: false,
    loading: true,
    bootstrapMessages: [],
    errors: [],
    showComfyUIProcessModal: false,
    addBootstrapMessage: (message: string) => {
        set({
            bootstrapMessages: [
                ...get().bootstrapMessages,
                message
            ]
        })
    },
    addBootstrapError: (error: BootstrapError) => {
        set({
            errors: [
                error,
                ...get().errors,
            ]
        })
    },
    onInit: async () => {
        const ret = await getComfyUIEnvRequirements();
        if (ret.data) {
            const tasks = checkEnvRequirements(ret.data).filter(t => !t.finished);
            const allTaskFinished = tasks.every(t => t.finished);
            const rawAppConfig = ret.data.appConfig;
            let appConfig: EnvRequirements["appConfig"] = {};
            try {
                if (rawAppConfig.appSetupConfig && rawAppConfig.appSetupConfig.length > 0) {
                    appConfig.appSetupConfig = JSON.parse(rawAppConfig.appSetupConfig);
                }
                if (rawAppConfig.modeSetupConfig && rawAppConfig.modeSetupConfig.length > 0) {
                    appConfig.modeSetupConfig = JSON.parse(rawAppConfig.modeSetupConfig);
                }
            } catch(err) {
                console.log(err);
            }

            set({
                env: {
                    ...ret.data,
                    appConfig
                },
                bootstrapTasks: tasks,
                bootstraped: allTaskFinished,
                loading: false
            });
        }
    },
    bootstrapTasks: [],
    setEnvRequirements: (requirements: EnvRequirements) => set({ env: requirements }),
    setBootstrapTasks: (tasks: BootstrapTask[]) => {
        const allTaskFinished = tasks.every(t => t.finished);
        set({
            bootstrapTasks: tasks,
            bootstraped: allTaskFinished
        })
    },
}));

function checkEnvRequirements(env: EnvRequirements): BootstrapTask[] {
    const tasks: BootstrapTask[] = [];
    tasks.push({
        type: BootStrapTaskType.setupConfig,
        title: "Setup", 
        description: "Considering network issue, you can setup a http_proxy url",
        finished: env.isSetupedConfig,
    });
    tasks.push({ 
        type: BootStrapTaskType.installConda, 
        title: "Install Conda", 
        description: "We use conda to manage python enviroment for comfyUI",
        finished: env.isCondaInstalled 
    });
    tasks.push({ 
        type: BootStrapTaskType.installPython, 
        title: "Create Conda venv", 
        description: "ComfyUI need a safe and proper python enviroment to run. We will use conda to create virtual env called comflowy to manage your python & pip packages",
        finished: env.isPythonInstalled 
    });
    tasks.push({ 
        type: BootStrapTaskType.installGit, 
        title: "Install Git", 
        description: "ComfyUI need a safe and proper git enviroment to run. We will use git to manage your git repository",
        finished: env.isGitInstalled 
    });
    tasks.push({ 
        type: BootStrapTaskType.installTorch, 
        title: "Install Torch", 
        description: "ComfyUI need a safe and proper torch enviroment to run. We will use torch to manage your torch model",
        finished: env.isTorchInstalled
    });
    tasks.push({ 
        type: BootStrapTaskType.installComfyUI, 
        title: "Install ComfyUI", 
        description: "ComfyUI need a safe and proper comfyUI enviroment to run. We will use comfyUI to manage your comfyUI model",
        finished: env.isComfyUIInstalled 
    });
    tasks.push({ 
        type: BootStrapTaskType.installBasicModel, 
        title: "Install Basic Model", 
        description: "ComfyUI need a safe and proper basic model enviroment to run. We will use basic model to manage your basic model",
        finished: env.isBasicModelInstalled 
    });
    tasks.push({ 
        type: BootStrapTaskType.installBasicExtension, 
        title: "Install Basic Extension", 
        description: "Install basic custom_nodes or extensions for comfyUI",
        finished: env.isBasicExtensionInstalled 
    });
    tasks.push({ 
        type: BootStrapTaskType.startComfyUI, 
        title: "Start ComfyUI", 
        description: "One step to start comfyUI",
        finished: env.isComfyUIStarted 
    });
    return tasks;
}

export { useDashboardState }
