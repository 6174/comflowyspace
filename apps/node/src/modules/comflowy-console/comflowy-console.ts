import { uuid } from "@comflowy/common";
import { ComflowyConsoleLogData, ComflowyConsoleState, ComflowyConsoleUpdateEvent } from "@comflowy/common/types/comflowy-console.types";
import { SlotEvent } from "@comflowy/common/utils/slot-event";
import { parseComflowyLogs, parseComflowyLogsByLine } from "./comflowy-log-parser";
import { serve } from "./comflowy-console.service";

/**
 * ComflowyConsole
 */
class ComflowyConsoleKlass {
  updateEvent = new SlotEvent<ComflowyConsoleUpdateEvent>();
  state: ComflowyConsoleState = {
    logs: [],
    envState: {
      importFailedExtensions: [],
      importSuccessExtensions: [],
      installedPipPackages: []
    }
  };

  serve = serve;

  /**
   * create log
   */
  log = (message: string, data: Partial<ComflowyConsoleLogData>) =>  {
    const log = {
      id: uuid(),
      message,
      data: {
        ...data,
        level: data.level || "info",
        createdAt: Date.now(),
        type: data.type
      }
    }
    this.state.logs.push(log);
    this.updateEvent.emit({type: "CREATE_LOG", data: log});
  }

  /**
   * update env
   * @param envState 
   */
  setEnvState = (envState: Partial<ComflowyConsoleState["envState"]>) => {
    this.state.envState = {
      ...this.state.envState,
      ...envState
    }
    this.updateEvent.emit({type: "UPDATE_ENV"})
  }

  /**
   * clear logs
   */
  clearLogs = () => {
    this.state.logs = [];
    this.updateEvent.emit({ type: "CLEAR_LOGS"})
  }

  /**
   * read comfy ui log message by line
   * @param logs 
   */
  consumeComfyUILogMessage = (log: string) => {
    const logs = parseComflowyLogs(log);
    if (logs.length > 0) {
      this.state.logs.push(...logs);
      this.updateEvent.emit({ type: "CREATE_LOG", data: logs });
    }
  }

  /**
   * parse execution result
   * @param result 
   */
  parseComfyUIExecutionResult = (result: any) => {
  }

}

export const ComflowyConsole = new ComflowyConsoleKlass();