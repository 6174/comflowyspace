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
import lcmLoraThumbnail from "./thumbnails/lcm-lora.png";
import simpleImage2ImageThumbnail from "./thumbnails/simple-image2image.png";
import unclipThumbnail from "./thumbnails/unclip.png";
import styleModelThumbnail from "./thumbnails/style-model.png";
import hiResUpscale from "./thumbnails/hi-res-upscale.png";
import inpaintingThumbnail from "./thumbnails/inpainting.png";
import outpaintingThumbnail from "./thumbnails/outpainting.png";
import scribbleThumbnail from "./thumbnails/scribble.png";
import cannyThumbnail from "./thumbnails/canny.png";
import batchThumbnail from "./thumbnails/batch.png";
import sdxlThumbnail from "./thumbnails/sdxl.png";
import pixelAndHiResThumbnail from "./thumbnails/pixel-and-hi-res.png";
import upscalingModelThumbnail from "./thumbnails/upscaling-model.png";

import { ComfyUIWorkflow } from "@comflowy/common/comfui-interfaces";
function getHardCodedTemplates(): Template[] {
    return [
        {
            name: "Default Workflow",
            description: "The most basic workflow can serve as a foundation for expanding into other workflows.",
            thumbnail: defaultThumbnail.src,
            reference_url: "https://www.comflowy.com/basics/comfyui-foundation#%E9%BB%98%E8%AE%A4-workflow",
            data: defaltTemlate as unknown as ComfyUIWorkflow
        },
        {
            name: "LoRA workflow",
            description: "Add a LoRA node to the basic model. You can load different LoRAs into the model to generate images of special styles.",
            data: loraTemplate as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/basics/lora#lora-workflow",
            thumbnail: loraThumbnail.src
        },
        {
            name: "LCM LoRA workflow",
            description: "An LCM LoRA node is added to the basic model. Using this workflow can significantly speed up the image generation of non-Turbo models.",
            data: lcmLoraTemplate as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/basics/lora#lcm-lora-workflow",
            thumbnail: lcmLoraThumbnail.src
        },
        {
            name: "Simple img2img workflow",
            description: "Use the input image as an empty latent image, allowing the model to redraw the image into a new one, while the output image still remains similar to the input.",
            data: img2imgTemplate as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/image-to-image#simple-img2img-workflow",
            thumbnail: simpleImage2ImageThumbnail.src
        },
        {
            name: "unCLIP model workflow",
            description: "Give the input picture as a prompt to the model. The model will use this picture as a reference to generate images similar in content, style, and composition to the original.",
            data: unclipModelTemplate as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/image-to-image#unclip-model-workflow",
            thumbnail: unclipThumbnail.src
        },
        {
            name: "Style model workflow",
            description: "Give the input picture as a prompt to the model. Let it generate similar pictures. Unlike unCLIP, this workflow will only reference the style of the input image. It will not generate similar content.",
            data: styleModelWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/image-to-image#style-model-workflow",
            thumbnail: styleModelThumbnail.src
        },
        {
            name: "Upscale pixel by algorithm workflow",
            description: "Use the most basic upscale algorithm to enlarge the image. This workflow will only enlarge the image, not enhance its clarity. If you want a pure representation, you can choose this workflow.",
            data: upscalePixelByAlgorithmWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/upscale#upscale-pixel-by-algorithm-workflow",
            thumbnail: upscaleThumbnail.src
        },
        {
            name: "Upscale pixel by model workflow",
            description: "Use the upscale model to enlarge the image. This workflow will not only enlarge the image but also enhance its sharpness. However, it will add some content that the original image does not have.",
            data: upscalePixelByModelWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/upscale#upscale-pixel-by-algorithm-workflow",
            thumbnail: upscalingModelThumbnail.src
        },
        {
            name: "Hi-res fix latent upscale workflow",
            description: "Enlarge the image in latent space using the upscale model. This method can enlarge the image while improving its details and sharpness as much as possible. However, it will add a lot of stuff that the original picture does not have, reducing the consistency of the enlargement.",
            data: hiResFixLatentUpscaleWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/upscale#hi-res-fix-latent-upscale-workflow",
            thumbnail: hiResUpscale.src
        },
        {
            name: "Upscale pixel and hi-res fix latent workflow",
            description: "This is a workflow combining Upscale pixel by model and Hi-res fixed. If you want a relatively balanced effect, and intend to enlarge the image while maintaining its consistency with the original, you can choose this workflow.",
            data: upscalePixelAndHiResFixLatentWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/upscale#upscale-pixel-and-hi-res-fix-workflow",
            thumbnail: pixelAndHiResThumbnail.src
        },
        {
            name: "Inpainting workflow",
            description: "You can use this workflow to have the model redraw parts of the image.",
            data: inpaintingTemplate as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/in&outpainting#inpainting-workflow",
            thumbnail: inpaintingThumbnail.src
        },
        {
            name: "Outpainting workflow",
            description: "You can use this workflow to allow the model to expand and generate additional image content.",
            data: outpaintingTemplate as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/in&outpainting#outpainting-workflow",
            thumbnail: outpaintingThumbnail.src
        },
        {
            name: "SDXL prompt styler workflow",
            description: "This workflow has a node where you can manually select a style. Through manual selection, you can input a style prompt to the model. If you're unsure about how to write a prompt, you can use this workflow.",
            data: sdxlPromptStylerWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/basics/prompt#sdxl-prompt-styler-workflow",
            thumbnail: sdxlThumbnail.src
        },
        {
            name: "Batch image workflow",
            description: "A workflow similar to Midjourney that generates four images at once.",
            data: batchImageWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/basics/prompt#batch-image-workflow",
            thumbnail: batchThumbnail.src
        },
        {
            name: "Scribble ControlNet workflow",
            description: "Use a hand-drawn sketch as a reference, instructing the model to generate an image consistent with the composition of the sketch.",
            data: scribbleControlNetWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "http://www.comflowy.com/advanced/controlnet#scribble-controlnet-workflow",
            thumbnail: scribbleThumbnail.src
        },
        {
            name: "Pose ControlNet workflow",
            description: "Use a character's pose picture as a reference, instructing the model to generate an image of the character in a similar pose.",
            data: poseControlNetWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/controlnet#pose-controlnet-workflow",
            thumbnail: poseThumbnail.src,
        },
        {
            name: "Canny ControlNet workflow",
            description: "Use an outline sketch as a reference, instructing the model to generate an image consistent with the outline's contour.",
            data: cannyWorkflow as unknown as ComfyUIWorkflow,
            reference_url: "https://www.comflowy.com/advanced/controlnet#canny-controlnet-workflow",
            thumbnail: cannyThumbnail.src
        }
    ]
}

export type Template = {
    name: string;
    tags?: string[];
    reference_url?: string;
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



