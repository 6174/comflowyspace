/**
 * Parse comfy ui logs and return a list of logs
 */

import { ComflowyConsoleLogParams } from "@comflowy/common/types/comflowy-console.types";

interface LogParsingStrategy {
  parse(log: string): ComflowyConsoleLogParams[];
}

class ErrorLogParsingStrategy implements LogParsingStrategy {
  parse(log: string): ComflowyConsoleLogParams[] {
    const match = /error pattern/.exec(log);
    return match ? [{ message: match[0], data: {
      type: "other",
      level: "error",
      createdAt: +new Date(),
    } }] : [];
  }
}

class WarningLogParsingStrategy implements LogParsingStrategy {
  parse(log: string): ComflowyConsoleLogParams[] {
    const match = /warning pattern/.exec(log);
    return match ? [{ message: match[0], data: {
      type: "other",
      level: "error",
      createdAt: +new Date(),
    } }] : [];
  }
}

// ... more strategies for other log types ...

export function parseComflowyLogs(logs: string): ComflowyConsoleLogParams[] {
  const strategies: LogParsingStrategy[] = [
    new ErrorLogParsingStrategy(),
    new WarningLogParsingStrategy(),
    // ... more strategies ...
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