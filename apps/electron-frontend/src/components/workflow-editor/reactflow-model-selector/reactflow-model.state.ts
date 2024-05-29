import { getBackendUrl } from "@comflowy/common/config";
import { create } from "zustand";
import exampleResponse from "./example-response.json";
import { CivitAIModel, MarketModel } from "@comflowy/common/types/model.types";
import { Input } from "@comflowy/common/types";
import lodash from "lodash";
import { wait } from "@comflowy/common";

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
  updateDownloadInfo: (taskId: string, info: Partial<ModelDownloadInfo>) => void;
  setCivitModelDetailPage: (model?: CivitAIModel) => void;
  updateCivitAIModelFilters: (filters: { query?: string, types?: string[] }) => void;
  loadCivitAIModels: () => Promise<void>;
  onChangeContext: (context: ReactFlowModelSelectorContextProps) => void;
  onChangeTab: (tab: SelectModelTabKey) => void;
  updateFilters: (filters: { query?: string, types?: string[] }) => void;
  onSearchCivitAI: () => Promise<void>;
}

const cachedGetCivitModels = lodash.memoize(getCivitModels, (currentPage, pageSize, filters) => {
  return JSON.stringify({ currentPage, pageSize, filters });
});

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
    const {civitai} = get();
    const { currentPage, pageSize, filters, hasMorePage, cursor } = civitai;
    if (!hasMorePage) return;
    const ret = await cachedGetCivitModels(currentPage, pageSize, filters, cursor)
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
  updateCivitAIModelFilters: (filters: {query?: string, types?: string[]}) => {
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

async function getCivitModels(currentPage, pageSize, filters, cursor?) {
  const api = getBackendUrl("/api/civit/models");
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
  return ret.json()
}