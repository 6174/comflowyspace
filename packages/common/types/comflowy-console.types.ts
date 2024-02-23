export type ComflowyConsoleLogLevel = "info" | "error" | "warn" | "log" | "debug" | "trace";

export type ComflowyConsoleLogData = {
  level: ComflowyConsoleLogLevel;
  type: ComflowyConsoleLogTypes | undefined;
  createdAt: number;
  workflowId?: string;
  workflowRunId?: string;
  extra?: any;
  [key: string]: any;
};

/**
 * ComflowyConsole types
 */
export type ComflowyConsoleLog = {
  id: string;
  message: string;
  data: ComflowyConsoleLogData
}

export type ComflowyConsoleLogParams = {
  message: string;
  data: ComflowyConsoleLogData
}

/**
 * ComflowyConsole State
 */
export type ComflowyConsoleState = {
  logs: ComflowyConsoleLog[];
  envState: {
    importFailedExtensions: string[];
    importSuccessExtensions: string[];
    // pip list all installed packages
    installedPipPackages: string[];
  }
}

export type ComflowyConsoleUpdateEvent = {
  type: "CREATE_LOG" | "UPDATE_LOG" | "CLEAR_LOGS" | "UPDATE_ENV" | "SYNC_STATE",
  data?: ComflowyConsoleLog | any; 
}


export enum ComflowyConsoleLogTypes {
  CUSTOM_NODES_IMPORT_RESULT = "CUSTOM_NODES_IMPORT_RESULT",
  EXTENSION_LOAD_INFO = "EXTENSION_LOAD_INFO",
  DEFAULT = "DEFAULT"
}
