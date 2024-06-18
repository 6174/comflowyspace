
import { create } from "zustand";
import { getModelInfos } from "../comfyui-bridge/bridge";
import { CivitAIModel, MarketModel, ModelType } from "../types/model.types";
import { Input } from "../types";
import { getBackendUrl } from "../config";
import _ from "lodash";

export type InstalledModel = {
    name: string;
    size: number;
    path: number;
    meta?: MarketModel | {
        failed: boolean
    }
}
export type ModelDownloadInfo = {
    taskId: string,
    model: MarketModel,
    params: any,
    status: "downloading" | "success" | "failed",
    progress: number,
}

export type ReactFlowModelSelectorContextProps = {
    nodeType: string;
    value: MarketModel | string;
    input: Input;
    tab?: string;
    types?: string[];
    query?: string;
    onChange: (value: MarketModel | string) => void;
}

export type AllInstalledModels = { [key: string]: InstalledModel[] }
export enum SelectModelTabKey {
    featured = "featured",
    civitai = "civitai",
    huggingface = "huggingface"
}
export type ModelState = {
    loading: boolean;
    installedModels: AllInstalledModels,
    installedModelsMap: Record<string, InstalledModel>;
    marketModels: MarketModel[],
    modelPath: string;
    downloadingTasks: Record<string, ModelDownloadInfo>,
    modelTaskMap: Record<string, string>,
    selectContext?: ReactFlowModelSelectorContextProps;
    currentTab: SelectModelTabKey;
    types?: string[],
    filters: {
        query?: string,
        types?: string[],
    },
    civitai: {
        modelDetail?: CivitAIModel;
        loading: boolean;
        models: CivitAIModel[];
        currentPage: number;
        pageSize: number;
        cursor?: string;
        hasMorePage: boolean;
        filters: {
            query?: string,
            types?: string[],
        }
    },
    featuredModels: {
        loading: boolean;
        models: MarketModel[];
        modelDetail?: MarketModel;
        filters: {
            query?: string,
            types?: string[],
        }
    }
}

export type ModelAction = {
    onInit: () => Promise<void>;
    updateDownloadInfo: (taskId: string, info: Partial<ModelDownloadInfo>) => void;
    setCivitModelDetailPage: (model?: CivitAIModel) => void;
    setFeaturedDetailPage: (model?: MarketModel) => void;
    updateFeaturedFilters: (filters: { query?: string, types?: string[] }) => void;
    updateCivitAIModelFilters: (filters: { query?: string, types?: string[] }) => void;
    loadCivitAIModels: () => Promise<void>;
    onChangeContext: (context: ReactFlowModelSelectorContextProps) => void;
    onChangeTab: (tab: SelectModelTabKey) => void;
    updateFilters: (filters: { query?: string, types?: string[] }) => void;
    onSearchCivitAI: () => Promise<void>;
}

