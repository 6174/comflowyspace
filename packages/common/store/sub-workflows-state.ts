import { create } from 'zustand'
import { NodeId, ComfyUIExecuteError, PersistedFullWorkflow, NodeInProgress, PreviewImage, SDNode, SUBFLOW_WIDGET_TYPE_NAME, WidgetKey, Widget, Widgets, PersistedWorkflowNode } from "../types";
import { documentDatabaseInstance } from '../storage';
import { getNodeRenderInfo } from '../workflow-editor/node-rendering';
import _ from 'lodash';

/**
 * definition of SubWorkflowsData
 */
export interface SubWorkflowStore {
  widgets: Widgets;
  // sub workflow data mapping
  mapping: Record<string, PersistedFullWorkflow>;
  // node parent relations
  relations: Record<string, string>;
  workflowStates: Record<string, {
    isRootSubFlow: boolean;
    graph: Record<NodeId, SDNode>;
    promptError?: ComfyUIExecuteError;
    nodeInProgress?: NodeInProgress;
  }>;
  handleSubmitErrors: (errors: ComfyUIExecuteError) => void;
  setWidgets: (widgets: Widgets) => void;
  onImageSave: (id: NodeId, images: PreviewImage[]) => void
  onNodeInProgress: (id: NodeId, progress: number) => void;
  loadSubWorkfow: (flowId: string) => Promise<PersistedFullWorkflow | undefined>;
  parseSubWorkflow: (id: string) => void;
}

export const useSubWorkflowStore = create<SubWorkflowStore>((set, get) => ({
  mapping: {},
  widgets: {},
  relations: {},
  workflowStates: {},
  setWidgets: (widgets: Widgets) => {
    set({ widgets });
  },
  loadSubWorkfow: async (flowId: string): Promise<PersistedFullWorkflow | undefined> => {
    const st = get();
    const mapping = st.mapping;
    const workflowState = st.workflowStates[flowId] || {
      graph: {},
      isRootSubFlow: true
    };
    if (mapping[flowId]) {
      return mapping[flowId];
    } else {
      try {
        const state = await loadSubWorkflowToStore(st, flowId);
        set(state);
        return state.mapping[flowId];
      } catch (err) {
        console.error(err);
        throw new Error("Load sub workflow Error");
      }
    }
  },
  /**
   * 
   * if the node has parent workflow, then set the state to the parent workflow
   * @param id 
   * @param progress 
   */
  onNodeInProgress: (id, progress) => {
    const st = get();
    const workflowStates = st.workflowStates;
    const subFlowId = st.relations[id];
    if (subFlowId) {
      const workflowState = workflowStates[subFlowId];
      const newWorkflowStates = {
        ...workflowStates,
        [subFlowId]: {
          ...workflowState,
          nodeInProgress: {
            id,
            progress
          }
        }
      }
      set({
        workflowStates: newWorkflowStates
      });
    }
  },
  /**
   * if find subworkflow, then load the subworkflow to the store
   * @param id 
   * @param images 
   */
  onImageSave: (id, images) => {
    const st = get();
    const workflowStates = st.workflowStates;
    const subFlowId = st.relations[id];
    if (subFlowId) {
      const workflowState = workflowStates[subFlowId];
      const newWorkflowStates = {
        ...workflowStates,
        [subFlowId]: {
          ...workflowState,
          graph: {
            ...workflowState.graph,
            [id]: {
              ...workflowState.graph[id],
              images
            }
          }
        }
      }
      set({
        workflowStates: newWorkflowStates
      });
    }
  },
  /**
   *  @errors contain all sub workflow nodes's error, 
   *  we need split the errors to the workflow nodes
   */
  handleSubmitErrors: (errors: ComfyUIExecuteError) => {
    const st = get();
    const { node_errors } = errors;
    const { workflowStates } = st;
    const allNodeErrors = Object.entries(node_errors);
    for (const [nodeId, error] of allNodeErrors) {
      // direct parent
      const subFlowId = st.relations[nodeId];
      if (!subFlowId) {
        continue
      }
      const subFlowState = workflowStates[subFlowId]
      if (subFlowState) {
        subFlowState.promptError = {
          node_errors: {
            ...subFlowState.promptError?.node_errors,
            [nodeId]: error
          }
        }
      }
    }
    set({
      workflowStates: _.cloneDeep(workflowStates)
    });
  },
  parseSubWorkflow: (id) => {
    const st = get();
    const doc = st.mapping[id];
    const widgets = st.widgets;
    const allNodes = Object.values(doc.snapshot.nodes);
    const shareAsSubflowConfig = doc.snapshot.controlboard?.shareAsSubflowConfig!;
    const { title, description, nodes } = shareAsSubflowConfig;
    const nodesWithControlInfo = nodes.map(node => {
      const id = node.id;
      const perssitedNode = allNodes.find(n => n.id === id) as PersistedWorkflowNode;
      const widget = widgets[perssitedNode.value.widget];
      const {inputs, outputs, params} = getNodeRenderInfo(perssitedNode.value, widgets[perssitedNode.value.widget]);
      return {
        sdnode: perssitedNode?.value,
        nodeControl: node,
        widget
      }
    });

    return {
      nodesWithControlInfo,
      title,
      description
    }
  }
}));

export type SubWorkflowStoreType = typeof useSubWorkflowStore;

/**
 * Consider comflowy workflow is a tree structure 
 * type Workflow = WorkflowNode[];
 * type WorkflowNode = {xx} | Workflow;
 * 
 * so we need a program to parse comfyui workflow data to a flattern structure
 */
export async function loadSubWorkflowToStore(subworkflowStore: SubWorkflowStore, id: string): Promise<SubWorkflowStore> {
  if (!id) {
    return subworkflowStore;
  }

  let doc = subworkflowStore.mapping[id]
  if (!doc) {
    doc = await documentDatabaseInstance.getDoc(id);
    subworkflowStore.mapping[id] = doc;
  }

  // update relationships
  const allNodes = Object.values(doc.snapshot.nodes);
  const {graph} = subworkflowStore.workflowStates[id] || {
    graph: {},
    isRootSubFlow: false
  }

  allNodes.forEach(node => {
    subworkflowStore.relations[node.id] = id;
    graph[id] = node.value;
  });

  // find nested workflows
  const subFlowNodes =  allNodes.filter(node => node.value.widget === SUBFLOW_WIDGET_TYPE_NAME);

  for (const node of subFlowNodes) {
    await loadSubWorkflowToStore(subworkflowStore, node.value.flowId!,);
  }

  return {
    ...subworkflowStore,
    mapping: {
      ...subworkflowStore.mapping,
    }
  }
}

