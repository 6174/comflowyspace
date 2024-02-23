/**
 * Parse comfy ui logs and return a list of logs
 */

import { uuid } from "@comflowy/common";
import { ComflowyConsoleLog, ComflowyConsoleLogType } from "@comflowy/common/types/comflowy-console.types";
import { clear } from "console";
import { delimiter } from "path";

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
    }

    if (this.currentLogLines.length > 0) {
      if (/Starting server/.test(log)) {
        const importResults = this.currentLogLines;
        const successfulImports: string[] = [];
        const failedImports: string[] = [];

        for (const result of importResults) {
          if (/IMPORT FAILED/.test(result)) {
            failedImports.push(result.split("/").pop()!); // remove '(IMPORT FAILED)' from the end
          } else if (/seconds:/.test(result)) {
            successfulImports.push(result.split("/").pop()!);
          }
        }

        this.currentLogLines = [];
        console.log("importResults", importResults, successfulImports, failedImports);
        ret.push({
          id: uuid(),
          message: `Import results: ${successfulImports.length} successful, ${failedImports.length} failed`,
          data: {
            type: "IMPORT_RESULT",
            level: "info",
            createdAt: +new Date(),
            successfulImports,
            failedImports,
          }
        });
      }
      this.currentLogLines.push(log);
    }

    return ret;
  }
}

/**
 * Strategy for parsing extension import results
 */
class ExtensionImportParsingStrategy implements LogParsingStrategy {
  private currentExtension: string | null = null;
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
    const {start, type} = this.checkExtensionSectionStart(log);
    const ret:ComflowyConsoleLog[] = [];
    if (start) {
      if (this.currentLogParams) {
        this.currentLogParams!.message = this.currentLogLines.join('\n'); 
        ret.push({...this.currentLogParams});
        this.clearCurrentExtensionState();
      }
      this.currentLogLines.push(log);
      this.currentLogParams = {
        id: uuid(),
        message: log,
        data: {
          type: "EXTENSION_LOAD_INFO",
          level: type!,
          createdAt: +new Date(),
        }
      };
      console.log("start", this.currentLogParams);
    } else {
      if (this.currentLogParams) {
        if (this.checkExtensionsSectionEnd(log)) {
          console.log("end", this.currentLogParams);
          this.currentLogParams!.message = this.currentLogLines.join('\n');        
          ret.push({...this.currentLogParams});
          this.clearCurrentExtensionState();
        }
      }
    }
    return ret;
  }

  clearCurrentExtensionState() {
    this.currentExtension = null;
    this.currentLogParams = null;
    this.currentLogLines = [];
  }

  checkExtensionsSectionEnd(log: string): boolean {
    return /Import times for custom nodes/.test(log)
  }

  checkExtensionSectionStart(log: string): {
    start: boolean;
    type?: ComflowyConsoleLogType
  } {
    if (/### Loading: (.*)/.exec(log)) {
      return {
        start: true,
        type: "info"
      }
    }
    
    if (/Traceback \(most recent call last\):/.exec(log)) {
      return {
        start: true,
        type: "error"
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
    for (const strategy of strategies) {
      const result = strategy.parse(log);
      if (result) {
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