export const useModelState = create<ModelState & ModelAction>((set, get) => ({
    downloadingTasks: {},
    modelTaskMap: {},
    currentTab: SelectModelTabKey.featured,
    filters: {},
    featuredModels: {
        loading: true,
        models: [],
        filters: {
            query: "",
            types: [ModelType.Checkpoint]
        }
    },
    civitai: {
        loading: true,
        models: [],
        currentPage: 1,
        pageSize: 10,
        hasMorePage: true,
        filters: {}
    },
    installedModels: {},
    installedModelsMap: {},
    marketModels: [],
    modelPath: "",
    loading: true,
    onInit: async () => {
        set({ loading: true })
        const ret = await getModelInfos();
        if (ret.success) {
            const { installedModels, marketModels, modelPath } = ret.data;
            const installedModelsMap: Record<string, InstalledModel> = {};
            for (const key in installedModels) {
                installedModels[key].forEach((model: InstalledModel) => {
                    installedModelsMap[`${key}/${model.name}`] = model;
                })
            }
            set({ installedModels, installedModelsMap, marketModels, modelPath });
            console.log("model infos", ret);
        }
        set({ loading: false })
    },
    onChangeTab: (tab: SelectModelTabKey) => {
        set({
            currentTab: tab
        })
    },
    onSearchCivitAI: async () => {
        set({
            civitai: {
                ...get().civitai,
                loading: true,
                models: [],
                currentPage: 1,
                pageSize: 10,
                cursor: undefined,
                hasMorePage: true,
            }
        })
        await get().loadCivitAIModels()
    },
    onChangeContext: (context: ReactFlowModelSelectorContextProps) => {
        set({
            civitai: {
                loading: true,
                models: [],
                currentPage: 1,
                pageSize: 10,
                hasMorePage: true,
                filters: {}
            },
            selectContext: context
        })
    },
    updateDownloadInfo: (taskId: string, info: Partial<ModelDownloadInfo>) => {
        const currentTasks: any = get().downloadingTasks || {};
        if (!currentTasks[taskId]) {
            currentTasks[taskId] = {};
        }
        set({
            downloadingTasks: {
                ...currentTasks,
                [taskId]: {
                    ...currentTasks[taskId],
                    ...info
                }
            }
        })
    },
    loadCivitAIModels: async () => {
        const { civitai } = get();
        const { currentPage, pageSize, filters, hasMorePage, cursor } = civitai;
        if (!hasMorePage) return;
        const ret = await getCivitModels(currentPage, pageSize, filters, cursor)
        if (!ret.success) {
            throw new Error("Load failed" + ret?.error?.cause?.message);
        }
        const models = ret.data.items as unknown as CivitAIModel[] || [];
        set({
            civitai: {
                ...civitai,
                loading: false,
                cursor: ret.data.metadata?.nextCursor,
                models: [...civitai.models, ...models],
                currentPage: currentPage + 1,
                hasMorePage: models.length === pageSize
            }
        })
    },
    setCivitModelDetailPage: (model?: CivitAIModel) => {
        set({
            civitai: {
                ...get().civitai,
                modelDetail: model
            }
        })
    },
    setFeaturedDetailPage: (model?: MarketModel) => {
        set({
            featuredModels: {
                ...get().featuredModels,
                modelDetail: model
            }
        })
    },
    updateFeaturedFilters: (filters: { query?: string, types?: string[] }) => {
        set({
            featuredModels: {
                ...get().featuredModels,
                filters: {
                    ...get().featuredModels.filters,
                    ...filters
                }
            }
        })
    },
    updateFilters: (filters: { query?: string, types?: string[] }) => {
        const globalFilters = {
            ...get().filters,
            ...filters
        };
        set({
            filters: globalFilters,
            civitai: {
                ...get().civitai,
                filters: globalFilters
            }
        })
    },
    updateCivitAIModelFilters: (filters: { query?: string, types?: string[] }) => {
        set({
            civitai: {
                ...get().civitai,
                filters: {
                    ...get().civitai.filters,
                    ...filters
                }
            }
        })
    }
}));

const API_CACHE: Map<string, any> = new Map();
async function getCivitModels(currentPage: number, pageSize: number, filters: any, cursor?: string) {
    const key = JSON.stringify({ currentPage, pageSize, filters, cursor });
    if (API_CACHE.has(key)) {
        return API_CACHE.get(key);
    }
    const api = getBackendUrl("/api/civitai/models");
    const ret = await fetch(api, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            page: currentPage,
            cursor,
            limit: pageSize,
            ...filters
        })
    });

    const data = await ret.json()
    if (data.success) {
        API_CACHE.set(key, data);
    }
    return data
}

export const getCivitModelByModelId = _.memoize(async (modelId: string): Promise<CivitAIModel> => {
    const api = getBackendUrl("/api/civit/models");
    const ret = await fetch(api, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            modelId
        })
    });
    const json = await ret.json();
    if (json.success) {
        console.log("find result", json.data);
        const data = json.data;
        if (!data.error) {
            return data;
        }
        throw new Error(data.error);
    } else {
        throw new Error(json.message);
    }
});

/**
 * Downloading info webhooks
 * @param model 
 * @returns 
 */
export function useDownloadInfo(model: MarketModel) {
    const uuid = useModelUUID(model);
    const save_path = `${model.save_path}/${model.filename}`;
    const downloadingInfo = useModelState(st => st.downloadingTasks[uuid]);
    const installedModelsMap = useModelState(st => st.installedModelsMap);
    const isAreadyDownloaded = installedModelsMap[save_path] || downloadingInfo?.status === "success"; // || alread find in installed models

    return {
        downloadingInfo,
        isAreadyDownloaded
    };
}

export function useModelUUID(model: MarketModel) {
    return model?.id || model.filename;
}


