import exp from "constants";
import { ExtensionEventTypes, ExtensionManifest } from "../extension.types";

class Comflowy {
  ui: { onmessage: any; postMessage: (msg: any) => void; };
  editor: { onmessage: any; postMessage: (msg: any) => void; };
  constructor() {
    this.ui = {
      onmessage: null,
      postMessage: msg => {
        postMessage({ type: 'uiMessage', msg });
      },
    }
    this.editor = {
      onmessage: null,
      postMessage: msg => {
        postMessage({ type: 'editorMessage', msg });
      }
    }
  }

  /**
   * showUI(__EXTENSION__)
   */
  showUI(extension: ExtensionManifest) {
    postMessage({ type: ExtensionEventTypes.showUI, data: {
      extension: extension
    }});
  }

}

const comflowy = new Comflowy();

export default comflowy;