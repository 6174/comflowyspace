import { ExtensionEventTypes, ExtensionManifest, ExtensionUIEvent } from "../extension.types";
import comflowy from "./extension.api";
import { workerEvent } from "./extension.event";

class ExtensionWorker {
  /**
   * start extension worker
   */
  start() {
    workerEvent.onMessageEvent.on(this.handleRequest);
    setAndProtectGlobalObject();
  }

  /**
   * handle request
   * @param data 
   */
  handleRequest = (ev: any) => {
    console.log("receive from main", ev);
    switch (ev.type) {
      case ExtensionEventTypes.uiMessage:
        comflowy.onUIMessage.emit(ev.data);
        break;
      case ExtensionEventTypes.editorMessage:
        comflowy.onEditorMessage.emit(ev.data);
        break;
      case ExtensionEventTypes.execute:
        this.executeExtension(ev.data);
        break;
    }
  }

  /**
   * execute extension
   * @param data 
   */
  executeExtension(data) {
    console.log("executeExtension", data);
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

function setAndProtectGlobalObject() {
  (self as any).__comflowy__ = comflowy;
  Object.defineProperty(self, "__comflowy__", {
    writable: false,
    configurable: false
  });
  let properties = Object.keys(comflowy);
  for (let property of properties) {
    Object.defineProperty(comflowy, property, {
      writable: false,  
      configurable: false
    });
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

  var comflowy = {
    ui: {
      onmessage: () => {},
      showUI: () => {
        self.__comflowy__.showUI(__EXTENSION__);
      }
    },
    editor: {
      onmessage: () => {},
      getNodes: async () => {
        await self.__comflowy__.createRpcCall("getNodes");
      }
    },
  };

  self.__comflowy__.onUIMessage.on((event) => {
    if (event.extensionId === "${extension.id}") {
      comflowy.ui.onmessage(event.srcEvent);
    }
  });

  self.__comflowy__.onEditorMessage.on((event) => {
    comflowy.ui.onmessage(event);
  });

  ${content}
})();
`
}

const extensionWorker = new ExtensionWorker();
extensionWorker.start();