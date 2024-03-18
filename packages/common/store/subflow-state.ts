import { create } from 'zustand'
import { NodeId, ComfyUIExecuteError, PersistedFullWorkflow, NodeInProgress, PreviewImage, SDNode, SUBFLOW_WIDGET_TYPE_NAME, WidgetKey, Widget, Widgets, PersistedWorkflowNode, SubflowNodeWithControl, getSubflowSlotId, SubflowNodeRenderingInfo } from "../types";
import { documentDatabaseInstance } from '../storage';
import { getNodeRenderInfo } from '../workflow-editor/node-rendering';
import _ from 'lodash';

/**
 * definition of SubflowsData
 */
export interface SubflowStore {
  widgets: Widgets;
  // sub workflow data mapping
  mapping: Record<string, PersistedFullWorkflow>;
  // node parent relations
  relations: Record<string, string>;
  workflowStates: Record<string, {
    isRootSubflow: boolean;
    graph: Record<NodeId, SDNode>;
    renderingInfo?: SubflowNodeRenderingInfo;
    promptError?: ComfyUIExecuteError;
    nodeInProgress?: NodeInProgress;
  }>;
  handleSubmitErrors: (errors: ComfyUIExecuteError) => void;
  setWidgets: (widgets: Widgets) => void;
  onImageSave: (id: NodeId, images: PreviewImage[]) => void
  onNodeInProgress: (id: NodeId, progress: number) => void;
  loadSubWorkfow: (flowId: string, forceUpdate?: boolean) => Promise<PersistedFullWorkflow | undefined>;
  getSubflowNodeSlotInfo: (flowId: string, slotId: string, handleType: "source" | "target") => any;
}

export const useSubflowStore = create<SubflowStore>((set, get) => ({
  mapping: {},
  widgets: {},
  relations: {},
  workflowStates: {},
  getSubflowNodeSlotInfo: (flowId: string, slotId: string, handleType: "source" | "target") => {
    const st = get();
    const renderingInfo = st.workflowStates[flowId]?.renderingInfo;
    if (!renderingInfo) {
      throw new Error("Something wrong, there is no rendering info found to parse slot info");
    }
    const data = handleType === "target" ? renderingInfo.inputs : renderingInfo.outputs;
    return data.find(it => it.id.toUpperCase() === slotId);
  },
  setWidgets: (widgets: Widgets) => {
    set({ widgets });
  },
  loadSubWorkfow: async (flowId: string, forceUpdate:boolean = false): Promise<PersistedFullWorkflow | undefined> => {
    const st = get();
    const mapping = st.mapping;
    if (mapping[flowId] && !forceUpdate) {
      return mapping[flowId];
    } else {
      try {
        const state = await loadSubflowToStore(st, flowId);
        const renderingInfo = parseSubflow(state.mapping[flowId]!, st.widgets);
        state.workflowStates = {
          ...state.workflowStates,
          [flowId]: {
            ...state.workflowStates[flowId] || {},
            renderingInfo
          }
        };
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
   * if find subflow, then load the subflow to the store
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
  }
}));

export type SubflowStoreType = typeof useSubflowStore;

/**
 * Consider comflowy workflow is a tree structure 
 * type Workflow = WorkflowNode[];
 * type WorkflowNode = {xx} | Workflow;
 * 
 * so we need a program to parse comfyui workflow data to a flattern structure
 */
export async function loadSubflowToStore(subflowStore: SubflowStore, id: string): Promise<SubflowStore> {
  if (!id) {
    return subflowStore;
  }

  let doc = subflowStore.mapping[id]
  if (!doc) {
    doc = await documentDatabaseInstance.getDoc(id);
    subflowStore.mapping[id] = doc;
  }

  // update relationships
  const allNodes = Object.values(doc.snapshot.nodes);
  const {graph} = subflowStore.workflowStates[id] || {
    graph: {},
    isRootSubflow: false
  }

  allNodes.forEach(node => {
    subflowStore.relations[node.id] = id;
    graph[id] = node.value;
  });

  // find nested workflows
  const subFlowNodes =  allNodes.filter(node => node.value.widget === SUBFLOW_WIDGET_TYPE_NAME);

  for (const node of subFlowNodes) {
    await loadSubflowToStore(subflowStore, node.value.flowId!,);
  }

  return {
    ...subflowStore,
    mapping: {
      ...subflowStore.mapping,
    }
  }
}

export function parseSubflow(doc: PersistedFullWorkflow, widgets: Widgets): SubflowNodeRenderingInfo {
  if (!doc || !doc.snapshot.controlboard?.shareAsSubflowConfig) {
    return {
      doc,
      nodesWithControlInfo: [],
      inputs: [],
      outputs: [] ,
      params: [],
      title: "Subflow",
      description: ""
    }
  }

  const allNodes = Object.values(doc.snapshot.nodes);
  const shareAsSubflowConfig = doc.snapshot.controlboard?.shareAsSubflowConfig;
  const { title, description, nodes } = shareAsSubflowConfig;

  const nodesWithControlInfo = nodes.map(node => {
    // @TODO: 这里需要考虑节点又是 subflow 的情况，不过暂时可以不考虑它，也就是说不能将 subflow 放在 controlboard 中当做参数
    const id = node.id;
    const perssitedNode = allNodes.find(n => n.id === id) as PersistedWorkflowNode;
    const widget = widgets[perssitedNode.value.widget];
    const { inputs, outputs, title, params } = getNodeRenderInfo(perssitedNode.value, widgets[perssitedNode.value.widget]);

    const paramsToRender = params.filter(param => {
      if (!node.fields) {
        return;
      }
      return node.fields.includes(param.property);
    });

    const inputsToRender = inputs.filter(input => {
      if (!node.inputs) {
        return;
      }
      return node.inputs.includes(input.name);
    });

    const outputsToRender = outputs.filter(output => {
      if (!node.outputs) {
        return;
      }
      return node.outputs.includes(output.name);
    });

    return {
      id,
      sdnode: perssitedNode?.value,
      title,
      nodeControl: node,
      params: paramsToRender,
      inputs: inputsToRender,
      outputs: outputsToRender,
      widget
    } as SubflowNodeWithControl
  });

  const allInputs = nodesWithControlInfo.reduce((acc, { inputs, sdnode, widget, title, id }) => {
    return [...acc, ...inputs.map(input => {
      return {
        ...input,
        sdnode,
        widget,
        nodeId: id,
        id: getSubflowSlotId(id, input.name),
        name: `${title}:${input.name}`
      }
    })]
  }, [] as any);

  const allOutputs = nodesWithControlInfo.reduce((acc, { outputs, sdnode, widget, title, id }) => {
    return [...acc, ...outputs.map(output => {
      return {
        ...output,
        sdnode,
        widget,
        nodeId: id,
        id: getSubflowSlotId(id, output.name),
        name: `${title}:${output.name}`
      }
    })];
  }, [] as any);

  const allParams = nodesWithControlInfo.reduce((acc, { sdnode, params, title, id, widget }) => {
    return [...acc, ...params.map(param => {
      return {
        ...param,
        sdnode,
        title,
        widget,
        nodeId: id,
        id
      }
    })]
  }, [] as any);

  return {
    doc,
    nodesWithControlInfo,
    title: title || doc.title || "SubflowNode",
    description: description || "",
    inputs: allInputs,
    outputs: allOutputs,
    params: allParams
  };
}
