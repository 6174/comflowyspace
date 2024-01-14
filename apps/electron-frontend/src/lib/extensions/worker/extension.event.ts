import { SlotEvent } from "@comflowy/common/utils/slot-event";
import { ExtensionManagerEvent } from "../extension.types";

class WorkerEvent {
  onMessageEvent = new SlotEvent<ExtensionManagerEvent>();
  constructor() {
    self.onmessage = (event: MessageEvent) => {
      this.onMessageEvent.emit(event.data);
    };
  }
}

export const workerEvent = new WorkerEvent();