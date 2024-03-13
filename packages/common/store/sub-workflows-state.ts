import { create } from 'zustand'
import { NodeId, ComfyUIExecuteError, PersistedFullWorkflow, NodeInProgress, PreviewImage, SDNode } from "../types";

/**
 * definition of SubWorkflowsData
 */
export interface SubWorkflowStore {
  // sub workflow data mapping
  mapping: Record<string, PersistedFullWorkflow>;
  // node parent relations
  relations: Record<string, string>;
  workflowsExecutionState: Record<string, {
    graph: Record<NodeId, SDNode>;
    promptError?: ComfyUIExecuteError;
    nodeInProgress?: NodeInProgress;
  }>;
  onImageSave: (id: NodeId, images: PreviewImage[]) => void
  onNodeInProgress: (id: NodeId, progress: number) => void;
  onLoadSubWorkfow: (flowId: string) => Promise<PersistedFullWorkflow | undefined>;
  getWorkflowNodeRenderingInfo: (flowId: string) => Promise<PersistedFullWorkflow | undefined>;
}

export const useSubWorkflowStore = create<SubWorkflowStore>((set, get) => ({
  mapping: {},
  relations: {},
  workflowsExecutionState: {},
  getWorkflowNodeRenderingInfo: async (flowId: string):Promise<PersistedFullWorkflow | undefined> => {
    const subworkflow = get().mapping[flowId];
    if (subworkflow) {
      return subworkflow;
    } else {
      try {
        // fetch subworkflow from server
      } catch (err) {
        console.error(err);
        throw new Error("asdf");
      }
    }
  },
  onLoadSubWorkfow: async (flowId: string): Promise<PersistedFullWorkflow | undefined> => {
    const mapping = get().mapping;
    if (mapping[flowId]) {
      return mapping[flowId];
    } else {
      try {
        // fetch subworkflow from server
      } catch (err) {
        console.error(err);
        throw new Error("Load sub workflow Error");
      }
    }
  },
  onNodeInProgress: (id, progress) => {
  },
  onImageSave: (id, images) => {
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
export async function loadSubWorkflow(id: string, subworkflowDataMapping: SubWorkflowStore): Promise<{
  subworkflowDataMapping: SubWorkflowStore
}> {
  return {
    subworkflowDataMapping
  }
}