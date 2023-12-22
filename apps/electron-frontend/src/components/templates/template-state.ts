import { WorkflowTemplate } from "@comflowy/common/templates/templates";
import { create } from "zustand";

/**
 * Hard coded template list
 * @returns 
 */
import defaltTemlate from "./data/default.json";
function getHardCodedTemplates(): Template[] {
    return [
        {
            name: "Default Workflow",
            description: "A basic workflow contain primary nodes",
            data: defaltTemlate as unknown as WorkflowTemplate
        }
    ]
}

export type Template = {
    name: string;
    description: string;
    created_by?: string;
    thumbnail? : string;
    data: WorkflowTemplate;
}

type TemplatesState = {
    templates: Template[];
    loading: boolean;
}

type TemplatesAction = {
    onInit: () => void;
    setTemplates: (templates: Template[]) => void;
}

export const useTemplatesState = create<TemplatesState & TemplatesAction>((set) => ({
    templates: [],
    loading: false,
    onInit: async () => {
        try {
            // set local templates first for fast loading
            const hardCodedTemplates = getHardCodedTemplates();
             set({
                templates: hardCodedTemplates,
            });

            // mix with remote templates
            const templatesMap: Record<string, Template> = {};
            const templates = [];
            const iterator = tpl => {
                const key = tpl.name;
                templatesMap[key] = tpl;
            };
            const serverTemplates = await getServerTemplates();
            hardCodedTemplates.forEach(iterator);
            serverTemplates.forEach(iterator);
            for(let key in templatesMap) {
                templates.push(templatesMap[key]);
            }
            set({
                templates
            });
        } catch(err) {
            console.log(err);
        }
    },
    setTemplates: (templates: Template[]) => {
        set({
            templates
        })
    }
}));

/**
 * Remote template lists
 * @returns 
 */
async function getServerTemplates(): Promise<Template[] | null>  {
    const serverTemplateUrl = "";
    try {
        const res = await fetch(serverTemplateUrl);
        const ret = await res.json();
        if (ret.success) {
            return ret.templates;
        }
    } catch(err) {
        console.log(err);
    }
    return [];
}

/**
 * Cached remote template list
 * @returns 
 */
async function getLocalTemplates(): Promise<Template[] | null>  {
    try {
        return [];
    } catch(err) {
        console.log(err);
    }
    return [];
}



