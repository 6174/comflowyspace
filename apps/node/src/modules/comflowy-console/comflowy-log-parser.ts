/**
 * Parse comfy ui logs and return a list of logs
 */

import { ComflowyConsoleLogParams } from "@comflowy/common/types/comflowy-console.types";

interface LogParsingStrategy {
  parse(log: string): ComflowyConsoleLogParams[];
}

/**
 * Strategy for parsing import results
 */
class ImportResultParsingStrategy implements LogParsingStrategy {
  private currentLogLines: string[] = [];
  parse(log: string): ComflowyConsoleLogParams[] {
    if (/Import times for custom nodes:/.test(log)) {
      this.currentLogLines.push(log);
      return [];
    }

    if (this.currentLogLines.length > 0) {
      this.currentLogLines.push(log);
      if (/Comfy UI started successfully./.test(log)) {
        const importResults = this.currentLogLines.join(' ').split(' seconds: ');
        const successfulImports: string[] = [];
        const failedImports: string[] = [];

        for (const result of importResults) {
          if (result.endsWith('(IMPORT FAILED)')) {
            failedImports.push(result.slice(0, -14)); // remove '(IMPORT FAILED)' from the end
          } else {
            successfulImports.push(result);
          }
        }

        this.currentLogLines = [];
        return [{
          message: `Import results: ${successfulImports.length} successful, ${failedImports.length} failed`,
          data: {
            type: "start",
            level: "info",
            createdAt: +new Date(),
            successfulImports,
            failedImports,
          }
        }];
      }
    }

    return [];
  }
}

/**
 * Strategy for parsing extension import results
 */
class ExtensionImportParsingStrategy implements LogParsingStrategy {
  private currentExtension: string | null = null;
  private currentLogParams: ComflowyConsoleLogParams | null = null;
  private currentLogLines: string[] = [];
  parse(log: string): ComflowyConsoleLogParams[] {
    const importErrorMatch = /Cannot import (.*)/.exec(log);
    if (importErrorMatch) {
      this.currentExtension = null;
      this.currentLogParams = null;
      this.currentLogLines = [];
      return [{
        message: `Cannot import extension: ${importErrorMatch[1]}`,
        data: {
          type: "start",
          level: "error",
          createdAt: +new Date(),
        }
      }];
    }

    const loadingMatch = /### Loading: (.*)/.exec(log);
    if (loadingMatch) {
      this.currentExtension = loadingMatch[1];
      this.currentLogParams = {
        message: this.currentExtension,
        data: {
          type: "start",
          level: "info",
          createdAt: +new Date(),
        }
      };
      this.currentLogLines = [log];
      return [];
    }

    if (this.currentExtension) {
      if (/Import times for custom nodes./.test(log)) {
        this.currentLogParams!.message = this.currentLogLines.join('\n');
        const result = this.currentLogParams;
        this.currentExtension = null;
        this.currentLogParams = null;
        this.currentLogLines = [];
        return [result!];
      }
      this.currentLogLines.push(log);
    }

    return [];
  }
}

// ... more strategies for other log types ...

export function parseComflowyLogs(logs: string): ComflowyConsoleLogParams[] {
  const strategies: LogParsingStrategy[] = [
    new ImportResultParsingStrategy(),
    new ExtensionImportParsingStrategy(),
  ];

  const logList: ComflowyConsoleLogParams[] = [];
  for (const log of logs.split('\n')) {
    for (const strategy of strategies) {
      const result = strategy.parse(log);
      if (result) {
        logList.push(...result);
        break;
      }
    }
  }
  return logList;
}
