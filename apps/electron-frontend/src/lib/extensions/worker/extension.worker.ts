import { ExtensionEventTypes, ExtensionManifest } from "../extension.types";
import comflowy from "./extension.api";
import { workerEvent } from "./extension.event";

class ExtensionWorker {
  /**
   * start extension worker
   */
  start() {
    workerEvent.onMessageEvent.on(this.handleRequest);
    (window as any).comflowy = comflowy;
  }

  /**
   * handle request
   * @param data 
   */
  handleRequest = (data: any) => {
    console.log("receive from main", data);
    switch (data.type) {
      case ExtensionEventTypes.uiMessage:
        if (comflowy.ui.onmessage) {
          comflowy.ui.onmessage(data.msg);
        }
        break;
      case ExtensionEventTypes.editorMessage:
        if (comflowy.editor.onmessage) {
          comflowy.editor.onmessage(data.msg);
        }
        break;
      case ExtensionEventTypes.execute:
    }
  }

  /**
   * execute extension
   * @param data 
   */
  executeExtension(data) {
    const { extension, content } = data;
    try {
      eval(extesionMainTemplate(extension, content));
    } catch (err) {
      console.log("executeExtension error", err);
      self.postMessage({
        type: ExtensionEventTypes.executeError,
        data: {
          extension,
          error: err.message
        }
      });
    }
  }
}

/**
 * Register static vars to extension main code
 * @param extension 
 * @param content 
 * @returns 
 */
function extesionMainTemplate(extension: ExtensionManifest, content: string) {
  return `
  (function() {
    var __EXTENSION__ = ${JSON.stringify(extension)};
    ${content}
  })();
  `
}

const extensionWorker = new ExtensionWorker();
extensionWorker.start();