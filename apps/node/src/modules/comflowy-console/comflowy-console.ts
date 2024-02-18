import { uuid } from "@comflowy/common";
import { ComflowyConsoleLogData, ComflowyConsoleState, ComflowyConsoleUpdateEvent } from "./comflowy-console.types";
import { SlotEvent } from "@comflowy/common/utils/slot-event";

/**
 * ComflowyConsole
 */
export class ComflowyConsole {
  updateEvent = new SlotEvent<ComflowyConsoleUpdateEvent>();
  state: ComflowyConsoleState = {
    logs: [],
    envState: {
      importFailedExtensions: [],
      importSuccessExtensions: [],
      installedPipPackages: []
    }
  };

  /**
   * constructor
   */
  constructor() {
  }

  /**
   * create log
   */
  log = (message: string, data: Partial<ComflowyConsoleLogData>) =>  {
    this.state.logs.push({
      id: uuid(),
      message,
      data: {
        ...data,
        level: data.level || "info",
        createdAt: Date.now(),
        type: data.type || "runtime"
      }
    });
    this.updateEvent.emit({type: "UPDATE_LOG"});
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
    this.updateEvent.emit({type: "UPDATE_LOG"})
  }
}