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
  installedModels: AllInstalledModels,
  marketModels: MarketModel[]
}

export type ModelAction = {
  onInit: () => Promise<void>;
}

export const useModelState = create<ModelState & ModelAction>((set, get) => ({
    installedModels: {},
    marketModels: [],
    onInit: async () => {
        const ret = await getModelInfos();
        if (ret.success) {
            const {installedModels, marketModels} = ret.data;
            set({installedModels, marketModels});
            console.log("model infos", ret);
        }
    },
}));