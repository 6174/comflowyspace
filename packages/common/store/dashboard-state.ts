import { getComfyUIEnvRequirements } from "../comfyui-bridge/bridge";
import {create} from "zustand";

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
}

type DashboardState = {
    loading: boolean;
    env?: EnvRequirements;
    bootstrapTasks: BootstrapTask[];
    bootstraped: boolean;
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
    finished?: boolean;
}

type DashboardAction = {
    onInit: () => void
}

const useDashboardState = create<DashboardState & DashboardAction>((set, get) => ({
    docs: [],
    bootstraped: false,
    loading: true,
    onInit: async () => {
        const ret = await getComfyUIEnvRequirements();
        if (ret.data) {
            const tasks = checkEnvRequirements(ret.data);
            set({
                env: ret.data,
                bootstrapTasks: tasks,
                bootstraped: false,
                loading: false
            });
        }
    },
    bootstrapTasks: [],
    setEnvRequirements: (requirements: EnvRequirements) => set({ env: requirements }),
    setBootstrapTasks: (tasks: BootstrapTask[]) => set({ bootstrapTasks: tasks }),
}));

function checkEnvRequirements(env: EnvRequirements): BootstrapTask[] {
    const tasks: BootstrapTask[] = [];
    if (!env.isSetupedConfig) {
        tasks.push({ type: BootStrapTaskType.setupConfig, title: "setup config" });
    }
    if (!env.isCondaInstalled) {
        tasks.push({type: BootStrapTaskType.installConda, title: "Install Conda"});
    }
    if (!env.isPythonInstalled) {
        tasks.push({type: BootStrapTaskType.installPython, title: "Install Python"});
    }
    if (!env.isGitInstalled) {
        tasks.push({type: BootStrapTaskType.installGit, title: "Install Git"});
    }
    if (!env.isTorchInstalled) {
        tasks.push({type: BootStrapTaskType.installTorch, title: "Install Torch"});
    }
    if (!env.isComfyUIInstalled) {
        tasks.push({type: BootStrapTaskType.installComfyUI, title: "Install ComfyUI"});
    }
    if (!env.isBasicModelInstalled) {
        tasks.push({type: BootStrapTaskType.installBasicModel, title: "Install Basic Model"});
    }
    if (!env.isBasicExtensionInstalled) {
        tasks.push({type: BootStrapTaskType.installBasicExtension, title: "Install Basic Extension"});
    }
    if (!env.isComfyUIStarted) {
        tasks.push({type: BootStrapTaskType.startComfyUI, title: "Start ComfyUI"});
    }
    return tasks;
}

export {useDashboardState}
