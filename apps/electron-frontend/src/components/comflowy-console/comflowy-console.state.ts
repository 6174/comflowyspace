import { create } from 'zustand';
import { ComflowyConsoleLogType, ComflowyConsoleState } from "@comflowy/common/types/comflowy-console.types";

type State = {
  consoleState: ComflowyConsoleState;
  filters: {
    workflowId?: string;
    level?: ComflowyConsoleLogType
  }
}

type Actions = {
  syncState: (consoleState: ComflowyConsoleState) => void;
  addFilter: (filter: Partial<State["filters"]>) => void;
  removeFilter: (filter: keyof State["filters"]) => void;
}

const initialState = {
  consoleState: {
    logs: [],
    envState: {
      importFailedExtensions: [],
      importSuccessExtensions: [],
      installedPipPackages: []
    }
  },
  filters: {}
}

export const useComflowyConsoleState = create<State & Actions>((set, get) => ({
  ...initialState,
  syncState: (consoleState: ComflowyConsoleState) => {
    set({
      consoleState
    })
  },
  addFilter(filter: Partial<State["filters"]>) {
    set({
      filters: {
        ...get().filters,
        ...filter
      }
    })
  },
  removeFilter(filter: keyof State["filters"]) {
    set(st => {
      const filters = {...st.filters}
      delete filters[filter]
      return {
        filters
      }
    })
  }
}));
