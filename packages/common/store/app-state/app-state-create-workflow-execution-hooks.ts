import { AppState, AppStateGetter, AppStateSetter } from "./app-state-types";
import * as Y from "yjs";
import exifr from 'exifr'
import { create } from 'zustand'
import { type Edge, type Node, type OnNodesChange, type OnEdgesChange, type OnConnect, type XYPosition, type Connection as FlowConnecton, addEdge, applyNodeChanges, OnEdgesDelete, applyEdgeChanges, OnEdgeUpdateFunc, OnConnectStart, OnConnectEnd, OnConnectStartParams, NodeChange, ReactFlowInstance, } from 'reactflow';
import { WorkflowDocumentUtils, createNodeId } from '../ydoc-utils';
import { type NodeId, type NodeInProgress, type PropertyKey, SDNode, Widget, type WidgetKey, NODE_IDENTIFIER, Connection, PreviewImage, UnknownWidget, ContrlAfterGeneratedValues, NODE_GROUP, PersistedFullWorkflow, PersistedWorkflowNode, PersistedWorkflowDocument, PersistedWorkflowConnection, SUBFLOW_WIDGET_TYPE_NAME, parseSubflowSlotId, NodeVisibleState } from '../../types'
import { throttledUpdateDocument } from "../../storage";
import { PromptResponse, createPrompt, sendPrompt } from '../../comfyui-bridge/prompt';
import { getWidgetLibrary as getWidgets } from '../../comfyui-bridge/bridge';
import { writeWorkflowToFile, } from '../../comfyui-bridge/export-import';
import { getBackendUrl } from '../../config'
import { uuid } from '../../utils';
import { SlotEvent } from '../../utils/slot-event';
import { ComfyUIExecuteError } from '../../types';
import { ComfyUIEvents } from '../../types';
import { comflowyConsoleClient } from '../../utils/comflowy-console.client';
import { ControlBoardConfig } from '../../types';
import { SubflowStoreType, useSubflowStore } from "../subflow-state";
import { staticCheckWorkflowErrors } from "../../workflow-editor/parse-workflow-errors";
import { getNodePositionInGroup, getNodePositionOutOfGroup, getValueTypeOfNodeSlot } from "../../utils/workflow";
import _ from "lodash";

export default function createHook(set: AppStateSetter, get: AppStateGetter): Partial<AppState> {
  return {
    onNewClientId: (id) => {
      set({ clientId: id })
    },
    onSubmit: async () => {
      const state = get();
      const docJson = WorkflowDocumentUtils.toJson(state.doc);
      const prompt = createPrompt(docJson, state.widgets, state.clientId);
      const res = await sendPrompt(prompt);

      // update control_after_generated node
      const onNodeFieldChange = state.onNodeFieldChange;
      const MAX_VALUE = 18446744073709551615;
      state.nodes.forEach(node => {
        const widget = node.data.widget as Widget;
        const sdnode = node.data.value as SDNode;
        const seedFieldName = Widget.findSeedFieldName(widget);
        if (seedFieldName) {
          const control_after_generated = sdnode.fields.control_after_generated;
          const oldSeed = sdnode.fields[seedFieldName];
          let newSeed = oldSeed;
          switch (control_after_generated) {
            case "randomnized":
            case ContrlAfterGeneratedValues.Randomnized:
              newSeed = Math.random() * MAX_VALUE;
              break;
            case ContrlAfterGeneratedValues.Incremental:
              newSeed = Math.min(MAX_VALUE, oldSeed + 1);
              break;
            case ContrlAfterGeneratedValues.Decremental:
              newSeed = Math.max(-1, oldSeed - 1);
            default:
              break;
          }
          onNodeFieldChange(node.id, seedFieldName, newSeed);
        }
      });

      const newState = AppState.attatchStaticCheckErrors(get(), res.error || {})
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
      set(AppState.attatchStaticCheckErrors(get()));
    },
    onNodeInProgress: (id, progress) => {
      const { graph, subflowStore } = get();
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
      if (graph[id]) {
        st.editorEvent.emit({ type: ComfyUIEvents.ImageSave, data: { id, images } });
        temporalSaveImage(id, images);
        if (node?.data?.widget.name === "SaveImage") {
          persistSaveImage(id, images);
        }
      } else {
        subflowStore.getState().onImageSave(id, images);
        if (node?.data?.widget.name !== "SaveImage") {
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
        if (node?.data?.widget.name !== "SaveImage") {
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