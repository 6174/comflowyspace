import Y from "yjs";
import { useAppStore } from ".";

let undoManager: Y.UndoManager;
export function getUndoManager() {
  if (undoManager === undefined) {
    updateUndoManager();
  }
  return undoManager
}

export function updateUndoManager() {
  const doc = useAppStore.getState().doc;
  undoManager = new Y.UndoManager(doc.getMap("workflow"));
}