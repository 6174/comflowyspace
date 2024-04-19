import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import * as Y from "yjs";
import exifr from 'exifr'
import { WorkflowDocumentUtils } from '../ydoc-utils';
import { throttledUpdateDocument } from "../../storage";
import { writeWorkflowToFile, } from '../../comfyui-bridge/export-import';
import { getBackendUrl } from '../../config'
import _ from "lodash";
import { ControlBoardConfig, PersistedFullWorkflow, PersistedWorkflowDocument, PreviewImage } from "../../types";

export default function createHook(set: AppStateSetter, get: AppStateGetter): Partial<AppState> {
  return {
    undo: () => {
      const st = get();
      const { undoManager } = st;
      if (undoManager && undoManager.canUndo()) {
        undoManager.undo();
        st.onSyncFromYjsDoc();
      }
    },
    redo: () => {
      const st = get();
      const { undoManager } = st;
      if (undoManager && undoManager.canRedo()) {
        undoManager.redo();
        st.onSyncFromYjsDoc();
      }
    },
    onDocAttributeChange: (updates: any) => {
      const last_edit_time = +new Date();
      set((st) => ({
        persistedWorkflow: {
          ...st.persistedWorkflow,
          ...updates,
          last_edit_time: +new Date(),
        }
      }));
      const st = get();
      throttledUpdateDocument({
        ...st.persistedWorkflow!,
        ...updates,
        last_edit_time,
      });
    },
    onChangeControlBoard: (config: ControlBoardConfig) => {
      set((st) => {
        return {
          ...st,
          controlboard: config
        }
      })
      const st = get();
      const { doc } = st;
      WorkflowDocumentUtils.updateControlBoard(doc, config);
      AppState.persistUpdateDoc(st, doc)
    },
    /**
     * Workflow load & persisted
     * @param workflow 
     */
    onLoadWorkflow: (workflow: PersistedFullWorkflow) => {
      const st = get();
      const doc = WorkflowDocumentUtils.fromJson({
        id: workflow.id,
        title: workflow.title,
        nodes: workflow.snapshot.nodes,
        controlboard: workflow.snapshot.controlboard,
        connections: workflow.snapshot.connections
      });
      console.log("load workflow", workflow);
      set(st => {
        return {
          ...st,
          persistedWorkflow: workflow,
          undoManager: new Y.UndoManager(doc.getMap("workflow")),
          doc,
        }
      });
      st.onSyncFromYjsDoc();

      set(AppState.attatchStaticCheckErrors(get()));
    },
    /**
     * reset workflow from another document
     * @param workflow 
     */
    onResetFromPersistedWorkflow: async (workflow: PersistedWorkflowDocument): Promise<void> => {
      console.log("Reset workflow", workflow);

      set({
        nodes: [],
        edges: [],
        graph: {},
      });

      setTimeout(() => {
        const st = get();
        WorkflowDocumentUtils.updateByJson(st.doc, workflow)
        st.onSyncFromYjsDoc();
        set(AppState.attatchStaticCheckErrors(get()));
      }, 10);
    },
    onExportWorkflow: () => {
      writeWorkflowToFile(AppState.toPersisted(get()))
    },
    onLoadImageWorkflow: (image) => {
      void exifr.parse(getBackendUrl(`/view/${image}`)).then((res) => {
        get().onLoadWorkflow(JSON.parse(res.workflow))
      })
    },
    onUpdateGallery: (images: PreviewImage[]) => {
      const st = get();
      const last_edit_time = +new Date();
      const newPersistedWorkflow = {
        ...st.persistedWorkflow!,
        last_edit_time,
        gallery: images,
      };
      // sync gallery state
      set({
        persistedWorkflow: newPersistedWorkflow,
      });
      throttledUpdateDocument(newPersistedWorkflow)
    }
  }
}