import { ExtensionEventTypes, ExtensionManagerEvent, ExtensionManifest, ExtensionNodeCustomContextMenuConfig, ExtensionNodeCustomRenderConfig, ExtensionUIEvent } from './extension.types';
import { getBackendUrl } from '@comflowy/common/config';
import { SlotEvent } from '@comflowy/common/utils/slot-event';

export interface ExtensionApiHooks {
}

/**
 * Manages front extentions extensions
 */
export class ExtensionManager {
  worker: Worker;
  extensionEvent = new SlotEvent<ExtensionManagerEvent>();
  mainToUIEvent = new SlotEvent<ExtensionUIEvent>();
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
   * @param params 
   */
  constructor(
    public extensions: ExtensionManifest[], 
    public apis: ExtensionApiHooks
  ) { }

  /**
   * initialize extensions
   */
  public async init() {
    const worker = new Worker(new URL('./worker/extension.worker.ts', import.meta.url));
    this.worker = worker;
    this.listenWorker();

    // load all extensions
    for (const extensionManifest of this.extensions) {
      await this.loadExtension(extensionManifest);
    }
  }

  private listenWorker() {
    this.worker.onmessage = (event: MessageEvent<ExtensionManagerEvent>) => {
      const { type, data } = event.data;
      switch (type) {
        case ExtensionEventTypes.executeError:
          this.handleExtensionExecuteError(event.data);
          break;
        case ExtensionEventTypes.mainToUIMessage:
          this.mainToUIEvent.emit(data);
          break;
        case ExtensionEventTypes.rpcCall:
          this.handleRpcCall(data);
          break;
      }
    };
  }

  /**
   * show UI of the extension
   * @param extension 
   */
  showUI(extension: ExtensionManifest) {
    const uipath = getBackendUrl("/static/" + extension.ui);
    const iframe = document.createElement("iframe");
    iframe.src = uipath;
  }

  /**
   * Rpc call from worker to main
   * @param data 
   */
  async handleRpcCall(data: any) {
    const { callID, method, args = [] } = data;
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
      // console.log("[main] handleRpcCall error", err)
      this.worker?.postMessage({
        type: ExtensionEventTypes.rpcCallError,
        data: {
          callID,
          error: err.message
        }
      });
    }
  }

  private async loadExtension(extensionManifest: ExtensionManifest) {
    try {
      const mainContent = await this.fetchExtensionFileContent(extensionManifest, extensionManifest.main);
      this.worker.postMessage({
        type: ExtensionEventTypes.execute, data: {
          extension: extensionManifest,
          content: mainContent
        }
      });
    } catch (err) {
      this.extensionEvent.emit({
        type: ExtensionEventTypes.executeError,
        data: {
          extension: extensionManifest,
          error: err.message
        }
      })
      console.log("loadExtension error", err);
    }
  }

  private handleExtensionExecuteError(event: ExtensionManagerEvent) {
    const data = event.data;
    console.log("loadExtension:executeError", data);
    this.extensionEvent.emit({
      type: ExtensionEventTypes.executeError,
      data
    })
  }

  async fetchExtensionFileContent(extensionManifest: ExtensionManifest, filePath: string): Promise<string> {
    const url = getBackendUrl("/static/" + filePath);
    return await fetch(url).then((res) => res.text());
  }

  /**
   * Send editor event to worker
   * @param event 
   */
  onEditorEvent(event: any) {
    this.worker.postMessage({
      type: ExtensionEventTypes.editorMessage,
      data: event
    });
  }

  /**
   * Send ui event to worker
   * @param event 
   */
  onUIEvent(event: ExtensionUIEvent) {
    this.worker.postMessage({
      type: ExtensionEventTypes.uiMessage,
      data: event
    });
  }

  destroy() {
    this.extensionEvent.dispose();
    this.worker.terminate();
  }
}