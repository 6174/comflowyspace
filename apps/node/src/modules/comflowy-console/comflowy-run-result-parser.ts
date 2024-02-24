/**
 * Parse comfy ui execution result - errors, warnings, logs, etc
 */
import { ComfyUIExecuteError, ComfyUINodeError, ComfyUIError, ComfyUIErrorTypes } from "@comflowy/common/comfui-interfaces/comfy-error-types";
import { ComflowyConsoleLog, ComflowyConsoleLogTypes } from "@comflowy/common/types/comflowy-console.types";
import { PersistedWorkflowDocument } from "@comflowy/common/storage/document-database";
import { uuid } from "@comflowy/common";

// ... more strategies for other log types ...
export function parseComflowyRunErrors(worfklowInfo: PersistedWorkflowDocument, runErrors: ComfyUIExecuteError): ComflowyConsoleLog[] {
  const logList: ComflowyConsoleLog[] = [];
  Object.keys(runErrors.node_errors || {}).forEach(id => {
    const nodeErrors: ComfyUIError[] = runErrors.node_errors[id].errors;
    nodeErrors.forEach((error) => {
      const log: ComflowyConsoleLog = {
        id: uuid(),
        message: error.message,
        data: {
          level: "error",
          type: ComflowyConsoleLogTypes.EXECUTE_NODE_ERROR,
          createdAt: Date.now(),
          extra: {
            worfklowId: worfklowInfo.id,
            nodeId: id,
            error
          }
        }
      }
      logList.push(log);
    });
  });

  const { error } = runErrors;
  if (error) {
    logList.push({
      id: uuid(),
      message: error.message,
      data: {
        level: "error",
        type: ComflowyConsoleLogTypes.EXECUTE_WORKFLOW_ERROR,
        createdAt: Date.now(),
        extra: {
          worfklowId: worfklowInfo.id,
          error
        }
      }
    });
  }
  return logList;
}