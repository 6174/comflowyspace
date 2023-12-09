import { getComfyUIEnvRequirements } from "../comfyui-bridge/bridge";
import {create} from "zustand";

export type EnvRequirements = {
    isCondaInstalled: boolean;
    isPythonInstalled: boolean;
    isGitInstalled: boolean;
    isTorchInstalled: boolean;
    isComfyUIInstalled: boolean;
}

type DashboardState = {
    loading: boolean;
    docs: any[];
    env?: EnvRequirements;
}

type DashboardAction = {
    onInit: () => void
}

const useDashboardState = create<DashboardState & DashboardAction>((set, get) => ({
    docs: [],
    loading: true,
    onInit: async () => {
        const ret = await getComfyUIEnvRequirements();
        if (ret.data) {
            set({
                env: ret.data,
                loading: false
            });
        }
    }
}));

export {useDashboardState}
