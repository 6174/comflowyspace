import { ExtensionEventTypes, ExtensionManagerEvent, ExtensionManifest, ExtensionNodeCustomContextMenuConfig, ExtensionNodeCustomRenderConfig } from "./extension.types";

export interface ExtensionApiHooks {
  
}

/**
 * Extension main api is the glue code for Comflowy main process and worker process
 */
export class ExtensionMainApi {
  worker?: Worker
  /**
   * Extensions can register node context menu hooks at here
   */
  nodeContextMenuRegistry: Record<string, ExtensionNodeCustomContextMenuConfig[]> = {};
  /**
   * node custom renderer registry
   * @param apis 
   */
  nodeRendererRegistry: Record<string, ExtensionNodeCustomRenderConfig[]> = {};
  
  /**
   * Constructor
   * @param apis 
   */
  constructor(
    public apis: ExtensionApiHooks
  ) {

  }

  listenWorker(worker: Worker) {
    this.worker = worker;
    worker.onmessage = (event: MessageEvent<ExtensionManagerEvent>) => {
      const { type, data } = event.data;
      switch (type) {
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
  showUI(extension: ExtensionManifest) {
    // create ui in a modal and listen its message   
  }
}