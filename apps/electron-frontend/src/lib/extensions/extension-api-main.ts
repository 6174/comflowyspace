import { ExtensionEventTypes, ExtensionManagerEvent } from "./extension.types";

export interface ExtensionApis {
}

/**
 * Extension main api is the glue code for Comflowy main process and worker process
 */
export class ExtensionMainApi {
  worker?: Worker
  constructor(
    public apis: ExtensionApis
  ) {
  }

  listenWorker(worker: Worker) {
    this.worker = worker;
    worker.onmessage = (event: MessageEvent<ExtensionManagerEvent>) => {
      const { type, data } = event.data;
      switch (type) {
        case ExtensionEventTypes.executeError:
          // this.handleExtensionExecuteError(event.data);
          break;
        case ExtensionEventTypes.rpcCall:
          this.handleRpcCall(data);
          break;
      }
    };
  }

  async handleRpcCall(data: any) {
    const { callID, method, args } = data;
    try {
      const result = await this.apis[method](...args);
      this.worker?.postMessage({
        type: ExtensionEventTypes.rpcCallResult,
        data: {
          callID,
          result
        }
      })
    } catch (err) {
      this.worker?.postMessage({
        type: ExtensionEventTypes.rpcCallError,
        data: {
          callID,
          error: err.message
        }
      });
    }
  }

  /**
   * showUI(__EXTENSION__)
   */

}