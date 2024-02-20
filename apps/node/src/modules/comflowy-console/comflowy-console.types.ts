export type ComflowyConsoleLogType = "info" | "error" | "warn" | "log" | "debug" | "trace";

export type ComflowyConsoleLogData = {
  level: ComflowyConsoleLogType;
  type: "bootstrap" | "start" | "workflowRun" | "intallExtension" | "runtime" | "other";
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
  type: "UPDATE_LOG" | "CLEAR_LOGS" | "UPDATE_ENV"
}

