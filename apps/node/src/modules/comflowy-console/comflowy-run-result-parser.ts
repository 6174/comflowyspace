/**
 * Parse comfy ui execution result - errors, warnings, logs, etc
 */

import { ComflowyConsoleLogParams } from "@comflowy/common/types/comflowy-console.types";
 
// ... more strategies for other log types ...
export function parseComflowyRunResult(result: any): ComflowyConsoleLogParams[] {

  const logList: ComflowyConsoleLogParams[] = [];

  return logList;
}