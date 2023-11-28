import { PersistedWorkflowDocument } from "@/local-storage";
import defaultWorkflow from "./default-workflow";

export type WorkflowTemplate = Pick<PersistedWorkflowDocument, 'nodes' | 'connections'>;

export const WORKFLOW_TEMPLATE_MAP: Record<string, WorkflowTemplate> = {
    "default": defaultWorkflow as any
}