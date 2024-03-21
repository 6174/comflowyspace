export * from "./app-state-types";
export {validateEdge} from "./app-state-create-edit-connection-hooks";
export { getPinnedWidgetsFromLocalStorage , setPinnedWidgetsToLocalStorage} from "./app-state-create-init-hooks";

import * as Y from "yjs";
import { create } from 'zustand'
import { SlotEvent } from '../../utils/slot-event';
import { useSubflowStore } from "../subflow-state";
import _ from "lodash";
import { AppState, EditorEvent } from "./app-state-types";

import createInitHooks from "./app-state-create-init-hooks";
import createSyncStateHooks from "./app-state-create-sync-state-hooks";
import createDocManagementHooks from "./app-state-create-doc-management-hooks";
import createCanvasHooks from "./app-state-create-edit-canvas";
import createEditNodeHooks from "./app-state-create-edit-node-hooks";
import createEditConnectionHooks from "./app-state-create-edit-connection-hooks";
import createWorkflowExecutionHooks from "./app-state-create-workflow-execution-hooks";

export const useAppStore = create<AppState>((set, get) => {
  return {
    transform: 1,
    transforming: false,
    persistedWorkflow: null,
    doc: new Y.Doc(),
    editorEvent: new SlotEvent<EditorEvent>(),
    resetWorkflowEvent: new SlotEvent<any>(),
    graph: {},
    nodes: [],
    edges: [],
    unknownWidgets: new Set<string>(),
    subflowStore: useSubflowStore,

    // temporary state
    slectionMode: "default",
    nodeSelection: [],
    edgeSelection: [],
    draggingAndResizing: false,
    isConnecting: false,

    // properties
    counter: 0,
    widgets: {},
    widgetCategory: {},

    ...createSyncStateHooks(set, get),
    ...createCanvasHooks(set, get),
    ...createDocManagementHooks(set, get),
    ...createEditNodeHooks(set, get),
    ...createEditConnectionHooks(set, get),
    ...createWorkflowExecutionHooks(set, get),
    ...createInitHooks(set, get)
    
  } as unknown as AppState
})
