import { SlotEvent } from "@comflowy/common/utils/slot-event";
import { ExtensionManagerEvent } from "../extension.types";

class WorkerEventHandler {
  onMessageEvent = new SlotEvent<ExtensionManagerEvent>();
}

export const workerEventHandler = new WorkerEventHandler();