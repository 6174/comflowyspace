import { ComfyUIExecuteError } from "../types";
import { getBackendUrl } from "../config";

/**
 * Client to Send requests to Comflowy Console
 */
class ComflowyConsoleClient {
  async comfyuiExecuteError(workflowInfo: {
    id: string,
  }, runErrors: ComfyUIExecuteError) {
    try {
      await fetch(getBackendUrl('/api/console/comfyui-execute'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowInfo,
          runErrors
        })
      })
    } catch(err) {
      console.log(err);
    }
  }

  async log(message: string, data: any) {
    try {
      fetch(getBackendUrl('/api/console/log'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          data
        })
      })
    } catch(err) {
      console.log(err);
    }
  }

  async markLogAsRead(logId: string) {
    try {
      fetch(getBackendUrl('/api/console/log/read'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logId,
        })
      })
    } catch (err) {
      console.log(err);
    }
  }
}

export const comflowyConsoleClient = new ComflowyConsoleClient();

