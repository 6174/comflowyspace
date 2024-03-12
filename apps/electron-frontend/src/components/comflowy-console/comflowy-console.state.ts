import { create } from 'zustand';
import { ComflowyConsoleEnv, ComflowyConsoleLog, ComflowyConsoleLogLevel, ComflowyConsoleState } from "@comflowy/common/types/comflowy-console.types";

type State = {
  consoleState: ComflowyConsoleState;
  filters: {
    workflowId?: string;
    level?: ComflowyConsoleLogLevel
  }
}

type Actions = {
  syncState: (consoleState: ComflowyConsoleState) => void;
  addFilter: (filter: Partial<State["filters"]>) => void;
  removeFilter: (filter: keyof State["filters"]) => void;
  updateLog: (log: ComflowyConsoleLog) => void;
  addLogs: (logs: ComflowyConsoleLog[]) => void;
  updateEnv: (env: ComflowyConsoleEnv) => void;
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
      consoleState: {
        ...get().consoleState,
        ...consoleState
      }
    })
  },
  addLogs: (logs: ComflowyConsoleLog[]) => {
    const oldLogs = get().consoleState.logs;
    set({
      consoleState: {
        ...get().consoleState,
        logs: [...oldLogs, ...logs]
      }
    })
  },
  updateLog: (log: ComflowyConsoleLog) => {
    const consoleState = get().consoleState;
    const logs = consoleState.logs.map(l => l.id === log.id ? log : l);
    set({
      consoleState: {
        ...consoleState,
        logs
      }
    })
  },
  updateEnv: (env: ComflowyConsoleEnv) => {
    const consoleState = get().consoleState;
    set({
      consoleState: {
        ...consoleState,
        envState: {
          ...consoleState.envState,
          ...env
        }
      }
    
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
