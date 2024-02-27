/**
 * Parse comfy ui logs and return a list of logs
 */

import { uuid } from "@comflowy/common";
import { ComflowyConsoleLog, ComflowyConsoleLogLevel, ComflowyConsoleLogTypes } from "@comflowy/common/types/comflowy-console.types";

interface LogParsingStrategy {
  parse(log: string): ComflowyConsoleLog[];
}

/**
 * Strategy for parsing import results
 */
class ImportResultParsingStrategy implements LogParsingStrategy {
  private currentLogLines: string[] = [];
  parse(log: string): ComflowyConsoleLog[] {
    const ret: ComflowyConsoleLog[] = [];
    if (/Import times for custom nodes:/.test(log)) {
      this.currentLogLines.push(log);
      return [];
    }

    if (this.currentLogLines.length > 0) {
      if (/Starting server/.test(log)) {
        const importResults = this.currentLogLines;
        this.currentLogLines = [];
        const successfulImports: string[] = [];
        const failedImports: string[] = [];
        for (const result of importResults) {
          const info = result.replace(/(\r|\n)/g, "");
          if (/seconds/.test(info)) {
            const lastChild = info.split("/").pop()!
            if (/IMPORT FAILED/.test(info)) {
              failedImports.push(lastChild);
            } else  {
              successfulImports.push(lastChild);
            }
          }
        }

        console.log("importResults", importResults, successfulImports, failedImports);
        ret.push({
          id: uuid(),
          message: `Import results: ${successfulImports.length} successful, ${failedImports.length} failed`,
          data: {
            type: ComflowyConsoleLogTypes.CUSTOM_NODES_IMPORT_RESULT,
            level: "info",
            createdAt: +new Date(),
            successfulImports,
            failedImports,
          }
        });
      } else {
        this.currentLogLines.push(log);
      }
    }

    return ret;
  }
}

/**
 * Strategy for parsing extension import results
 */
class ExtensionImportParsingStrategy implements LogParsingStrategy {
  private currentLogParams: ComflowyConsoleLog | null = null;
  private currentLogLines: string[] = [];
  /**
   * 1) check if extension section start
   *    -) if start, set current extension and if already have current extension, return and clear state
   *    -) if not, ignore
   * 2) check if extension section end
   *   -) if have current extension, return and clear state
   * @param log 
   * @returns 
   */
  parse(log: string): ComflowyConsoleLog[] {
    const {start, level} = this.checkExtensionSectionStart(log);
    const ret:ComflowyConsoleLog[] = [];
    if (start) {
      if (this.currentLogParams) {
        this.currentLogParams!.message = this.currentLogLines.join('\n'); 
        ret.push({...this.currentLogParams});
        this.clearCurrentExtensionState();
      }

      // start a new log
      this.currentLogLines.push(log);
      this.currentLogParams = {
        id: uuid(),
        message: log,
        data: {
          type: ComflowyConsoleLogTypes.EXTENSION_LOAD_INFO,
          level: level!,
          createdAt: +new Date(),
        }
      };
    } else {
      if (this.currentLogParams) {
        if (this.checkExtensionsSectionEnd(log)) {
          this.currentLogParams!.message = this.currentLogLines.join('\n');        
          ret.push({...this.currentLogParams});
          this.clearCurrentExtensionState();
        } else {
          this.currentLogLines.push(log);
        }
      }
    }
    return ret;
  }

  addExtraInfoForLog(log: ComflowyConsoleLog): ComflowyConsoleLog {
    const level = log.data.level;
    if (level === "error") {
    } else {
      // const extension = /### Loading: (.*)/.exec(log.message);
      // log.data.extra.extension = extension;
    }
    return log;
  }

  clearCurrentExtensionState() {
    this.currentLogParams = null;
    this.currentLogLines = [];
  }

  checkExtensionsSectionEnd(log: string): boolean {
    if (/Import times for custom nodes/.test(log)) {
      return true;
    }

    if (/Cannot import/.test(log)) {
      return true;
    }

    return false;
  }

  checkExtensionSectionStart(log: string): {
    start: boolean;
    level?: ComflowyConsoleLogLevel
  } {
    // if (/### Loading: (.*)/.exec(log)) {
    //   return {
    //     start: true,
    //     level: "info"
    //   }
    // }
    
    if (/Traceback \(most recent call last\):/.exec(log)) {
      return {
        start: true,
        level: "error"
      }
    }
    return {
      start: false,
    }
  }
}

// ... more strategies for other log types ...

const strategies: LogParsingStrategy[] = [
  new ImportResultParsingStrategy(),
  new ExtensionImportParsingStrategy(),
];

export function parseComflowyLogs(logs: string): ComflowyConsoleLog[] {
  const logList: ComflowyConsoleLog[] = [];
  for (const log of logs.split('\n')) {
    if (log.trim() === "") {
      continue
    }
    for (const strategy of strategies) {
      const result = strategy.parse(log);
      if (result.length > 0) {
        logList.push(...result);
      }
    }
  }
  return logList;
}

export function parseComflowyLogsByLine(log: string): ComflowyConsoleLog[] {
  const logList: ComflowyConsoleLog[] = [];
  for (const strategy of strategies) {
    const result = strategy.parse(log);
    if (result) {
      logList.push(...result);
    }
  }
  return logList
}

