import { uuid } from "@comflowy/common";
import { ExtensionEditorEvent, ExtensionEventTypes, ExtensionManagerEvent, ExtensionManifest, ExtensionUIEvent } from "../extension.types";
import { workerEvent } from "./extension.event";
import { SlotEvent } from "@comflowy/common/utils/slot-event";

/**
 * Expose worker api directly to extensions in extension main.js
 */
class ExtensionWorkerApi {
  onUIMessage = new SlotEvent<ExtensionUIEvent>();
  onEditorMessage = new SlotEvent<ExtensionEditorEvent>();

  /**
   * showUI(__EXTENSION__)
   */
  showUI(extension: ExtensionManifest) {
    self.postMessage({ type: ExtensionEventTypes.showUI, data: {
      extension: extension
    }});
  }

  postMessageToUI(ev: ExtensionUIEvent) {
    self.postMessage({ type: ExtensionEventTypes.mainToUIMessage, data: ev});
  }

  /**
   * Create A wrapper to make rpc call easier
   * @param method 
   * @param args 
   * @returns 
   */
  async createRpcCall<T = any>(method: string, args?: any[]): Promise<T> {
    const callID = uuid();
    self.postMessage({ type: ExtensionEventTypes.rpcCall, data: {
      callID,
      method,
      args
    }});
  
    return new Promise((resolve, reject) => {
      let disposable;
      const listener = (event: ExtensionManagerEvent) => {
        const { type, data } = event;
        // console.log("[worker] rpc call result", type, data);
        if (type === ExtensionEventTypes.rpcCallResult && data.callID === callID) {
          resolve(data.result as T);
          disposable.dispose();
        }
        if (type === ExtensionEventTypes.rpcCallError && data.callID === callID) {
          reject(data.error);
          disposable.dispose();
        }
      }
      disposable = workerEvent.onMessageEvent.on(listener)
      setTimeout(() => {
        reject(new Error("Timeout：" + method ));
      }, 10000)
    });
  }
}


const comflowy = new ExtensionWorkerApi();

export default comflowy;