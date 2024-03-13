/**
 * Parse comfy ui execution result - errors, warnings, logs, etc
 */
import { ComfyUIExecuteError, PersistedWorkflowDocument, ComfyUINodeError, ComfyUIError, ComfyUIErrorTypes } from "@comflowy/common/comfui-interfaces";
import { ComflowyConsoleLog, ComflowyConsoleLogTypes } from "@comflowy/common/types/comflowy-console.types";
import { uuid } from "@comflowy/common";

// ... more strategies for other log types ...
export function parseComflowyRunErrors(worfklowInfo: PersistedWorkflowDocument, runErrors: ComfyUIExecuteError): ComflowyConsoleLog[] {
  const logList: ComflowyConsoleLog[] = [];
  Object.keys(runErrors.node_errors || {}).forEach(id => {
    const nodeErrors: ComfyUIError[] = runErrors.node_errors[id].errors;
    nodeErrors.forEach((error) => {
      const log: ComflowyConsoleLog = {
        id: uuid(),
        readed: false,
        message: error.message,
        data: {
          level: "error",
          type: ComflowyConsoleLogTypes.EXECUTE_NODE_ERROR,
          createdAt: Date.now(),
          workflowId: worfklowInfo.id,
          nodeId: id,
          nodeError: error
        }
      }
      logList.push(log);
    });
  });

  const { error } = runErrors;
  if (error && error.message !== 'Prompt outputs failed validation') { // ignore prompt validation errors
    logList.push({
      id: uuid(),
      readed: false,
      message: error.message,
      data: {
        level: "error",
        type: ComflowyConsoleLogTypes.EXECUTE_WORKFLOW_ERROR,
        createdAt: Date.now(),
        extra: {
          workflowId: worfklowInfo.id,
          error
        }
      }
    });
  }
  return logList;
}