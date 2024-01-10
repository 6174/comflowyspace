import { WorkflowTemplate } from "@comflowy/common/templates/templates";
import { create } from "zustand";

/**
 * Hard coded template list
 * @returns 
 */
import defaltTemlate from "./data/default-workflow.json";
import loraTemplate from "./data/LoRA-workflow.json";
import lcmLoraTemplate from "./data/LCM-LoRA-workflow.json";
import img2imgTemplate from "./data/Simple-img2img-workflow.json";
import unclipModelTemplate from "./data/unCLIP-model-workflow.json";
import styleModelWorkflow from "./data/Style-model-workflow.json";
import upscalePixelByAlgorithmWorkflow from "./data/Upscale-pixel-by-algorithm-workflow.json";
import upscalePixelByModelWorkflow from "./data/Upscale-pixel-by-model-workflow.json"
import hiResFixLatentUpscaleWorkflow from "./data/Hi-res-fix-latent-upscale-workflow.json";
import upscalePixelAndHiResFixLatentWorkflow from "./data/Upscale-pixel-and-Hi-res-fix-workflow.json";
import inpaintingTemplate from "./data/Inpainting-workflow.json";
import outpaintingTemplate from "./data/Outpainting-workflow.json";
import sdxlPromptStylerWorkflow from "./data/SDXL-prompt-styler-workflow.json";
import batchImageWorkflow from "./data/Batch-image-workflow.json";
import scribbleControlNetWorkflow from "./data/Scribble-ControlNet-workflow.json";
import poseControlNetWorkflow from "./data/Pose-ControlNet-workflow.json";
import cannyWorkflow from "./data/Canny-ControlNet-workflow.json";
import upscaleThumbnail from "./thumbnails/upscale.png";
import poseThumbnail from "./thumbnails/pose.png";
import defaultThumbnail from "./thumbnails/default.png";
import loraThumbnail from "./thumbnails/lora.png";

import { ComfyUIWorkflow } from "@comflowy/common/comfui-interfaces/comfy-workflow";
function getHardCodedTemplates(): Template[] {
    return [
        {
            name: "Default Workflow",
            description: "A basic workflow contain primary nodes",
            thumbnail: defaultThumbnail.src,
            data: defaltTemlate as unknown as ComfyUIWorkflow
        },
        {
            name: "LoRA workflow",
            data: loraTemplate as unknown as ComfyUIWorkflow,
            thumbnail: loraThumbnail.src
        },
        {
            name: "LCM LoRA workflow",
            data: lcmLoraTemplate as unknown as ComfyUIWorkflow
        },
        {
            name: "Simple img2img workflow",
            data: img2imgTemplate as unknown as ComfyUIWorkflow
        },
        {
            name: "unCLIP model workflow",
            data: unclipModelTemplate as unknown as ComfyUIWorkflow
        },
        {
            name: "Style model workflow",
            data: styleModelWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Upscale pixel by algorithm workflow",
            thumbnail: upscaleThumbnail.src,
            data: upscalePixelByAlgorithmWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Upscale pixel by model workflow",
            data: upscalePixelByModelWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Hi-res fix latent upscale workflow",
            data: hiResFixLatentUpscaleWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Upscale pixel and hi-res fix latent workflow",
            data: upscalePixelAndHiResFixLatentWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Inpainting workflow",
            data: inpaintingTemplate as unknown as ComfyUIWorkflow
        },
        {
            name: "Outpainting workflow",
            data: outpaintingTemplate as unknown as ComfyUIWorkflow
        },
        {
            name: "SDXL prompt styler workflow",
            data: sdxlPromptStylerWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Batch image workflow",
            data: batchImageWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Scribble ControlNet workflow",
            data: scribbleControlNetWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Pose ControlNet workflow",
            thumbnail: poseThumbnail.src,
            data: poseControlNetWorkflow as unknown as ComfyUIWorkflow
        },
        {
            name: "Canny ControlNet workflow",
            data: cannyWorkflow as unknown as ComfyUIWorkflow
        }
    ]
}

export type Template = {
    name: string;
    tags?: string[];
    description?: string;
    created_by?: string;
    thumbnail? : string;
    data: ComfyUIWorkflow;
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



