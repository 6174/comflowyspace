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
  }
}