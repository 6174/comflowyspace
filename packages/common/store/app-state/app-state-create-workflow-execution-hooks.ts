import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import { WorkflowDocumentUtils } from '../ydoc-utils';
import {SDNode, Widget, PreviewImage, ContrlAfterGeneratedValues, ComfyUIExecuteError, PersistedWorkflowDocument, NodeId, } from '../../types'
import { throttledUpdateDocument } from "../../storage";
import { PromptResponse, createPrompt, sendPrompt } from '../../comfyui-bridge/prompt';
import { ComfyUIEvents } from '../../types';
import { comflowyConsoleClient } from '../../utils/comflowy-console.client';
import _ from "lodash";
import { GlobalEvents, SlotGlobalEvent } from "../../utils/slot-event";

export default function createHook(set: AppStateSetter, get: AppStateGetter): Partial<AppState> {
  return {
    onNewClientId: (id) => {
      set({ clientId: id })
    },
    onBlobPreview: (id: NodeId, blobUrl: string) => {
      set({ blobPreview: { blobUrl, nodeId: id } })
    },
    onSubmit: async () => {
      const state = get();
      SlotGlobalEvent.emit({
        type: GlobalEvents.start_comfyui_execute,
        data: null,
      })
      const docJson = WorkflowDocumentUtils.toJson(state.doc);
      const prompt = createPrompt(docJson, state.widgets, state.clientId);
      const res = await sendPrompt(prompt);

      // update control_after_generated node
      const onNodeFieldChange = state.onNodeFieldChange;
      
      state.nodes.forEach(node => {
        const widget = node.data.widget as Widget;
        const sdnode = node.data.value as SDNode;
        const seedFieldName = Widget.findSeedFieldName(widget, sdnode.inputs.map(i => i.name));
        if (seedFieldName) {
          const control_after_generated = sdnode.fields.control_after_generated;
          const oldSeed = sdnode.fields[seedFieldName];
          let newSeed = Widget.getControlledSeedValue(control_after_generated, oldSeed);
          onNodeFieldChange(node.id, seedFieldName, newSeed);
        }
      });

      console.log("res", res);
      const newState = AppState.attatchStaticCheckErrors(get(), res.error || {} as ComfyUIExecuteError)
      set(newState);
      if (newState.promptError?.error || newState.promptError?.node_errors) {
        comflowyConsoleClient.comfyuiExecuteError(docJson,  newState.promptError);
      }
      // pass node_errors to subflows
      if (newState.promptError?.node_errors) {
        state.subflowStore.getState().handleSubmitErrors(newState.promptError);
      }

      return res
    },
    updateErrorCheck: () => {
      set(AppState.attatchStaticCheckErrors(get(), get().promptError));
    },
    onNodeInProgress: (id, progress = 0) => {
      const { graph, subflowStore } = get();

      if (!id) {
        set({ nodeInProgress: undefined })
        return;
      }

      if (graph[id]) {
        set({ nodeInProgress: { id, progress } })
      } else {
        subflowStore.getState().onNodeInProgress(id, progress);
      }
    },
    onImageSave: (id, images) => {
      const st = get();
      const { nodes, graph, subflowStore } = st;
      const node = nodes.find(node => node.id === id);

      /**
       * if find node in graph, the node is in main workflow, save to state and storage
       * else if the node is a subflow‘s sub node, then set the state to the subflow
       */
      const widgetName = node?.data?.widget.name;
      const isSaveImageNode = Widget.isSaveImageNode(widgetName);
      if (graph[id]) {
        st.editorEvent.emit({ type: ComfyUIEvents.ImageSave, data: { id, images } });
        temporalSaveImage(id, images);
        if (isSaveImageNode) {
          persistSaveImage(id, images);
        }
      } else {
        subflowStore.getState().onImageSave(id, images);
        if (!isSaveImageNode) {
          return;
        }
        const { relations } = subflowStore.getState();
        const subflowId = relations[id];
        const subflowNode = graph[subflowId];
        if (subflowNode) {
          st.editorEvent.emit({ type: ComfyUIEvents.ImageSave, data: { id, images } });
          temporalSaveImage(id, images);
          persistSaveImage(id, images, false);
        }
      }

      function temporalSaveImage(id: string, images: PreviewImage[]) {
        set((st) => ({
          graph: {
            ...st.graph,
            [id]: { ...st.graph[id], images },
          },
        }));
      }

      function persistSaveImage(id: string, images: PreviewImage[], saveToGallery = true) {
        const st = get();
        const { nodes, graph, subflowStore } = st;
        const node = nodes.find(node => node.id === id);
        const widgetName = node?.data?.widget.name;
        const isSaveImageNode = Widget.isSaveImageNode(widgetName);
        if (!isSaveImageNode) {
          return;
        }
        const last_edit_time = +new Date();
        const newPersistedWorkflow = saveToGallery ? {
          ...st.persistedWorkflow!,
          last_edit_time,
          gallery: [
            ...st.persistedWorkflow?.gallery || [],
            ...images.reverse() || []
          ].reverse(),
        } : st.persistedWorkflow!;

        // sync gallery state
        set({
          persistedWorkflow: newPersistedWorkflow,
        });

        // save to storage
        WorkflowDocumentUtils.onImageSave(st.doc, id, images);
        const workflowMap = st.doc.getMap("workflow");
        const workflow = workflowMap.toJSON() as PersistedWorkflowDocument;
        throttledUpdateDocument({
          ...newPersistedWorkflow,
          snapshot: workflow
        });
      }
    },
  }
}