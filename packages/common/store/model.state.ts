
import { create } from "zustand";
import { getModelInfos } from "../comfyui-bridge/bridge";
import { CivitAIModel, MarketModel } from "../types/model.types";
import { Input } from "../types";
import { getBackendUrl } from "../config";

export type InstalledModel = {
    name: string;
    size: number;
}
export type ModelDownloadInfo = {
    taskId: string,
    model: CivitAIModel,
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
    };
}

export type ModelAction = {
    onInit: () => Promise<void>;
    updateDownloadInfo: (taskId: string, info: Partial<ModelDownloadInfo>) => void;
    setCivitModelDetailPage: (model?: CivitAIModel) => void;
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
    civitai: {
        loading: true,
        models: [],
        currentPage: 1,
        pageSize: 10,
        hasMorePage: true,
        filters: {}
    },
    installedModels: {},
    marketModels: [],
    modelPath: "",
    loading: true,
    onInit: async () => {
        set({ loading: true })
        const ret = await getModelInfos();
        if (ret.success) {
            const { installedModels, marketModels, modelPath } = ret.data;
            set({ installedModels, marketModels, modelPath });
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
        set({
            downloadingTasks: {
                ...get().downloadingTasks,
                [taskId]: {
                    ...get().downloadingTasks[taskId],
                    ...info
                }
            }
        })

        if (info.model) {
            set({
                modelTaskMap: {
                    ...get().modelTaskMap,
                    [info.model.id]: taskId
                }
            })
        }
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