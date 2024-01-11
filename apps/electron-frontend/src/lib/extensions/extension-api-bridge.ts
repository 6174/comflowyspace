import { ExtensionEventTypes, ExtensionManagerEvent } from "./extension.types";

export interface ExtensionApi {
  
}

export class ExtensionApiBridge {
  constructor(
    public worker: Worker,
    public api: ExtensionApi
  ) {
    worker.onmessage = (event: MessageEvent<ExtensionManagerEvent>) => {
      const {type, data} = event.data;
      switch (type) {
        case ExtensionEventTypes.executeError:
          // this.handleExtensionExecuteError(event.data);
          break;
      }
    };
  }
}