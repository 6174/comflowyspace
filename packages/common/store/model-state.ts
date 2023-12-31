import { getExtensionInfos, getModelInfos } from "../comfyui-bridge/bridge";
import { create } from "zustand";

export type InstalledModel = {
    name: string;
    size: number;
}
export type AllInstalledModels = { [key: string]: InstalledModel[]}

export type MarketModel = {
    name: string;
    type: string;
    base: string;
    save_path: string;
    description: string;
    reference: string;
    filename: string;
    url: string;
}
  
export type ModelState = {
    loading: boolean;
  installedModels: AllInstalledModels,
  marketModels: MarketModel[],
  modelPath: string;
}

export type ModelAction = {
  onInit: () => Promise<void>;
}

export const useModelState = create<ModelState & ModelAction>((set, get) => ({
    installedModels: {},
    marketModels: [],
    modelPath: "",
    loading: true,
    onInit: async () => {
        set({loading: true})
        const ret = await getModelInfos();
        if (ret.success) {
            const { installedModels, marketModels, modelPath } = ret.data;
            set({ installedModels, marketModels, modelPath });
            console.log("model infos", ret);
        }
        set({ loading: false })
    },
}));