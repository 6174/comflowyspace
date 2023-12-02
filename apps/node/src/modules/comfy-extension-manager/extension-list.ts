export default {
    "extensions": [
        {
            "author": "Dr.Lt.Data",
            "title": "ComfyUI-Manager",
            "reference": "https://github.com/ltdrdata/ComfyUI-Manager",
            "files": [
                "https://github.com/ltdrdata/ComfyUI-Manager"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI-Manager itself is also a custom node."
        },
        {
            "author": "Dr.Lt.Data",
            "title": "ComfyUI Impact Pack",
            "reference": "https://github.com/ltdrdata/ComfyUI-Impact-Pack",
            "files": [
                "https://github.com/ltdrdata/ComfyUI-Impact-Pack"
            ],
            "pip": ["ultralytics"],
            "install_type": "git-clone",
            "description": "This extension offers various detector nodes and detailer nodes that allow you to configure a workflow that automatically enhances facial details. And provide iterative upscaler.<BR><p style='background-color: black; color: red;'>NOTE:MMDetDetectorProvider and other legacy nodes are disabled by default. If you want to activate these nodes and use them, please edit the impact-pack.ini file in the ComfyUI-Impact-Pack directory and change 'mmdet_skip = True' to 'mmdet_skip = False.' </p>"
        },
        {
            "author": "Dr.Lt.Data",
            "title": "ComfyUI Inspire Pack",
            "reference": "https://github.com/ltdrdata/ComfyUI-Inspire-Pack",
            "nodename_pattern": "Inspire$",
            "files": [
                "https://github.com/ltdrdata/ComfyUI-Inspire-Pack"
            ],
            "install_type": "git-clone",
            "description": "This extension provides various nodes to support Lora Block Weight and the Impact Pack."
        },
        {
            "author": "comfyanonymous",
            "title": "ComfyUI_experiments",
            "reference": "https://github.com/comfyanonymous/ComfyUI_experiments",
            "files": [
                "https://github.com/comfyanonymous/ComfyUI_experiments"
            ],
            "install_type": "git-clone",
            "description": "Nodes: ModelSamplerTonemapNoiseTest, TonemapNoiseWithRescaleCFG, ReferenceOnlySimple, RescaleClassifierFreeGuidanceTest, ModelMergeBlockNumber, ModelMergeSDXL, ModelMergeSDXLTransformers, ModelMergeSDXLDetailedTransformers.<p style='background-color: black; color: red;'>NOTE: This is a consolidation of the previously separate custom nodes. Please delete the sampler_tonemap.py, sampler_rescalecfg.py, advanced_model_merging.py, sdxl_model_merging.py, and reference_only.py files installed in custom_nodes before.</p>"
        },
        {
            "author": "Stability-AI",
            "title": "stability-ComfyUI-nodes",
            "reference": "https://github.com/Stability-AI/stability-ComfyUI-nodes",
            "files": [
                "https://github.com/Stability-AI/stability-ComfyUI-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: ColorBlend, ControlLoraSave, GetImageSize. NOTE: Control-LoRA recolor example uses these nodes."
        },
        {
            "author": "Fannovel16",
            "title": "ComfyUI's ControlNet Auxiliary Preprocessors",
            "reference": "https://github.com/Fannovel16/comfyui_controlnet_aux",
            "files": [
                "https://github.com/Fannovel16/comfyui_controlnet_aux"
            ],
            "install_type": "git-clone",
            "description": "This is a rework of comfyui_controlnet_preprocessors based on ControlNet auxiliary models by 🤗. I think the old repo isn't good enough to maintain. All old workflow will still be work with this repo but the version option won't do anything. Almost all v1 preprocessors are replaced by v1.1 except those doesn't appear in v1.1. <p style='background-color: black; color: red;'>NOTE: Please refrain from using the controlnet preprocessor alongside this installation, as it may lead to conflicts and prevent proper recognition.</p>"
        },
        {
            "author": "Fannovel16",
            "title": "ComfyUI Frame Interpolation",
            "reference": "https://github.com/Fannovel16/ComfyUI-Frame-Interpolation",
            "files": [
                "https://github.com/Fannovel16/ComfyUI-Frame-Interpolation"
            ],
            "install_type": "git-clone",
            "description": "Nodes: KSampler Gradually Adding More Denoise (efficient)"
        },
        {
            "author": "Fannovel16",
            "title": "ComfyUI Loopchain",
            "reference": "https://github.com/Fannovel16/ComfyUI-Loopchain",
            "files": [
                "https://github.com/Fannovel16/ComfyUI-Loopchain"
            ],
            "install_type": "git-clone",
            "description": "A collection of nodes which can be useful for animation in ComfyUI. The main focus of this extension is implementing a mechanism called loopchain. A loopchain in this case is the chain of nodes only executed repeatly in the workflow. If a node chain contains a loop node from this extension, it will become a loop chain."
        },
        {
            "author": "Fannovel16",
            "title": "ComfyUI MotionDiff",
            "reference": "https://github.com/Fannovel16/ComfyUI-MotionDiff",
            "files": [
                "https://github.com/Fannovel16/ComfyUI-MotionDiff"
            ],
            "install_type": "git-clone",
            "description": "Implementation of MDM, MotionDiffuse and ReMoDiffuse into ComfyUI."
        },
        {
            "author": "biegert",
            "title": "CLIPSeg",
            "reference": "https://github.com/biegert/ComfyUI-CLIPSeg",
            "files": [
                "https://github.com/biegert/ComfyUI-CLIPSeg/raw/main/custom_nodes/clipseg.py"
            ],
            "install_type": "copy",
            "description": "The CLIPSeg node generates a binary mask for a given input image and text prompt."
        },
        {
            "author": "BlenderNeko",
            "title": "ComfyUI Cutoff",
            "reference": "https://github.com/BlenderNeko/ComfyUI_Cutoff",
            "files": [
                "https://github.com/BlenderNeko/ComfyUI_Cutoff"
            ],
            "install_type": "git-clone",
            "description": "These custom nodes provides features that allow for better control over the effects of the text prompt."
        },
        {
            "author": "BlenderNeko",
            "title": "Advanced CLIP Text Encode",
            "reference": "https://github.com/BlenderNeko/ComfyUI_ADV_CLIP_emb",
            "files": [
                "https://github.com/BlenderNeko/ComfyUI_ADV_CLIP_emb"
            ],
            "install_type": "git-clone",
            "description": "Advanced CLIP Text Encode (if you need A1111 like prompt. you need this. But Cutoff node includes this feature, already.)"
        },
        {
            "author": "BlenderNeko",
            "title": "ComfyUI Noise",
            "reference": "https://github.com/BlenderNeko/ComfyUI_Noise",
            "files": [
                "https://github.com/BlenderNeko/ComfyUI_Noise"
            ],
            "install_type": "git-clone",
            "description": "This extension contains 6 nodes for ComfyUI that allows for more control and flexibility over the noise."
        },
        {
            "author": "BlenderNeko",
            "title": "Tiled sampling for ComfyUI",
            "reference": "https://github.com/BlenderNeko/ComfyUI_TiledKSampler",
            "files": [
                "https://github.com/BlenderNeko/ComfyUI_TiledKSampler"
            ],
            "install_type": "git-clone",
            "description": "This extension contains a tiled sampler for ComfyUI. It allows for denoising larger images by splitting it up into smaller tiles and denoising these. It tries to minimize any seams for showing up in the end result by gradually denoising all tiles one step at the time and randomizing tile positions for every step."
        },
        {
            "author": "BlenderNeko",
            "title": "SeeCoder [WIP]",
            "reference": "https://github.com/BlenderNeko/ComfyUI_SeeCoder",
            "files": [
                "https://github.com/BlenderNeko/ComfyUI_SeeCoder"
            ],
            "install_type": "git-clone",
            "description": "It provides the capability to generate CLIP from an image input, unlike unCLIP, which works in all models. (To use this extension, you need to download the required model file from <B>Install Models</B>)"
        },
        {
            "author": "jags111",
            "title": "Efficiency Nodes for ComfyUI Version 2.0+",
            "reference": "https://github.com/jags111/efficiency-nodes-comfyui",
            "files": [
                "https://github.com/jags111/efficiency-nodes-comfyui"
            ],
            "install_type": "git-clone",
            "description": "A collection of ComfyUI custom nodes to help streamline workflows and reduce total node count.<p style='background-color: black; color: red;'>NOTE: This node is originally created by LucianoCirino, but the <a href='https://github.com/LucianoCirino/efficiency-nodes-comfyui'>original repository</a> is no longer maintained and has been forked by a new maintainer. To use the forked version, you should uninstall the original version and <B>REINSTALL</B> this one.</p>"
        },
        {
            "author": "jags111",
            "title": "ComfyUI_Jags_VectorMagic",
            "reference": "https://github.com/jags111/ComfyUI_Jags_VectorMagic",
            "files": [
                "https://github.com/jags111/ComfyUI_Jags_VectorMagic"
            ],
            "install_type": "git-clone",
            "description": "a collection of nodes to explore Vector and image manipulation"
        },
        {
            "author": "Derfuu",
            "title": "Derfuu_ComfyUI_ModdedNodes",
            "reference": "https://github.com/Derfuu/Derfuu_ComfyUI_ModdedNodes",
            "files": [
                "https://github.com/Derfuu/Derfuu_ComfyUI_ModdedNodes"
            ],
            "install_type": "git-clone",
            "description": "Automate calculation depending on image sizes or something you want."
        },
        {
            "author": "paulo-coronado",
            "title": "comfy_clip_blip_node",
            "reference": "https://github.com/paulo-coronado/comfy_clip_blip_node",
            "files": [
                "https://github.com/paulo-coronado/comfy_clip_blip_node"
            ],
            "install_type": "git-clone",
            "apt_dependency": [
                "rustc",
                "cargo"
            ],
            "description": "CLIPTextEncodeBLIP: This custom node provides a CLIP Encoder that is capable of receiving images as input."
        },
        {
            "author": "Davemane42",
            "title": "Visual Area Conditioning / Latent composition",
            "reference": "https://github.com/Davemane42/ComfyUI_Dave_CustomNode",
            "files": [
                "https://github.com/Davemane42/ComfyUI_Dave_CustomNode"
            ],
            "install_type": "git-clone",
            "description": "This tool provides custom nodes that allow visualization and configuration of area conditioning and latent composite."
        },
        {
            "author": "WASasquatch",
            "title": "WAS Node Suite",
            "reference": "https://github.com/WASasquatch/was-node-suite-comfyui",
            "pip": ["numba"],
            "files": [
                "https://github.com/WASasquatch/was-node-suite-comfyui"
            ],
            "install_type": "git-clone",
            "description": "A node suite for ComfyUI with many new nodes, such as image processing, text processing, and more."
        },
        {
            "author": "WASasquatch",
            "title": "ComfyUI Preset Merger",
            "reference": "https://github.com/WASasquatch/ComfyUI_Preset_Merger",
            "files": [
                "https://github.com/WASasquatch/ComfyUI_Preset_Merger"
            ],
            "install_type": "git-clone",
            "description": "Nodes: ModelMergeByPreset. Merge checkpoint models by preset"
        },
        {
            "author": "WASasquatch",
            "title": "PPF_Noise_ComfyUI",
            "reference": "https://github.com/WASasquatch/PPF_Noise_ComfyUI",
            "files": [
                "https://github.com/WASasquatch/PPF_Noise_ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes: WAS_PFN_Latent. Perlin Power Fractal Noisey Latents"
        },
        {
            "author": "WASasquatch",
            "title": "Power Noise Suite for ComfyUI",
            "reference": "https://github.com/WASasquatch/PowerNoiseSuite",
            "files": [
                "https://github.com/WASasquatch/PowerNoiseSuite"
            ],
            "install_type": "git-clone",
            "description": "Power Noise Suite contains nodes centered around latent noise input, and diffusion, as well as latent adjustments."
        },
        {
            "author": "WASasquatch",
            "title": "FreeU_Advanced",
            "reference": "https://github.com/WASasquatch/FreeU_Advanced",
            "files": [
                "https://github.com/WASasquatch/FreeU_Advanced"
            ],
            "install_type": "git-clone",
            "description": "This custom node provides advanced settings for FreeU."
        },
        {
            "author": "WASasquatch",
            "title": "ASTERR",
            "reference": "https://github.com/WASasquatch/ASTERR",
            "files": [
                "https://github.com/WASasquatch/ASTERR"
            ],
            "install_type": "git-clone",
            "description": "Abstract Syntax Trees Evaluated Restricted Run (ASTERR) is a Python Script executor for ComfyUI. <p style='background-color: black; color: red;'>Warning:ASTERR runs Python Code from a Web Interface! It is highly recommended to run this in a closed-off environment, as it could have potential security risks.</p>"
        },
        {
            "author": "WASasquatch",
            "title": "WAS_Extras",
            "reference": "https://github.com/WASasquatch/WAS_Extras",
            "files": [
                "https://github.com/WASasquatch/WAS_Extras"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Conditioning (Blend), Inpainting VAE Encode (WAS), VividSharpen. Experimental nodes, or other random extra helper nodes."
        },
        {
            "author": "omar92",
            "title": "Quality of life Suit:V2",
            "reference": "https://github.com/omar92/ComfyUI-QualityOfLifeSuit_Omar92",
            "files": [
                "https://github.com/omar92/ComfyUI-QualityOfLifeSuit_Omar92"
            ],
            "install_type": "git-clone",
            "description": "openAI suite, String suite, Latent Tools, Image Tools: These custom nodes provide expanded functionality for image and string processing, latent processing, as well as the ability to interface with models such as ChatGPT/DallE-2."
        },
        {
            "author": "lilly1987",
            "title": "simple wildcard for ComfyUI",
            "reference": "https://github.com/lilly1987/ComfyUI_node_Lilly",
            "files": [
                "https://github.com/lilly1987/ComfyUI_node_Lilly"
            ],
            "install_type": "git-clone",
            "description": "These custom nodes provides a feature to insert arbitrary inputs through wildcards in the prompt. Additionally, this tool provides features that help simplify workflows, such as VAELoaderDecoder and SimplerSample."
        },
        {
            "author": "sylym",
            "title": "Vid2vid",
            "reference": "https://github.com/sylym/comfy_vid2vid",
            "files": [
                "https://github.com/sylym/comfy_vid2vid"
            ],
            "install_type": "git-clone",
            "description": "A node suite for ComfyUI that allows you to load image sequence and generate new image sequence with different styles or content."
        },
        {
            "author": "EllangoK",
            "title": "ComfyUI-post-processing-nodes",
            "reference": "https://github.com/EllangoK/ComfyUI-post-processing-nodes",
            "files": [
                "https://github.com/EllangoK/ComfyUI-post-processing-nodes"
            ],
            "install_type": "git-clone",
            "description": "A collection of post processing nodes for ComfyUI, simply download this repo and drag."
        },
        {
            "author": "LEv145",
            "title": "ImagesGrid",
            "reference": "https://github.com/LEv145/images-grid-comfy-plugin",
            "files": [
                "https://github.com/LEv145/images-grid-comfy-plugin"
            ],
            "install_type": "git-clone",
            "description": "This tool provides a viewer node that allows for checking multiple outputs in a grid, similar to the X/Y Plot extension."
        },
        {
            "author": "diontimmer",
            "title": "ComfyUI-Vextra-Nodes",
            "reference": "https://github.com/diontimmer/ComfyUI-Vextra-Nodes",
            "files": [
                "https://github.com/diontimmer/ComfyUI-Vextra-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Pixel Sort, Swap Color Mode, Solid Color, Glitch This, Add Text To Image, Play Sound, Prettify Prompt, Generate Noise, Flatten Colors"
        },
        {
            "author": "hnmr293",
            "title": "ComfyUI-nodes-hnmr",
            "reference": "https://github.com/hnmr293/ComfyUI-nodes-hnmr",
            "files": [
                "https://github.com/hnmr293/ComfyUI-nodes-hnmr"
            ],
            "install_type": "git-clone",
            "description": "Provide various custom nodes for Latent, Sampling, Model, Loader, Image, Text"
        },
        {
            "author": "BadCafeCode",
            "title": "Masquerade Nodes",
            "reference": "https://github.com/BadCafeCode/masquerade-nodes-comfyui",
            "files": [
                "https://github.com/BadCafeCode/masquerade-nodes-comfyui"
            ],
            "install_type": "git-clone",
            "description": "This is a node pack for ComfyUI, primarily dealing with masks."
        },
        {
            "author": "guoyk93",
            "title": "y.k.'s ComfyUI node suite",
            "reference": "https://github.com/guoyk93/yk-node-suite-comfyui",
            "files": [
                "https://github.com/guoyk93/yk-node-suite-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes: YKImagePadForOutpaint, YKMaskToImage"
        },
        {
            "author": "Jcd1230",
            "title": "Rembg Background Removal Node for ComfyUI",
            "reference": "https://github.com/Jcd1230/rembg-comfyui-node",
            "files": [
                "https://github.com/Jcd1230/rembg-comfyui-node"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Image Remove Background (rembg)"
        },
        {
            "author": "YinBailiang",
            "title": "MergeBlockWeighted_fo_ComfyUI",
            "reference": "https://github.com/YinBailiang/MergeBlockWeighted_fo_ComfyUI",
            "files": [
                "https://github.com/YinBailiang/MergeBlockWeighted_fo_ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes: MergeBlockWeighted"
        },
        {
            "author": "trojblue",
            "title": "trNodes",
            "reference": "https://github.com/trojblue/trNodes",
            "files": [
                "https://github.com/trojblue/trNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: image_layering, color_correction, model_router"
        },
        {
            "author": "szhublox",
            "title": "Auto-MBW",
            "reference": "https://github.com/szhublox/ambw_comfyui",
            "files": [
                "https://github.com/szhublox/ambw_comfyui"
            ],
            "install_type": "git-clone",
            "description": "Auto-MBW for ComfyUI loosely based on sdweb-auto-MBW. Nodes: auto merge block weighted"
        },
        {
            "author": "city96",
            "title": "ComfyUI_NetDist",
            "reference": "https://github.com/city96/ComfyUI_NetDist",
            "files": [
                "https://github.com/city96/ComfyUI_NetDist"
            ],
            "install_type": "git-clone",
            "description": "Run ComfyUI workflows on multiple local GPUs/networked machines. Nodes: Remote images, Local Remote control"
        },
        {
            "author": "city96",
            "title": "Latent-Interposer",
            "reference": "https://github.com/city96/SD-Latent-Interposer",
            "files": [
                "https://github.com/city96/SD-Latent-Interposer"
            ],
            "install_type": "git-clone",
            "description": "Custom node to convert the lantents between SDXL and SD v1.5 directly without the VAE decoding/encoding step."
	    },
        {
            "author": "city96",
            "title": "SD-Advanced-Noise",
            "reference": "https://github.com/city96/SD-Advanced-Noise",
            "files": [
                "https://github.com/city96/SD-Advanced-Noise"
            ],
            "install_type": "git-clone",
            "description": "Nodes: LatentGaussianNoise, MathEncode. An experimental custom node that generates latent noise directly by utilizing the linear characteristics of the latent space."
	    },
        {
            "author": "city96",
            "title": "SD-Latent-Upscaler",
            "reference": "https://github.com/city96/SD-Latent-Upscaler",
            "files": [
                "https://github.com/city96/SD-Latent-Upscaler"
            ],
            "pip": ["huggingface-hub"],
            "install_type": "git-clone",
            "description": "Upscaling stable diffusion latents using a small neural network."
	    },
        {
            "author": "city96",
            "title": "ComfyUI_DiT [WIP]",
            "reference": "https://github.com/city96/ComfyUI_DiT",
            "files": [
                "https://github.com/city96/ComfyUI_DiT"
            ],
            "pip": ["huggingface-hub"],
            "install_type": "git-clone",
            "description": "Testbed for <a href='https://github.com/facebookresearch/DiT' target='blank'>DiT(Scalable Diffusion Models with Transformers)</a>. <p style='background-color: black; color: red;'>None of this code is stable, expect breaking changes if for some reason you want to use this.</p>"
	    },
        {
            "author": "city96",
            "title": "ComfyUI_ColorMod",
            "reference": "https://github.com/city96/ComfyUI_ColorMod",
            "files": [
                "https://github.com/city96/ComfyUI_ColorMod"
            ],
            "install_type": "git-clone",
            "description": "This extension currently has two sets of nodes - one set for editing the contrast/color of images and another set for saving images as 16 bit PNG files."
	    },
        {
            "author": "city96",
            "title": "Extra Models for ComfyUI",
            "reference": "https://github.com/city96/ComfyUI_ExtraModels",
            "files": [
                "https://github.com/city96/ComfyUI_ExtraModels"
            ],
            "install_type": "git-clone",
            "description": "This extension aims to add support for various random image diffusion models to ComfyUI."
        },
        {
            "author": "Kaharos94",
            "title": "ComfyUI-Saveaswebp",
            "reference": "https://github.com/Kaharos94/ComfyUI-Saveaswebp",
            "files": [
                "https://github.com/Kaharos94/ComfyUI-Saveaswebp"
            ],
            "install_type": "git-clone",
            "description": "Save a picture as Webp file in Comfy + Workflow loading"
        },
        {
            "author": "SLAPaper",
            "title": "ComfyUI-Image-Selector",
            "reference": "https://github.com/SLAPaper/ComfyUI-Image-Selector",
            "files": [
                "https://github.com/SLAPaper/ComfyUI-Image-Selector"
            ],
            "install_type": "git-clone",
            "description": "A custom node for ComfyUI, which can select one or some of images from a batch."
        },
        {
            "author": "flyingshutter",
            "title": "As_ComfyUI_CustomNodes",
            "reference": "https://github.com/flyingshutter/As_ComfyUI_CustomNodes",
            "files": [
                "https://github.com/flyingshutter/As_ComfyUI_CustomNodes"
            ],
            "install_type": "git-clone",
            "description": "Manipulation nodes for Image, Latent"
        },
        {
            "author": "Zuellni",
            "title": "Zuellni/ComfyUI-Custom-Nodes",
            "reference": "https://github.com/Zuellni/ComfyUI-Custom-Nodes",
            "files": [
                "https://github.com/Zuellni/ComfyUI-Custom-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: DeepFloyd, Filter, Select, Save, Decode, Encode, Repeat, Noise, Noise"
        },
        {
            "author": "Zuellni",
            "title": "ComfyUI-ExLlama",
            "reference": "https://github.com/Zuellni/ComfyUI-ExLlama",
            "files": [
                "https://github.com/Zuellni/ComfyUI-ExLlama"
            ],
            "pip": ["sentencepiece", "https://github.com/jllllll/exllama/releases/download/0.0.17/exllama-0.0.17+cu118-cp310-cp310-win_amd64.whl"],
            "install_type": "git-clone",
            "description": "Nodes: ExLlama Loader, ExLlama Generator. <BR>Used to load 4-bit GPTQ Llama/2 models. You can find a lot of them over at <a href='https://huggingface.co/TheBloke'>https://huggingface.co/TheBloke</a><p style='background-color: black; color: red;'>NOTE: You need to manually install a pip package that suits your system. For example. If your system is 'Python3.10 + Windows + CUDA 11.8' then you need to install 'exllama-0.0.17+cu118-cp310-cp310-win_amd64.whl'. Available package files are <a href='https://github.com/jllllll/exllama/releases'>here</a>."
        },
        {
            "author": "Zuellni",
            "title": "ComfyUI PickScore Nodes",
            "reference": "https://github.com/Zuellni/ComfyUI-PickScore-Nodes",
            "files": [
                "https://github.com/Zuellni/ComfyUI-PickScore-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Image scoring nodes for ComfyUI using PickScore with a batch of images to predict which ones fit a given prompt the best."
        },
        {
            "author": "AlekPet",
            "title": "AlekPet/ComfyUI_Custom_Nodes_AlekPet",
            "reference": "https://github.com/AlekPet/ComfyUI_Custom_Nodes_AlekPet",
            "files": [
                "https://github.com/AlekPet/ComfyUI_Custom_Nodes_AlekPet"
            ],
            "install_type": "git-clone",
            "description": "Nodes: PoseNode, TranslateCLIPTextEncodeNode"
        },
        {
            "author": "pythongosssss",
            "title": "ComfyUI WD 1.4 Tagger",
            "reference": "https://github.com/pythongosssss/ComfyUI-WD14-Tagger",
            "files": [
                "https://github.com/pythongosssss/ComfyUI-WD14-Tagger"
            ],
            "install_type": "git-clone",
            "description": "A ComfyUI extension allowing the interrogation of booru tags from images."
        },
        {
            "author": "pythongosssss",
            "title": "pythongosssss/ComfyUI-Custom-Scripts",
            "reference": "https://github.com/pythongosssss/ComfyUI-Custom-Scripts",
            "files": [
                "https://github.com/pythongosssss/ComfyUI-Custom-Scripts"
            ],
            "install_type": "git-clone",
            "description": "This extension provides: Auto Arrange Graph, Workflow SVG, Favicon Status, Image Feed, Latent Upscale By, Lock Nodes & Groups, Lora Subfolders, Preset Text, Show Text, Touch Support, Link Render Mode, Locking, Node Finder, Quick Nodes, Show Image On Menu, Show Text, Workflow Managements, Custom Widget Default Values"
        },
        {
            "author": "strimmlarn",
            "title": "ComfyUI_Strimmlarns_aesthetic_score",
            "reference": "https://github.com/strimmlarn/ComfyUI_Strimmlarns_aesthetic_score",
            "js_path": "strimmlarn",
            "files": [
                "https://github.com/strimmlarn/ComfyUI_Strimmlarns_aesthetic_score"
            ],
            "install_type": "git-clone",
            "description": "Nodes: CalculateAestheticScore, LoadAesteticModel, AesthetlcScoreSorter, ScoreToNumber"
        },
        {
            "author": "tinyterra",
            "title": "tinyterraNodes",
            "reference": "https://github.com/tinyterra/ComfyUI_tinyterraNodes",
            "files": [
                "https://github.com/TinyTerra/ComfyUI_tinyterraNodes"
            ],
            "install_type": "git-clone",
            "nodename_pattern": "^ttN ",
            "description": "This extension offers various pipe nodes, fullscreen image viewer based on node history, dynamic widgets, interface customization, and more."
        },
        {
            "author": "Jordach",
            "title": "comfy-plasma",
            "reference": "https://github.com/Jordach/comfy-plasma",
            "files": [
                "https://github.com/Jordach/comfy-plasma"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Plasma Noise, Random Noise, Greyscale Noise, Pink Noise, Brown Noise, Plasma KSampler"
        },
        {
            "author": "bvhari",
            "title": "ImageProcessing",
            "reference": "https://github.com/bvhari/ComfyUI_ImageProcessing",
            "files": [
                "https://github.com/bvhari/ComfyUI_ImageProcessing"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI custom nodes to apply various image processing techniques."
        },
        {
            "author": "bvhari",
            "title": "LatentToRGB",
            "reference": "https://github.com/bvhari/ComfyUI_LatentToRGB",
            "files": [
                "https://github.com/bvhari/ComfyUI_LatentToRGB"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI custom node to convert latent to RGB."
        },
        {
            "author": "bvhari",
            "title": "ComfyUI_PerpNeg [WIP]",
            "reference": "https://github.com/bvhari/ComfyUI_PerpNeg",
            "files": [
                "https://github.com/bvhari/ComfyUI_PerpNeg"
            ],
            "install_type": "git-clone",
            "description": "Nodes: KSampler (Advanced + Perp-Neg). Implementation of <a href='https://perp-neg.github.io/' target='blank'>Perp-Neg</a><br>Includes Tonemap and CFG Rescale optionsComfyUI custom node to convert latent to RGB.<p style='background-color: black; color: red;'>WARNING: Experimental code, might have incompatibilities and edge cases.</>"
        },
        {
            "author": "bvhari",
            "title": "ComfyUI_PerpWeight",
            "reference": "https://github.com/bvhari/ComfyUI_PerpWeight",
            "files": [
                "https://github.com/bvhari/ComfyUI_PerpWeight"
            ],
            "install_type": "git-clone",
            "description": "A novel weighting scheme for token vectors from CLIP. Allows a wider range of values for the weight. Inspired by Perp-Neg."
        },
        {
            "author": "ssitu",
            "title": "UltimateSDUpscale",
            "reference": "https://github.com/ssitu/ComfyUI_UltimateSDUpscale",
            "files": [
                "https://github.com/ssitu/ComfyUI_UltimateSDUpscale"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI nodes for the Ultimate Stable Diffusion Upscale script by Coyote-A."
        },
        {
            "author": "ssitu",
            "title": "NestedNodeBuilder",
            "reference": "https://github.com/ssitu/ComfyUI_NestedNodeBuilder",
            "files": [
                "https://github.com/ssitu/ComfyUI_NestedNodeBuilder"
            ],
            "install_type": "git-clone",
            "description": "This extension provides the ability to combine multiple nodes into a single node."
        },
        {
            "author": "ssitu",
            "title": "Restart Sampling",
            "reference": "https://github.com/ssitu/ComfyUI_restart_sampling",
            "files": [
                "https://github.com/ssitu/ComfyUI_restart_sampling"
            ],
            "install_type": "git-clone",
            "description": "Unofficial ComfyUI nodes for restart sampling based on the paper 'Restart Sampling for Improving Generative Processes' <a href='https://arxiv.org/abs/2306.14878' target='blank'>[paper]</a> <a href='https://github.com/Newbeeer/diffusion_restart_sampling' target='blank'>[repo]</a>"
        },
        {
            "author": "ssitu",
            "title": "ComfyUI roop",
            "reference": "https://github.com/ssitu/ComfyUI_roop",
            "files": [
                "https://github.com/ssitu/ComfyUI_roop"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI nodes for the roop A1111 webui script."
        },
        {
            "author": "ssitu",
            "title": "ComfyUI fabric",
            "reference": "https://github.com/ssitu/ComfyUI_fabric",
            "files": [
                "https://github.com/ssitu/ComfyUI_fabric"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI nodes based on the paper '<a href='https://arxiv.org/abs/2307.10159' target='blank'/>FABRIC: Personalizing Diffusion Models with Iterative Feedback</a>' (Feedback via Attention-Based Reference Image Conditioning)"
        },
        {
            "author": "space-nuko",
            "title": "Disco Diffusion",
            "reference": "https://github.com/space-nuko/ComfyUI-Disco-Diffusion",
            "files": [
                "https://github.com/space-nuko/ComfyUI-Disco-Diffusion"
            ],
            "install_type": "git-clone",
            "description": "Modularized version of Disco Diffusion for use with ComfyUI."
        },
        {
            "author": "space-nuko",
            "title": "OpenPose Editor",
            "reference": "https://github.com/space-nuko/ComfyUI-OpenPose-Editor",
            "files": [
                "https://github.com/space-nuko/ComfyUI-OpenPose-Editor"
            ],
            "install_type": "git-clone",
            "description": "A port of the openpose-editor extension for stable-diffusion-webui. NOTE: Requires <a href='https://github.com/comfyanonymous/ComfyUI/pull/711' target='blank'>this ComfyUI patch</a> to work correctly"
        },
        {
            "author": "space-nuko",
            "title": "nui suite",
            "reference": "https://github.com/space-nuko/nui-suite",
            "files": [
                "https://github.com/space-nuko/nui-suite"
            ],
            "install_type": "git-clone",
            "description": "NODES: Dynamic Prompts Text Encode, Feeling Lucky Text Encode, Output String"
        },
        {
            "author": "Nourepide",
            "title": "Allor Plugin",
            "reference": "https://github.com/Nourepide/ComfyUI-Allor",
            "files": [
                "https://github.com/Nourepide/ComfyUI-Allor"
            ],
            "install_type": "git-clone",
            "description": "Allor is a plugin for ComfyUI with an emphasis on transparency and performance.<BR><p style='background-color: black; color: red;'>NOTE: If you do not disable the default node override feature in the settings, the built-in nodes, namely ImageScale and ImageScaleBy nodes, will be disabled. (ref: <a href='https://github.com/Nourepide/ComfyUI-Allor#configuration' target='blank'>Configutation</a>)</p>"
        },
        {
            "author": "melMass",
            "title": "MTB Nodes",
            "reference": "https://github.com/melMass/comfy_mtb",
            "files": [
                "https://github.com/melMass/comfy_mtb"
            ],
            "nodename_pattern": "\\(mtb\\)$",
            "install_type": "git-clone",
            "description": "NODES: Face Swap, Film Interpolation, Latent Lerp, Int To Number, Bounding Box, Crop, Uncrop, ImageBlur, Denoise, ImageCompare, RGV to HSV, HSV to RGB, Color Correct, Modulo, Deglaze Image, Smart Step, ..."
        },
        {
            "author": "xXAdonesXx",
            "title": "NodeGPT",
            "reference": "https://github.com/xXAdonesXx/NodeGPT",
            "files": [
                "https://github.com/xXAdonesXx/NodeGPT"
            ],
            "install_type": "git-clone",
            "description": "Implementation of AutoGen inside ComfyUI. This repository is under development, and not everything is functioning correctly yet."
        },
        {
            "author": "RockOfFire",
            "title": "ComfyUI_Comfyroll_CustomNodes",
            "reference": "https://github.com/RockOfFire/ComfyUI_Comfyroll_CustomNodes",
            "files": [
                "https://github.com/RockOfFire/ComfyUI_Comfyroll_CustomNodes"
            ],
            "install_type": "git-clone",
            "description": "Custom nodes for SDXL and SD1.5 including Multi-ControlNet, LoRA, Aspect Ratio, Process Switches, and many more nodes."
        },
        {
            "author": "RockOfFire",
            "title": "CR Animation Nodes",
            "reference": "https://github.com/RockOfFire/CR_Animation_Nodes",
            "files": [
                "https://github.com/RockOfFire/CR_Animation_Nodes"
            ],
            "install_type": "git-clone",
            "description": "A comprehensive suite of nodes to enhance your animations. These nodes include some features similar to Deforum, and also some new ideas."
        },
        {
            "author": "bmad4ever",
            "title": "ComfyUI-Bmad-DirtyUndoRedo",
            "reference": "https://github.com/bmad4ever/ComfyUI-Bmad-DirtyUndoRedo",
            "files": [
                "https://github.com/bmad4ever/ComfyUI-Bmad-DirtyUndoRedo"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI extension that adds undo (and redo) functionality."
        },
        {
            "author": "bmad4ever",
            "title": "Bmad Nodes",
            "reference": "https://github.com/bmad4ever/comfyui_bmad_nodes",
            "files": [
                "https://github.com/bmad4ever/comfyui_bmad_nodes"
            ],
            "install_type": "git-clone",
            "description": "This custom node offers the following functionalities: API support for setting up API requests, computer vision primarily for masking or collages, and general utility to streamline workflow setup or implement essential missing features."
        },
        {
            "author": "bmad4ever",
            "title": "comfyui_ab_sampler",
            "reference": "https://github.com/bmad4ever/comfyui_ab_samplercustom",
            "files": [
                "https://github.com/bmad4ever/comfyui_ab_samplercustom"
            ],
            "install_type": "git-clone",
            "description": "Experimental sampler node. Sampling alternates between A and B inputs until only one remains, starting with A. B steps run over a 2x2 grid, where 3/4's of the grid are copies of the original input latent. When the optional mask is used, the region outside the defined roi is copied from the original latent at the end of every step."
        },
        {
            "author": "FizzleDorf",
            "title": "FizzNodes",
            "reference": "https://github.com/FizzleDorf/ComfyUI_FizzNodes",
            "files": [
                "https://github.com/FizzleDorf/ComfyUI_FizzNodes"
            ],
            "install_type": "git-clone",
            "description": "Scheduled prompts, scheduled float/int values and wave function nodes for animations and utility. compatable with <a href='https://www.framesync.xyz/' target='blank'>framesync</a> and <a href='https://www.chigozie.co.uk/keyframe-string-generator/' target='blank'>keyframe-string-generator</a> for audio synced animations in Comfyui."
        },
        {
            "author": "FizzleDorf",
            "title": "ComfyUI-AIT",
            "reference": "https://github.com/FizzleDorf/ComfyUI-AIT",
            "files": [
                "https://github.com/FizzleDorf/ComfyUI-AIT"
            ],
            "install_type": "git-clone",
            "description": "A ComfyUI implementation of Facebook Meta's <a href='https://github.com/facebookincubator/AITemplate' target='blank'/>AITemplate</a> repo for faster inference using cpp/cuda. This new repo is behind the old version but is a much more stable foundation to keep AIT online. Please be patient as the repo will eventually include the same features as before.<BR>NOTE: You can find the old AIT extension in the legacy channel."
        },
        {
            "author": "filipemeneses",
            "title": "Pixelization",
            "reference": "https://github.com/filipemeneses/comfy_pixelization",
            "files": [
                "https://github.com/filipemeneses/comfy_pixelization"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI node that pixelizes images."
        },
        {
            "author": "shiimizu",
            "title": "smZNodes",
            "reference": "https://github.com/shiimizu/ComfyUI_smZNodes",
            "files": [
                "https://github.com/shiimizu/ComfyUI_smZNodes"
            ],
            "install_type": "git-clone",
            "description": "NODES: CLIP Text Encode++. Achieve identical embeddings from stable-diffusion-webui for ComfyUI."
        },
        {
            "author": "ZaneA",
            "title": "ImageReward",
            "reference": "https://github.com/ZaneA/ComfyUI-ImageReward",
            "files": [
                "https://github.com/ZaneA/ComfyUI-ImageReward"
            ],
            "install_type": "git-clone",
            "description": "NODES: ImageRewardLoader, ImageRewardScore"
        },
        {
            "author": "SeargeDP",
            "title": "SeargeSDXL",
            "reference": "https://github.com/SeargeDP/SeargeSDXL",
            "files": [
                "https://github.com/SeargeDP/SeargeSDXL"
            ],
            "install_type": "git-clone",
            "description": "Custom nodes for easier use of SDXL in ComfyUI including an img2img workflow that utilizes both the base and refiner checkpoints."
        },
        {
            "author": "cubiq",
            "title": "Simple Math",
            "reference": "https://github.com/cubiq/ComfyUI_SimpleMath",
            "files": [
                "https://github.com/cubiq/ComfyUI_SimpleMath"
            ],
            "install_type": "git-clone",
            "description": "custom node for ComfyUI to perform simple math operations"
        },
        {
            "author": "cubiq",
            "title": "ComfyUI_IPAdapter_plus",
            "reference": "https://github.com/cubiq/ComfyUI_IPAdapter_plus",
            "files": [
                "https://github.com/cubiq/ComfyUI_IPAdapter_plus"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI reference implementation for IPAdapter models. The code is mostly taken from the original IPAdapter repository and laksjdjf's implementation, all credit goes to them. I just made the extension closer to ComfyUI philosophy."
        },
        {
            "author": "shockz0rz",
            "title": "InterpolateEverything",
            "reference": "https://github.com/shockz0rz/ComfyUI_InterpolateEverything",
            "files": [
                "https://github.com/shockz0rz/ComfyUI_InterpolateEverything"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Interpolate Poses, Interpolate Lineart, ... Custom nodes for interpolating between, well, everything in the Stable Diffusion ComfyUI."
        },
        {
            "author": "yolanother",
            "title": "Comfy UI Prompt Agent",
            "reference": "https://github.com/yolanother/DTAIComfyPromptAgent",
            "files": [
                "https://github.com/yolanother/DTAIComfyPromptAgent"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Prompt Agent, Prompt Agent (String). This script provides a prompt agent node for the Comfy UI stable diffusion client."
        },
        {
            "author": "yolanother",
            "title": "Image to Text Node",
            "reference": "https://github.com/yolanother/DTAIImageToTextNode",
            "files": [
                "https://github.com/yolanother/DTAIImageToTextNode"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Image URL to Text, Image to Text."
        },
        {
            "author": "yolanother",
            "title": "Comfy UI Online Loaders",
            "reference": "https://github.com/yolanother/DTAIComfyLoaders",
            "files": [
                "https://github.com/yolanother/DTAIComfyLoaders"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Submit Image (Parameters), Submit Image. A collection of loaders that use a shared common online data source rather than relying on the files to be present locally."
        },
        {
            "author": "yolanother",
            "title": "Comfy AI DoubTech.ai Image Sumission Node",
            "reference": "https://github.com/yolanother/DTAIComfyImageSubmit",
            "files": [
                "https://github.com/yolanother/DTAIComfyImageSubmit"
            ],
            "install_type": "git-clone",
            "description": "A ComfyAI submit node to upload images to DoubTech.ai"
        },
        {
            "author": "yolanother",
            "title": "Comfy UI QR Codes",
            "reference": "https://github.com/yolanother/DTAIComfyQRCodes",
            "files": [
                "https://github.com/yolanother/DTAIComfyQRCodes"
            ],
            "install_type": "git-clone",
            "description": "This extension introduces QR code nodes for the Comfy UI stable diffusion client. NOTE: ComfyUI qrcode extension required."
        },
        {
            "author": "yolanother",
            "title": "Variables for Comfy UI",
            "reference": "https://github.com/yolanother/DTAIComfyVariables",
            "files": [
                "https://github.com/yolanother/DTAIComfyVariables"
            ],
            "install_type": "git-clone",
            "description": "Nodes: String, Int, Float, Short String, CLIP Text Encode (With Variables), String Format, Short String Format. This extension introduces quality of life improvements by providing variable nodes and shared global variables."
        },
        {
            "author": "sipherxyz",
            "title": "comfyui-art-venture",
            "reference": "https://github.com/sipherxyz/comfyui-art-venture",
            "files": [
                "https://github.com/sipherxyz/comfyui-art-venture"
            ],
            "install_type": "git-clone",
            "description": "Nodes: ImagesConcat, LoadImageFromUrl, AV_UploadImage"
        },
        {
            "author": "SOELexicon",
            "title": "LexMSDBNodes",
            "reference": "https://github.com/SOELexicon/ComfyUI-LexMSDBNodes",
            "files": [
                "https://github.com/SOELexicon/ComfyUI-LexMSDBNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: MSSqlTableNode, MSSqlSelectNode. This extension provides custom nodes to interact with MSSQL."
        },
        {
            "author": "pants007",
            "title": "pants",
            "reference": "https://github.com/pants007/comfy-pants",
            "files": [
                "https://github.com/pants007/comfy-pants"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Make Square Node, Interrogate Node, TextEncodeAIO"
        },
        {
            "author": "evanspearman",
            "title": "ComfyMath",
            "reference": "https://github.com/evanspearman/ComfyMath",
            "files": [
                "https://github.com/evanspearman/ComfyMath"
            ],
            "install_type": "git-clone",
            "description": "Provides Math Nodes for ComfyUI. Boolean Logic, Integer Arithmetic, Floating Point Arithmetic and Functions, Vec2, Vec3, and Vec4 Arithmetic and Functions"
        },
        {
            "author": "civitai",
            "title": "comfy-nodes",
            "reference": "https://github.com/civitai/comfy-nodes",
            "files": [
                "https://github.com/civitai/comfy-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: CivitAI_Loaders. Load Checkpoints, and LORA models directly from CivitAI API."
        },
        {
            "author": "andersxa",
            "title": "CLIP Directional Prompt Attention",
            "reference": "https://github.com/andersxa/comfyui-PromptAttention",
            "files": [
                "https://github.com/andersxa/comfyui-PromptAttention"
            ],
            "pip": ["scikit-learn", "matplotlib"],
            "install_type": "git-clone",
            "description": "Nodes: CLIP Directional Prompt Attention Encode. Direction prompt attention tries to solve the problem of contextual words (or parts of the prompt) having an effect on much later or irrelevant parts of the prompt."
        },
        {
            "author": "ArtVentureX",
            "title": "AnimateDiff",
            "reference": "https://github.com/ArtVentureX/comfyui-animatediff",
            "pip": ["flash_attn"],
            "files": [
                "https://github.com/ArtVentureX/comfyui-animatediff"
            ],
            "install_type": "git-clone",
            "description": "AnimateDiff integration for ComfyUI, adapts from sd-webui-animatediff.<br><p style='background-color: black; color: red;'>You only need to download one of <a href='https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v14.ckpt' target='blank'>mm_sd_v14.ckpt</a> | <a href='https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15.ckpt' target='blank'>mm_sd_v15.ckpt</a>. Put the model weights under <font color='white'>ComfyUI/custom_nodes/comfyui-animatediff/models</font>. DO NOT change model filename.</p>"
        },
        {
            "author": "twri",
            "title": "SDXL Prompt Styler",
            "reference": "https://github.com/twri/sdxl_prompt_styler",
            "files": [
                "https://github.com/twri/sdxl_prompt_styler"
            ],
            "install_type": "git-clone",
            "description": "SDXL Prompt Styler is a node that enables you to style prompts based on predefined templates stored in a JSON file."
        },
        {
            "author": "wolfden",
            "title": "SDXL Prompt Styler (customized version by wolfden)",
            "reference": "https://github.com/wolfden/ComfyUi_PromptStylers",
            "files": [
                "https://github.com/wolfden/ComfyUi_PromptStylers"
            ],
            "install_type": "git-clone",
            "description": "These custom nodes provide a variety of customized prompt stylers based on <a href='https://github.com/twri/sdxl_prompt_styler' target='blank'>twri/SDXL Prompt Styler</a>."
        },
        {
            "author": "wolfden",
            "title": "ComfyUi_String_Function_Tree",
            "reference": "https://github.com/wolfden/ComfyUi_String_Function_Tree",
            "files": [
                "https://github.com/wolfden/ComfyUi_String_Function_Tree"
            ],
            "install_type": "git-clone",
            "description": "This custom node provides the capability to manipulate multiple string inputs."
        },
        {
            "author": "daxthin",
            "title": "facedetailer",
            "reference": "https://github.com/daxthin/facedetailer",
            "files": [
                "https://github.com/daxthin/facedetailer"
            ],
            "install_type": "git-clone",
            "description": "Face Detailer is a custom node for the 'ComfyUI' framework inspired by !After Detailer extension from auto1111, it allows you to detect faces using Mediapipe and YOLOv8n to create masks for the detected faces."
        },
        {
            "author": "asagi4",
            "title": "ComfyUI prompt control",
            "reference": "https://github.com/asagi4/comfyui-prompt-control",
            "files": [
                "https://github.com/asagi4/comfyui-prompt-control"
            ],
            "install_type": "git-clone",
            "description": "Nodes for convenient prompt editing. The aim is to make basic generations in ComfyUI completely prompt-controllable."
        },
        {
            "author": "jamesWalker55",
            "title": "ComfyUI - P2LDGAN Node",
            "reference": "https://github.com/jamesWalker55/comfyui-p2ldgan",
            "files": [
                "https://github.com/jamesWalker55/comfyui-p2ldgan"
            ],
            "install_type": "git-clone",
            "description": "Nodes: P2LDGAN. This integrates P2LDGAN into ComfyUI. P2LDGAN extracts lineart from input images.<BR><p style='background-color: black; color: red;'>To use this extension, you need to download the <a href='https://drive.google.com/file/d/1To4V_Btc3QhCLBWZ0PdSNgC1cbm3isHP' target='blank'>p2ldgan model</a> and save it in the <font color='white'>ComfyUI/custom_nodes/comfyui-p2ldgan/checkpoints</font> directory.</p>"
        },
        {
            "author": "jamesWalker55",
            "title": "Various ComfyUI Nodes by Type",
            "reference": "https://github.com/jamesWalker55/comfyui-various",
            "files": [
                "https://github.com/jamesWalker55/comfyui-various"
            ],
            "nodename_pattern": "^JW",
            "install_type": "git-clone",
            "description": "Nodes: JWInteger, JWFloat, JWString, JWImageLoadRGB, JWImageResize, ..."
        },
        {
            "author": "adieyal",
            "title": "DynamicPrompts Custom Nodes",
            "reference": "https://github.com/adieyal/comfyui-dynamicprompts",
            "files": [
                "https://github.com/adieyal/comfyui-dynamicprompts"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Random Prompts, Combinatorial Prompts, I'm Feeling Lucky, Magic Prompt, Jinja2 Templates. ComfyUI-DynamicPrompts is a custom nodes library that integrates into your existing ComfyUI Library. It provides nodes that enable the use of Dynamic Prompts in your ComfyUI."
        },
        {
            "author": "mihaiiancu",
            "title": "mihaiiancu/Inpaint",
            "reference": "https://github.com/mihaiiancu/ComfyUI_Inpaint",
            "files": [
                "https://github.com/mihaiiancu/ComfyUI_Inpaint"
            ],
            "install_type": "git-clone",
            "description": "Nodes: InpaintMediapipe. This node provides a simple interface to inpaint."
        },
        {
            "author": "kwaroran",
            "title": "abg-comfyui",
            "reference": "https://github.com/kwaroran/abg-comfyui",
            "files": [
                "https://github.com/kwaroran/abg-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Remove Image Background (abg). A Anime Background Remover node for comfyui, based on this hf space, works same as AGB extention in automatic1111."
        },
        {
            "author": "bash-j",
            "title": "Mikey Nodes",
            "reference": "https://github.com/bash-j/mikey_nodes",
            "files": [
                "https://github.com/bash-j/mikey_nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Prompt With Style, Prompt With SDXL, Resize Image for SDXL, Save Image With Prompt Data, HaldCLUT, Empty Latent Ratio Select/Custom SDXL"
        },
        {
            "author": "failfa.st",
            "title": "failfast-comfyui-extensions",
            "reference": "https://github.com/failfa-st/failfast-comfyui-extensions",
            "files": [
                "https://github.com/failfa-st/failfast-comfyui-extensions"
            ],
            "install_type": "git-clone",
            "description": "node color customization, custom colors, dot reroutes, link rendering options, straight lines, group freezing, node pinning, automated arrangement of nodes, copy image"
        },
        {
            "author": "Pfaeff",
            "title": "pfaeff-comfyui",
            "reference": "https://github.com/Pfaeff/pfaeff-comfyui",
            "files": [
                "https://github.com/Pfaeff/pfaeff-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes: AstropulsePixelDetector, BackgroundRemover, ImagePadForBetterOutpaint, InpaintingPipelineLoader, Inpainting, ..."
        },
        {
            "author": "wallish77",
            "title": "wlsh_nodes",
            "reference": "https://github.com/wallish77/wlsh_nodes",
            "files": [
                "https://github.com/wallish77/wlsh_nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Checkpoint Loader with Name, Save Prompt Info, Outpaint to Image, CLIP Positive-Negative, SDXL Quick Empty Latent, Empty Latent by Ratio, Time String, SDXL Steps, SDXL Resolutions ..."
        },
        {
            "author": "Kosinkadink",
            "title": "ComfyUI-Advanced-ControlNet",
            "reference": "https://github.com/Kosinkadink/ComfyUI-Advanced-ControlNet",
            "files": [
                "https://github.com/Kosinkadink/ComfyUI-Advanced-ControlNet"
            ],
            "install_type": "git-clone",
            "description": "Nodes: ControlNetLoaderAdvanced, DiffControlNetLoaderAdvanced, ScaledSoftControlNetWeights, SoftControlNetWeights, CustomControlNetWeights, SoftT2IAdapterWeights, CustomT2IAdapterWeights"
        },
        {
            "author": "Kosinkadink",
            "title": "AnimateDiff Evolved",
            "reference": "https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved",
            "files": [
                "https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved"
            ],
            "install_type": "git-clone",
            "description": "A forked repository that actively maintains <a href='https://github.com/ArtVentureX/comfyui-animatediff' target='blank'>AnimateDiff</a>, created by ArtVentureX.<BR><BR>Improved AnimateDiff integration for ComfyUI, adapts from sd-webui-animatediff.<br><p style='background-color: black; color: red;'>Download one or more motion models from <a href='https://huggingface.co/guoyww/animatediff/tree/main' target='blank'>Original Models</a> | <a href='https://huggingface.co/manshoety/AD_Stabilized_Motion/tree/main' target='blank'>Finetuned Models</a>. See README for additional model links and usage. Put the model weights under <font color='white'>ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved/models</font>. You are free to rename the models, but keeping original names will ease use when sharing your workflow.</p>"
        },
        {
            "author": "Kosinkadink",
            "title": "ComfyUI-VideoHelperSuite",
            "reference": "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite",
            "files": [
                "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite"
            ],
            "install_type": "git-clone",
            "description": "Nodes: VHS_VideoCombine. Nodes related to video workflows"
        },
        {
            "author": "Gourieff",
            "title": "ReActor Node for ComfyUI",
            "reference": "https://github.com/Gourieff/comfyui-reactor-node",
            "files": [
                "https://github.com/Gourieff/comfyui-reactor-node"
            ],
            "install_type": "git-clone",
            "description": "The Fast and Simple 'roop-like' Face Swap Extension Node for ComfyUI, based on ReActor (ex Roop-GE) SD-WebUI Face Swap Extension"
        },
        {
            "author": "imb101",
            "title": "FaceSwap",
            "reference": "https://github.com/imb101/ComfyUI-FaceSwap",
            "files": [
                "https://github.com/imb101/ComfyUI-FaceSwap"
            ],
            "install_type": "git-clone",
            "description": "Nodes:FaceSwapNode. Very basic custom node to enable face swapping in ComfyUI. (roop)"
        },
        {
            "author": "Chaoses-Ib",
            "title": "ComfyUI_Ib_CustomNodes",
            "reference": "https://github.com/Chaoses-Ib/ComfyUI_Ib_CustomNodes",
            "files": [
                "https://github.com/Chaoses-Ib/ComfyUI_Ib_CustomNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: LoadImageFromPath. Load Image From Path loads the image from the source path and does not have such problems."
        },
        {
            "author": "AIrjen",
            "title": "One Button Prompt",
            "reference": "https://github.com/AIrjen/OneButtonPrompt",
            "files": [
                "https://github.com/AIrjen/OneButtonPrompt"
            ],
            "install_type": "git-clone",
            "description": "One Button Prompt has a prompt generation node for beginners who have problems writing a good prompt, or advanced users who want to get inspired. It generates an entire prompt from scratch. It is random, but controlled. You simply load up the script and press generate, and let it surprise you."
        },
        {
            "author": "coreyryanhanson",
            "title": "ComfyQR",
            "reference": "https://github.com/coreyryanhanson/ComfyQR",
            "files": [
                "https://github.com/coreyryanhanson/ComfyQR"
            ],
            "install_type": "git-clone",
            "description": "QR generation within ComfyUI. Contains nodes suitable for workflows from generating basic QR images to techniques with advanced QR masking."
        },
        {
            "author": "coreyryanhanson",
            "title": "ComfyQR-scanning-nodes",
            "reference": "https://github.com/coreyryanhanson/ComfyQR-scanning-nodes",
            "files": [
                "https://github.com/coreyryanhanson/ComfyQR-scanning-nodes"
            ],
            "install_type": "git-clone",
            "description": "A set of ComfyUI nodes to quickly test generated QR codes for scannability. A companion project to ComfyQR."
        },
        {
            "author": "dimtoneff",
            "title": "ComfyUI PixelArt Detector",
            "reference": "https://github.com/dimtoneff/ComfyUI-PixelArt-Detector",
            "files": [
                "https://github.com/dimtoneff/ComfyUI-PixelArt-Detector"
            ],
            "install_type": "git-clone",
            "description": "This node manipulates the pixel art image in ways that it should look pixel perfect (downscales, changes palette, upscales etc.)."
        },
        {
            "author": "dimtoneff",
            "title": "Eagle PNGInfo",
            "reference": "https://github.com/hylarucoder/ComfyUI-Eagle-PNGInfo",
            "files": [
                "https://github.com/hylarucoder/ComfyUI-Eagle-PNGInfo"
            ],
            "install_type": "git-clone",
            "description": "Nodes: EagleImageNode"
        },
        {
            "author": "theUpsider",
            "title": "Styles CSV Loader Extension for ComfyUI",
            "reference": "https://github.com/theUpsider/ComfyUI-Styles_CSV_Loader",
            "files": [
                "https://github.com/theUpsider/ComfyUI-Styles_CSV_Loader"
            ],
            "install_type": "git-clone",
            "description": "This extension allows users to load styles from a CSV file, primarily for migration purposes from the automatic1111 Stable Diffusion web UI."
        },
        {
            "author": "M1kep",
            "title": "Comfy_KepListStuff",
            "reference": "https://github.com/M1kep/Comfy_KepListStuff",
            "files": [
                "https://github.com/M1kep/Comfy_KepListStuff"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Range(Step), Range(Num Steps), List Length, Image Overlay, Stack Images, Empty Images, Join Image Lists, Join Float Lists. This extension provides various list manipulation nodes"
        },
        {
            "author": "M1kep",
            "title": "ComfyLiterals",
            "reference": "https://github.com/M1kep/ComfyLiterals",
            "files": [
                "https://github.com/M1kep/ComfyLiterals"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Int, Float, String, Operation, Checkpoint"
        },
        {
            "author": "M1kep",
            "title": "KepPromptLang",
            "reference": "https://github.com/M1kep/KepPromptLang",
            "files": [
                "https://github.com/M1kep/KepPromptLang"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Build Gif, Special CLIP Loader. It offers various manipulation capabilities for the internal operations of the prompt."
        },
        {
            "author": "M1kep",
            "title": "Comfy_KepMatteAnything",
            "reference": "https://github.com/M1kep/Comfy_KepMatteAnything",
            "files": [
                "https://github.com/M1kep/Comfy_KepMatteAnything"
            ],
            "install_type": "git-clone",
            "description": "This extension provides a custom node that allows the use of <a href='https://github.com/hustvl/Matte-Anything' target='blank'>Matte Anything</a> in ComfyUI."
        },
        {
            "author": "M1kep",
            "title": "Comfy_KepKitchenSink",
            "reference": "https://github.com/M1kep/Comfy_KepKitchenSink",
            "files": [
                "https://github.com/M1kep/Comfy_KepKitchenSink"
            ],
            "install_type": "git-clone",
            "description": "Nodes: KepRotateImage"
        },
        {
            "author": "M1kep",
            "title": "ComfyUI-OtherVAEs",
            "reference": "https://github.com/M1kep/ComfyUI-OtherVAEs",
            "files": [
                "https://github.com/M1kep/ComfyUI-OtherVAEs"
            ],
            "install_type": "git-clone",
            "description": "Nodes: TAESD VAE Decode"
        },
        {
            "author": "M1kep",
            "title": "ComfyUI-KepOpenAI",
            "reference": "https://github.com/M1kep/ComfyUI-KepOpenAI",
            "files": [
                "https://github.com/M1kep/ComfyUI-KepOpenAI"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI-KepOpenAI is a user-friendly node that serves as an interface to the GPT-4 with Vision (GPT-4V) API. This integration facilitates the processing of images coupled with text prompts, leveraging the capabilities of the OpenAI API to generate text completions that are contextually relevant to the provided inputs."
        },
        {
            "author": "uarefans",
            "title": "ComfyUI-Fans",
            "reference": "https://github.com/uarefans/ComfyUI-Fans",
            "files": [
                "https://github.com/uarefans/ComfyUI-Fans"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Fans Styler (Max 10 Style), Fans Text Concat (Until 10 text)."
        },
        {
            "author": "NicholasMcCarthy",
            "title": "ComfyUI_TravelSuite",
            "reference": "https://github.com/NicholasMcCarthy/ComfyUI_TravelSuite",
            "files": [
                "https://github.com/NicholasMcCarthy/ComfyUI_TravelSuite"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI custom nodes to apply various latent travel techniques."
        },
        {
            "author": "ManglerFTW",
            "title": "ComfyI2I",
            "reference": "https://github.com/ManglerFTW/ComfyI2I",
            "files": [
                "https://github.com/ManglerFTW/ComfyI2I"
            ],
            "install_type": "git-clone",
            "description": "A set of custom nodes to perform image 2 image functions in ComfyUI."
        },
        {
            "author": "theUpsider",
            "title": "ComfyUI-Logic",
            "reference": "https://github.com/theUpsider/ComfyUI-Logic",
            "files": [
                "https://github.com/theUpsider/ComfyUI-Logic"
            ],
            "install_type": "git-clone",
            "description": "An extension to ComfyUI that introduces logic nodes and conditional rendering capabilities."
        },
        {
            "author": "mpiquero7164",
            "title": "SaveImgPrompt",
            "reference": "https://github.com/mpiquero7164/ComfyUI-SaveImgPrompt",
            "files": [
                "https://github.com/mpiquero7164/ComfyUI-SaveImgPrompt"
            ],
            "install_type": "git-clone",
            "description": "Save a png or jpeg and option to save prompt/workflow in a text or json file for each image in Comfy + Workflow loading."
        },
        {
            "author": "m-sokes",
            "title": "ComfyUI Sokes Nodes",
            "reference": "https://github.com/m-sokes/ComfyUI-Sokes-Nodes",
            "files": [
                "https://github.com/m-sokes/ComfyUI-Sokes-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Empty Latent Randomizer (9 Inputs)"
        },
        {
            "author": "Extraltodeus",
            "title": "noise latent perlinpinpin",
            "reference": "https://github.com/Extraltodeus/noise_latent_perlinpinpin",
            "files": [
                "https://github.com/Extraltodeus/noise_latent_perlinpinpin"
            ],
            "install_type": "git-clone",
            "description": "Nodes: NoisyLatentPerlin. This allows to create latent spaces filled with perlin-based noise that can actually be used by the samplers."
        },
        {
            "author": "JPS",
            "title": "JPS Custom Nodes for ComfyUI",
            "reference": "https://github.com/JPS-GER/ComfyUI_JPS-Nodes",
            "files": [
                "https://github.com/JPS-GER/ComfyUI_JPS-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: SDXL - Resolutions, SDXL - Basic Settings, SDXL - Additional Settings, Math - Resolution Multiply, Math - Largest Integer, Switch - TXT2IMG & IMG2IMG"
        },
        {
            "author": "hustille",
            "title": "hus' utils for ComfyUI",
            "reference": "https://github.com/hustille/ComfyUI_hus_utils",
            "files": [
                "https://github.com/hustille/ComfyUI_hus_utils"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI nodes primarily for seed and filename generation"
        },
        {
            "author": "hustille",
            "title": "ComfyUI_Fooocus_KSampler",
            "reference": "https://github.com/hustille/ComfyUI_Fooocus_KSampler",
            "files": [
                "https://github.com/hustille/ComfyUI_Fooocus_KSampler"
            ],
            "install_type": "git-clone",
            "description": "Nodes: KSampler With Refiner (Fooocus). The KSampler from <a href='https://github.com/lllyasviel/Fooocus' target='blank'>Fooocus</a> as a ComfyUI node <p style='background-color: black; color: red;'>NOTE: This patches basic ComfyUI behaviour - don't use together with other samplers. Or perhaps do? Other samplers might profit from those changes ... ymmv.</p>"
        },
        {
            "author": "badjeff",
            "title": "LoRA Tag Loader for ComfyUI",
            "reference": "https://github.com/badjeff/comfyui_lora_tag_loader",
            "files": [
                "https://github.com/badjeff/comfyui_lora_tag_loader"
            ],
            "install_type": "git-clone",
            "description": "A ComfyUI custom node to read LoRA tag(s) from text and load it into checkpoint model."
        },
        {
            "author": "rgthree",
            "title": "rgthree's ComfyUi Nodes",
            "reference": "https://github.com/rgthree/rgthree-comfy",
            "files": [
                "https://github.com/rgthree/rgthree-comfy"
            ],
            "nodename_pattern": " \\(rgthree\\)$",
            "install_type": "git-clone",
            "description": "Nodes: Seed, Reroute, Context, Lora Loader Stack, Context Switch, Fast Muter. These custom nodes helps organize the building of complex workflows."
        },
        {
            "author": "AIGODLIKE",
            "title": "AIGODLIKE-COMFYUI-TRANSLATION",
            "reference": "https://github.com/AIGODLIKE/AIGODLIKE-COMFYUI-TRANSLATION",
            "files": [
                "https://github.com/AIGODLIKE/AIGODLIKE-COMFYUI-TRANSLATION"
            ],
            "install_type": "git-clone",
            "description": "It provides language settings. (Contribution from users of various languages is needed due to the support for each language.)"
        },
        {
            "author": "syllebra",
            "title": "BilboX's ComfyUI Custom Nodes",
            "reference": "https://github.com/syllebra/bilbox-comfyui",
            "files": [
                "https://github.com/syllebra/bilbox-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes: BilboX's PromptGeek Photo Prompt. This provides a convenient way to compose photorealistic prompts into ComfyUI."
        },
        {
            "author": "Girish Gopaul",
            "title": "Save Image with Generation Metadata",
            "reference": "https://github.com/giriss/comfy-image-saver",
            "files": [
                "https://github.com/giriss/comfy-image-saver"
            ],
            "install_type": "git-clone",
            "description": "All the tools you need to save images with their generation metadata on ComfyUI. Compatible with Civitai & Prompthero geninfo auto-detection. Works with png, jpeg and webp."
        },
        {
            "author": "shingo1228",
            "title": "ComfyUI-send-Eagle(slim)",
            "reference": "https://github.com/shingo1228/ComfyUI-send-eagle-slim",
            "files": [
                "https://github.com/shingo1228/ComfyUI-send-eagle-slim"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Send Webp Image to Eagle. This is an extension node for ComfyUI that allows you to send generated images in webp format to Eagle. This extension node is a re-implementation of the Eagle linkage functions of the previous ComfyUI-send-Eagle node, focusing on the functions required for this node."
        },
        {
            "author": "shingo1228",
            "title": "ComfyUI-SDXL-EmptyLatentImage",
            "reference": "https://github.com/shingo1228/ComfyUI-SDXL-EmptyLatentImage",
            "files": [
                "https://github.com/shingo1228/ComfyUI-SDXL-EmptyLatentImage"
            ],
            "install_type": "git-clone",
            "description": "Nodes:SDXL Empty Latent Image. An extension node for ComfyUI that allows you to select a resolution from the pre-defined json files and output a Latent Image."
        },
        {
            "author": "laksjdjf",
            "title": "IPAdapter-ComfyUI",
            "reference": "https://github.com/laksjdjf/IPAdapter-ComfyUI",
            "files": [
                "https://github.com/laksjdjf/IPAdapter-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Load IPAdapter. This custom nodes provides loader of the IP-Adapter model.<p style='background-color: black; color: red;'>NOTE: To use this extension node, you need to download the <a href='https://huggingface.co/h94/IP-Adapter/resolve/main/models/ip-adapter_sd15.bin' target='blank'>ip-adapter_sd15.bin</a> file and place it in the <font color='white'><B>custom_nodes/IPAdapter-ComfyUI/models</B></font> directory. Additionally, you need to download the 'Clip vision model' from the 'Install models' menu as well.</P>"
        },
        {
            "author": "laksjdjf",
            "title": "pfg-ComfyUI",
            "reference": "https://github.com/laksjdjf/pfg-ComfyUI",
            "files": [
                "https://github.com/laksjdjf/pfg-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI version of https://github.com/laksjdjf/pfg-webui. (To use this extension, you need to download the required model file from <B>Install Models</B>)"
        },
        {
            "author": "laksjdjf",
            "title": "attention-couple-ComfyUI",
            "reference": "https://github.com/laksjdjf/attention-couple-ComfyUI",
            "files": [
                "https://github.com/laksjdjf/attention-couple-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Attention couple. This is a custom node that manipulates region-specific prompts. While vanilla ComfyUI employs an area specification method based on latent couples, this node divides regions using attention layers within UNet."
        },
        {
            "author": "laksjdjf",
            "title": "cd-tuner_negpip-ComfyUI",
            "reference": "https://github.com/laksjdjf/cd-tuner_negpip-ComfyUI",
            "files": [
                "https://github.com/laksjdjf/cd-tuner_negpip-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Apply CDTuner, Apply Negapip. This extension provides the <a href='https://github.com/hako-mikan/sd-webui-cd-tuner' target='blank'>CD(Color/Detail) Tuner</a> and the <a href='https://github.com/hako-mikan/sd-webui-negpip' target='blank'>Negative Prompt in the Prompt</a>features."
        },
        {
            "author": "laksjdjf",
            "title": "LoRA-Merger-ComfyUI",
            "reference": "https://github.com/laksjdjf/LoRA-Merger-ComfyUI",
            "files": [
                "https://github.com/laksjdjf/LoRA-Merger-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Load LoRA Weight Only, Load LoRA from Weight, Merge LoRA, Save LoRA. This extension provides nodes for merging LoRA."
        },
        {
            "author": "laksjdjf",
            "title": "LCMSampler-ComfyUI",
            "reference": "https://github.com/laksjdjf/LCMSampler-ComfyUI",
            "files": [
                "https://github.com/laksjdjf/LCMSampler-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "This extension node is intended for the use of LCM conversion for SSD-1B-anime. It does not guarantee operation with the original LCM (as it cannot load weights in the current version). To take advantage of fast generation with LCM, a node for using TAESD as a decoder is also provided. This is inspired by ComfyUI-OtherVAEs."
        },
        {
            "author": "alsritter",
            "title": "asymmetric-tiling-comfyui",
            "reference": "https://github.com/alsritter/asymmetric-tiling-comfyui",
            "files": [
                "https://github.com/alsritter/asymmetric-tiling-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Asymmetric_Tiling_KSampler. "
        },
        {
            "author": "meap158",
            "title": "GPU temperature protection",
            "reference": "https://github.com/meap158/ComfyUI-GPU-temperature-protection",
            "files": [
                "https://github.com/meap158/ComfyUI-GPU-temperature-protection"
            ],
            "install_type": "git-clone",
            "description": "Pause image generation when GPU temperature exceeds threshold."
        },
        {
            "author": "meap158",
            "title": "ComfyUI-Prompt-Expansion",
            "reference": "https://github.com/meap158/ComfyUI-Prompt-Expansion",
            "files": [
                "https://github.com/meap158/ComfyUI-Prompt-Expansion"
            ],
            "install_type": "git-clone",
            "description": "Dynamic prompt expansion, powered by GPT-2 locally on your device."
        },
        {
            "author": "TeaCrab",
            "title": "ComfyUI-TeaNodes",
            "reference": "https://github.com/TeaCrab/ComfyUI-TeaNodes",
            "files": [
                "https://github.com/TeaCrab/ComfyUI-TeaNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes:TC_EqualizeCLAHE, TC_SizeApproximation, TC_ImageResize, TC_ImageScale, TC_ColorFill."
        },
        {
            "author": "nagolinc",
            "title": "ComfyUI_FastVAEDecorder_SDXL",
            "reference": "https://github.com/nagolinc/ComfyUI_FastVAEDecorder_SDXL",
            "files": [
                "https://github.com/nagolinc/ComfyUI_FastVAEDecorder_SDXL"
            ],
            "install_type": "git-clone",
            "description": "Based off of: <a href='https://github.com/Birch-san/diffusers-play/tree/main/approx_vae'>Birch-san/diffusers-play/approx_vae</a>. This ComfyUI node allows you to quickly preview SDXL 1.0 latents."
        },
        {
            "author": "bradsec",
            "title": "ResolutionSelector for ComfyUI",
            "reference": "https://github.com/bradsec/ComfyUI_ResolutionSelector",
            "files": [
                "https://github.com/bradsec/ComfyUI_ResolutionSelector"
            ],
            "install_type": "git-clone",
            "description": "Nodes:ResolutionSelector"
        },
        {
            "author": "kohya-ss",
            "title": "ControlNet-LLLite-ComfyUI",
            "reference": "https://github.com/kohya-ss/ControlNet-LLLite-ComfyUI",
            "files": [
                "https://github.com/kohya-ss/ControlNet-LLLite-ComfyUI"
            ],
            "install_type": "git-clone",
            "description": "Nodes: LLLiteLoader"
        },
        {
            "author": "jjkramhoeft",
            "title": "ComfyUI-Jjk-Nodes",
            "reference": "https://github.com/jjkramhoeft/ComfyUI-Jjk-Nodes",
            "files": [
                "https://github.com/jjkramhoeft/ComfyUI-Jjk-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: SDXLRecommendedImageSize, JjkText, JjkShowText, JjkConcat. A set of custom nodes for ComfyUI - focused on text and parameter utility"
        },
        {
            "author": "dagthomas",
            "title": "SDXL Auto Prompter",
            "reference": "https://github.com/dagthomas/comfyui_dagthomas",
            "files": [
                "https://github.com/dagthomas/comfyui_dagthomas"
            ],
            "install_type": "git-clone",
            "description": "Easy prompting for generation of endless random art pieces and photographs!"
        },
        {
            "author": "marhensa",
            "title": "Recommended Resolution Calculator",
            "reference": "https://github.com/marhensa/sdxl-recommended-res-calc",
            "files": [
                "https://github.com/marhensa/sdxl-recommended-res-calc"
            ],
            "install_type": "git-clone",
            "description": "Input your desired output final resolution, it will automaticaly set the initial recommended SDXL ratio/size and its Upscale Factor to reach that output final resolution, also there's an option for 2x/4x reverse Upscale Factor. These all to avoid using bad/arbitary initial ratio/resolution."
        },
        {
            "author": "Nuked",
            "title": "ComfyUI-N-Nodes",
            "reference": "https://github.com/Nuked88/ComfyUI-N-Nodes",
            "files": [
                "https://github.com/Nuked88/ComfyUI-N-Nodes"
            ],
            "install_type": "git-clone",
            "description": "A suite of custom nodes for ConfyUI that includes GPT text-prompt generation, LoadVideo,SaveVideo,LoadFramesFromFolder and FrameInterpolator"
        },
        {
            "author": "Extraltodeus",
            "title": "LoadLoraWithTags",
            "reference": "https://github.com/Extraltodeus/LoadLoraWithTags",
            "files": [
                "https://github.com/Extraltodeus/LoadLoraWithTags"
            ],
            "install_type": "git-clone",
            "description": "Nodes:LoadLoraWithTags. Save/Load trigger words for loras from a json and auto fetch them on civitai if they are missing."
        },
        {
            "author": "richinsley",
            "title": "Comfy-LFO",
            "reference": "https://github.com/richinsley/Comfy-LFO",
            "files": [
                "https://github.com/richinsley/Comfy-LFO"
            ],
            "install_type": "git-clone",
            "description": "Nodes:LFO_Triangle, LFO_Sine, SawtoothNode, SquareNode, PulseNode. ComfyUI custom nodes to create Low Frequency Oscillators."
        },
        {
            "author": "Beinsezii",
            "title": "bsz-cui-extras",
            "reference": "https://github.com/Beinsezii/bsz-cui-extras",
            "files": [
                "https://github.com/Beinsezii/bsz-cui-extras"
            ],
            "install_type": "git-clone",
            "description": "This contains all-in-one 'principled' nodes for T2I, I2I, refining, and scaling. Additionally it has many tools for directly manipulating the color of latents, high res fix math, and scripted image post-processing."
        },
        {
            "author": "youyegit",
            "title": "tdxh_node_comfyui",
            "reference": "https://github.com/youyegit/tdxh_node_comfyui",
            "files": [
                "https://github.com/youyegit/tdxh_node_comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes:TdxhImageToSize, TdxhImageToSizeAdvanced, TdxhLoraLoader, TdxhIntInput, TdxhFloatInput, TdxhStringInput. Some nodes for stable diffusion comfyui. Sometimes it helps conveniently to use less nodes for doing the same things."
        },
        {
            "author": "Sxela",
            "title": "ComfyWarp",
            "reference": "https://github.com/Sxela/ComfyWarp",
            "files": [
                "https://github.com/Sxela/ComfyWarp"
            ],
            "install_type": "git-clone",
            "description": "Nodes:LoadFrameSequence, LoadFrame"
        },
        {
            "author": "skfoo",
            "title": "ComfyUI-Coziness",
            "reference": "https://github.com/skfoo/ComfyUI-Coziness",
            "files": [
                "https://github.com/skfoo/ComfyUI-Coziness"
            ],
            "install_type": "git-clone",
            "description": "Nodes:MultiLora Loader, Lora Text Extractor. Provides a node for assisting in loading loras through text."
        },
        {
            "author": "YOUR-WORST-TACO",
            "title": "ComfyUI-TacoNodes",
            "reference": "https://github.com/YOUR-WORST-TACO/ComfyUI-TacoNodes",
            "files": [
                "https://github.com/YOUR-WORST-TACO/ComfyUI-TacoNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes:TacoLatent, TacoAnimatedLoader, TacoImg2ImgAnimatedLoader, TacoGifMaker."
        },
        {
            "author": "Lerc",
            "title": "Canvas Tab",
            "reference": "https://github.com/Lerc/canvas_tab",
            "files": [
                "https://github.com/Lerc/canvas_tab"
            ],
            "install_type": "git-clone",
            "description": "This extension provides a full page image editor with mask support. There are two nodes, one to receive images from the editor and one to send images to the editor."
        },
        {
            "author": "Ttl",
            "title": "ComfyUI Neural network latent upscale custom node",
            "reference": "https://github.com/Ttl/ComfyUi_NNLatentUpscale",
            "files": [
                "https://github.com/Ttl/ComfyUi_NNLatentUpscale"
            ],
            "install_type": "git-clone",
            "description": "A custom ComfyUI node designed for rapid latent upscaling using a compact neural network, eliminating the need for VAE-based decoding and encoding."
        },
        {
            "author": "spro",
            "title": "Latent Mirror node for ComfyUI",
            "reference": "https://github.com/spro/comfyui-mirror",
            "files": [
                "https://github.com/spro/comfyui-mirror"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Latent Mirror. Node to mirror a latent along the Y (vertical / left to right) or X (horizontal / top to bottom) axis."
        },
        {
            "author": "Tropfchen",
            "title": "Embedding Picker",
            "reference": "https://github.com/Tropfchen/ComfyUI-Embedding_Picker",
            "files": [
                "https://github.com/Tropfchen/ComfyUI-Embedding_Picker"
            ],
            "install_type": "git-clone",
            "description": "Tired of forgetting and misspelling often weird names of embeddings you use? Or perhaps you use only one, cause you forgot you have tens of them installed?"
        },
        {
            "author": "Acly",
            "title": "ComfyUI Nodes for External Tooling",
            "reference": "https://github.com/Acly/comfyui-tooling-nodes",
            "files": [
                "https://github.com/Acly/comfyui-tooling-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Load Image (Base64), Load Mask (Base64), Send Image (WebSocket), Crop Image, Apply Mask to Image. Provides nodes geared towards using ComfyUI as a backend for external tools."
        },
        {
            "author": "picturesonpictures",
            "title": "comfy_PoP",
            "reference": "https://github.com/picturesonpictures/comfy_PoP",
            "files": ["https://github.com/picturesonpictures/comfy_PoP"],
            "install_type": "git-clone",
            "description": "A collection of custom nodes for ComfyUI. Includes a quick canny edge detection node with unconventional settings, simple LoRA stack nodes for workflow efficiency, and a customizable aspect ratio node."
        },
        {
            "author": "Dream Project",
            "title": "Dream Project Animation Nodes",
            "reference": "https://github.com/alt-key-project/comfyui-dream-project",
            "files": [
                "https://github.com/alt-key-project/comfyui-dream-project"
            ],
            "install_type": "git-clone",
            "description": "This extension offers various nodes that are useful for Deforum-like animations in ComfyUI."
        },
        {
            "author": "seanlynch",
            "title": "ComfyUI Optical Flow",
            "reference": "https://github.com/seanlynch/comfyui-optical-flow",
            "files": [
                "https://github.com/seanlynch/comfyui-optical-flow"
            ],
            "install_type": "git-clone",
            "description": "This package contains three nodes to help you compute optical flow between pairs of images, usually adjacent frames in a video, visualize the flow, and apply the flow to another image of the same dimensions. Most of the code is from Deforum, so this is released under the same license (MIT)."
        },
        {
            "author": "ealkanat",
            "title": "ComfyUI Easy Padding",
            "reference": "https://github.com/ealkanat/comfyui_easy_padding",
            "files": [
                "https://github.com/ealkanat/comfyui_easy_padding"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI Easy Padding is a simple custom ComfyUI node that helps you to add padding to images on ComfyUI."
        },
        {
            "author": "ArtBot2023",
            "title": "Character Face Swap",
            "reference": "https://github.com/ArtBot2023/CharacterFaceSwap",
            "files": [
                "https://github.com/ArtBot2023/CharacterFaceSwap"
            ],
            "install_type": "git-clone",
            "description": "Character face swap with LoRA and embeddings."
        },
        {
            "author": "mav-rik",
            "title": "Facerestore CF (Code Former)",
            "reference": "https://github.com/mav-rik/facerestore_cf",
            "files": [
                "https://github.com/mav-rik/facerestore_cf"
            ],
            "install_type": "git-clone",
            "description": "This is a copy of <a href='https://civitai.com/models/24690/comfyui-facerestore-node' target='blank'>facerestore custom node</a> with a bit of a change to support CodeFormer Fidelity parameter. These ComfyUI nodes can be used to restore faces in images similar to the face restore option in AUTOMATIC1111 webui.<BR>NOTE: To use this node, you need to download the face restoration model and face detection model from the 'Install models' menu."
        },
        {
            "author": "braintacles",
            "title": "braintacles-nodes",
            "reference": "https://github.com/braintacles/braintacles-comfyui-nodes",
            "files": [
                "https://github.com/braintacles/braintacles-comfyui-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: CLIPTextEncodeSDXL-Multi-IO, CLIPTextEncodeSDXL-Pipe, Empty Latent Image from Aspect-Ratio, Random Find and Replace."
        },
        {
            "author": "hayden-fr",
            "title": "ComfyUI-Model-Manager",
            "reference": "https://github.com/hayden-fr/ComfyUI-Model-Manager",
            "files": [
                "https://github.com/hayden-fr/ComfyUI-Model-Manager"
            ],
            "install_type": "git-clone",
            "description": "Manage models: browsing, download and delete."
        },
        {
            "author": "hayden-fr",
            "title": "ComfyUI-Image-Browsing",
            "reference": "https://github.com/hayden-fr/ComfyUI-Image-Browsing",
            "files": [
                "https://github.com/hayden-fr/ComfyUI-Image-Browsing"
            ],
            "install_type": "git-clone",
            "description": "Image Browsing: browsing, download and delete."
        },
        {
            "author": "ali1234",
            "title": "comfyui-job-iterator",
            "reference": "https://github.com/ali1234/comfyui-job-iterator",
            "files": [
                "https://github.com/ali1234/comfyui-job-iterator"
            ],
            "install_type": "git-clone",
            "description": "Implements iteration over sequences within a single workflow run. <p style='background-color: black; color: red;'>NOTE: This node replaces the execution of ComfyUI for iterative processing functionality.</p>"
        },
        {
            "author": "jmkl",
            "title": "ComfyUI Ricing",
            "reference": "https://github.com/jmkl/ComfyUI-ricing",
            "files": [
                "https://github.com/jmkl/ComfyUI-ricing"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI custom user.css and some script stuff. mainly for web interface."
        },
        {
            "author": "budihartono",
            "title": "Otonx's Custom Nodes",
            "reference": "https://github.com/budihartono/comfyui_otonx_nodes",
            "files": [
                "https://github.com/budihartono/comfyui_otonx_nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: OTX Multiple Values, OTX KSampler Feeder. This extension provides custom nodes for ComfyUI created for personal projects. Made available for reference. Nodes may be updated or changed intermittently or not at all. Review & test before use."
        },
        {
            "author": "ramyma",
            "title": "A8R8 ComfyUI Nodes",
            "reference": "https://github.com/ramyma/A8R8_ComfyUI_nodes",
            "files": [
                "https://github.com/ramyma/A8R8_ComfyUI_nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Base64Image Input Node, Base64Image Output Node. <a href='https://github.com/ramyma/a8r8' target='blank'>A8R8</a> supporting nodes to integrate with ComfyUI"
        },
        {
            "author": "spinagon",
            "title": "Seamless tiling Node for ComfyUI",
            "reference": "https://github.com/spinagon/ComfyUI-seamless-tiling",
            "files": [
                "https://github.com/spinagon/ComfyUI-seamless-tiling"
            ],
            "install_type": "git-clone",
            "description": "Node for generating almost seamless textures, based on similar setting from A1111."
        },
        {
            "author": "BiffMunky",
            "title": "Endless ️🌊✨ Nodes",
            "reference": "https://github.com/tusharbhutt/Endless-Nodes",
            "files": [
                "https://github.com/tusharbhutt/Endless-Nodes"
            ],
            "install_type": "git-clone",
            "description": "A small set of nodes I created for various numerical and text inputs.  Features image saver with ability to have JSON saved to separate folder, parameter collection nodes, two aesthetic scoring models, switches for text and numbers, and conversion of string to numeric and vice versa."
        },
        {
            "author": "spacepxl",
            "title": "ComfyUI-HQ-Image-Save",
            "reference": "https://github.com/spacepxl/ComfyUI-HQ-Image-Save",
            "files": [
                "https://github.com/spacepxl/ComfyUI-HQ-Image-Save"
            ],
            "install_type": "git-clone",
            "description": "Add Image Save nodes for TIFF 16 bit and EXR 32 bit formats. Probably only useful if you're applying a LUT or other color corrections, and care about preserving as much color accuracy as possible."
        },
        {
            "author": "PTA",
            "title": "auto nodes layout",
            "reference": "https://github.com/phineas-pta/comfyui-auto-nodes-layout",
            "files": [
                "https://github.com/phineas-pta/comfyui-auto-nodes-layout"
            ],
            "install_type": "git-clone",
            "description": "A ComfyUI extension to apply better nodes layout algorithm to ComfyUI workflow (mostly for visualization purpose)"
        },
        {
            "author": "receyuki",
            "title": "comfyui-prompt-reader-node",
            "reference": "https://github.com/receyuki/comfyui-prompt-reader-node",
            "files": [
                "https://github.com/receyuki/comfyui-prompt-reader-node"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI node version of the SD Prompt Reader."
        },
        {
            "author": "rklaffehn",
            "title": "rk-comfy-nodes",
            "reference": "https://github.com/rklaffehn/rk-comfy-nodes",
            "files": [
                "https://github.com/rklaffehn/rk-comfy-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: RK_CivitAIMetaChecker, RK_CivitAIAddHashes."
        },
        {
            "author": "cubiq",
            "title": "ComfyUI Essentials",
            "reference": "https://github.com/cubiq/ComfyUI_essentials",
            "files": [
                "https://github.com/cubiq/ComfyUI_essentials"
            ],
            "install_type": "git-clone",
            "description": "Essential nodes that are weirdly missing from ComfyUI core. With few exceptions they are new features and not commodities. I hope this will be just a temporary repository until the nodes get included into ComfyUI."
        },
        {
            "author": "Clybius",
            "title": "ComfyUI-Latent-Modifiers",
            "reference": "https://github.com/Clybius/ComfyUI-Latent-Modifiers",
            "files": [
                "https://github.com/Clybius/ComfyUI-Latent-Modifiers"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Latent Diffusion Mega Modifier. ComfyUI nodes which modify the latent during the diffusion process. (Sharpness, Tonemap, Rescale, Extra Noise)"
        },
        {
            "author": "mcmonkeyprojects",
            "title": "Stable Diffusion Dynamic Thresholding (CFG Scale Fix)",
            "reference": "https://github.com/mcmonkeyprojects/sd-dynamic-thresholding",
            "files": [
                "https://github.com/mcmonkeyprojects/sd-dynamic-thresholding"
            ],
            "install_type": "git-clone",
            "description": "Extension for StableSwarmUI, ComfyUI, and AUTOMATIC1111 Stable Diffusion WebUI that enables a way to use higher CFG Scales without color issues. This works by clamping latents between steps."
        },
        {
            "author": "Tropfchen",
            "title": "YARS: Yet Another Resolution Selector",
            "reference": "https://github.com/Tropfchen/ComfyUI-yaResolutionSelector",
            "files": [
                "https://github.com/Tropfchen/ComfyUI-yaResolutionSelector"
            ],
            "install_type": "git-clone",
            "description": "A slightly different Resolution Selector node, allowing to freely change base resolution and aspect ratio, with options to maintain the pixel count or use the base resolution as the highest or lowest dimension."
        },
        {
            "author": "chrisgoringe",
            "title": "Variation seeds",
            "reference": "https://github.com/chrisgoringe/cg-noise",
            "files": [
                "https://github.com/chrisgoringe/cg-noise"
            ],
            "install_type": "git-clone",
            "description": "Adds KSampler custom nodes with variation seed and variation strength."
        },
        {
            "author": "chrisgoringe",
            "title": "Image chooser",
            "reference": "https://github.com/chrisgoringe/cg-image-picker",
            "files": [
                "https://github.com/chrisgoringe/cg-image-picker"
            ],
            "install_type": "git-clone",
            "description": "A custom node that pauses the flow while you choose which image (or latent) to pass on to the rest of the workflow."
        },
        {
            "author": "chrisgoringe",
            "title": "Use Everywhere (UE Nodes)",
            "reference": "https://github.com/chrisgoringe/cg-use-everywhere",
            "files": [
                "https://github.com/chrisgoringe/cg-use-everywhere"
            ],
            "install_type": "git-clone",
            "nodename_pattern": "^(UE\\? |UE )",
            "description": "A set of nodes that allow data to be 'broadcast' to some or all unconnected inputs. Greatly reduces link spaghetti."
        },
        {
            "author": "chrisgoringe",
            "title": "Prompt Info",
            "reference": "https://github.com/chrisgoringe/cg-prompt-info",
            "files": [
                "https://github.com/chrisgoringe/cg-prompt-info"
            ],
            "install_type": "git-clone",
            "description": "Prompt Info"
        },
        {
            "author": "TGu-97",
            "title": "TGu Utilities",
            "reference": "https://github.com/TGu-97/ComfyUI-TGu-utils",
            "files": [
                "https://github.com/TGu-97/ComfyUI-TGu-utils"
            ],
            "install_type": "git-clone",
            "description": "Nodes: MPN Switch, MPN Reroute, PN Switch. This is a set of custom nodes for ComfyUI. Mainly focus on control switches."
        },
        {
            "author": "seanlynch",
            "title": "SRL's nodes",
            "reference": "https://github.com/seanlynch/srl-nodes",
            "files": [
                "https://github.com/seanlynch/srl-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: SRL Conditional Interrupt, SRL Format String, SRL Eval, SRL Filter Image List. This is a collection of nodes I find useful. Note that at least one module allows execution of arbitrary code. Do not use any of these nodes on a system that allow untrusted users to control workflows or inputs.<p style='background-color: black; color: red;'>WARNING: The custom nodes in this extension are vulnerable to <B>security risks</B> because they allow the execution of arbitrary code through the workflow</>"
        },
        {
            "author": "alpertunga-bile",
            "title": "prompt-generator",
            "reference": "https://github.com/alpertunga-bile/prompt-generator-comfyui",
            "files": [
                "https://github.com/alpertunga-bile/prompt-generator-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Custom AI prompt generator node for ComfyUI."
        },
        {
            "author": "mlinmg",
            "title": "LaMa Preprocessor [WIP]",
            "reference": "https://github.com/mlinmg/ComfyUI-LaMA-Preprocessor",
            "files": [
                "https://github.com/mlinmg/ComfyUI-LaMA-Preprocessor"
            ],
            "install_type": "git-clone",
            "description": "A LaMa prerocessor for ComfyUI. This preprocessor finally enable users to generate coherent inpaint and outpaint prompt-free. The best results are given on landscapes, not so much in drawings/animation."
        },
        {
            "author": "azazeal04",
            "title": "ComfyUI-Styles",
            "reference": "https://github.com/azazeal04/ComfyUI-Styles",
            "files": [
                "https://github.com/azazeal04/ComfyUI-Styles"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Anime_Styler, Fantasy_Styler, Gothic_Styler, Line_Art_Styler, Movie_Poster_Styler, Punk_Styler, Travel_Poster_Styler. This extension offers 8 art style nodes, each of which includes approximately 50 individual style variations."
        },
        {
            "author": "kijai",
            "title": "KJNodes for ComfyUI",
            "reference": "https://github.com/kijai/ComfyUI-KJNodes",
            "files": [
                "https://github.com/kijai/ComfyUI-KJNodes"
            ],
            "install_type": "git-clone",
            "description": "Various quality of life -nodes for ComfyUI, mostly just visual stuff to improve usability."
        },
        {
            "author": "hhhzzyang",
            "title": "Comfyui-Lama",
            "reference": "https://github.com/hhhzzyang/Comfyui_Lama",
            "files": [
                "https://github.com/hhhzzyang/Comfyui_Lama"
            ],
            "install_type": "git-clone",
            "description": "Nodes: LamaaModelLoad, LamaApply, YamlConfigLoader. a costumer node is realized to remove anything/inpainting anything from a picture by mask inpainting.<p style='background-color: black; color: red;'>WARN:This extension includes the entire model, which can result in a very long initial installation time, and there may be some compatibility issues with older dependencies and ComfyUI.</p>"
        },
        {
            "author": "thedyze",
            "title": "Save Image Extended for ComfyUI",
            "reference": "https://github.com/thedyze/save-image-extended-comfyui",
            "files": [
                "https://github.com/thedyze/save-image-extended-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Customize the information saved in file- and folder names. Use the values of sampler parameters as part of file or folder names. Save your positive & negative prompt as entries in a JSON (text) file, in each folder."
        },
        {
            "author": "SOELexicon",
            "title": "ComfyUI-LexTools",
            "reference": "https://github.com/SOELexicon/ComfyUI-LexTools",
            "files": [
                "https://github.com/SOELexicon/ComfyUI-LexTools"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI-LexTools is a Python-based image processing and analysis toolkit that uses machine learning models for semantic image segmentation, image scoring, and image captioning."
        },
        {
            "author": "mikkel",
            "title": "ComfyUI - Text Overlay Plugin",
            "reference": "https://github.com/mikkel/ComfyUI-text-overlay",
            "files": [
                "https://github.com/mikkel/ComfyUI-text-overlay"
            ],
            "install_type": "git-clone",
            "description": "The ComfyUI Text Overlay Plugin provides functionalities for superimposing text on images. Users can select different font types, set text size, choose color, and adjust the text's position on the image."
        },
        {
            "author": "avatechai",
            "title": "avatar-graph-comfyui",
            "reference": "https://github.com/avatechai/avatar-graph-comfyui",
            "files": [
                "https://github.com/avatechai/avatar-graph-comfyui"
            ],
            "install_type": "git-clone",
            "description": "A custom nodes module for creating real-time interactive avatars powered by blender bpy mesh api + Avatech Shape Flow runtime."
        },
        {
            "author": "TRI3D-LC",
            "title": "tri3d-comfyui-nodes",
            "reference": "https://github.com/TRI3D-LC/tri3d-comfyui-nodes",
            "files": [
                "https://github.com/TRI3D-LC/tri3d-comfyui-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: tri3d-extract-hand, tri3d-fuzzification, tri3d-position-hands, tri3d-atr-parse."
        },
        {
            "author": "storyicon",
            "title": "segment anything",
            "reference": "https://github.com/storyicon/comfyui_segment_anything",
            "files": [
                "https://github.com/storyicon/comfyui_segment_anything"
            ],
            "install_type": "git-clone",
            "description": "Based on GroundingDino and SAM, use semantic strings to segment any element in an image. The comfyui version of sd-webui-segment-anything."
        },
        {
            "author": "a1lazydog",
            "title": "ComfyUI-AudioScheduler",
            "reference": "https://github.com/a1lazydog/ComfyUI-AudioScheduler",
            "files": [
                "https://github.com/a1lazydog/ComfyUI-AudioScheduler"
            ],
            "install_type": "git-clone",
            "description": "Load mp3 files and use the audio nodes to power animations and prompt scheduling. Use with FizzNodes."
        },
        {
            "author": "whatbirdisthat",
            "title": "cyberdolphin",
            "reference": "https://github.com/whatbirdisthat/cyberdolphin",
            "files": [
                "https://github.com/whatbirdisthat/cyberdolphin"
            ],
            "install_type": "git-clone",
            "description": "Cyberdolphin Suite of ComfyUI nodes for wiring up things."
        },
        {
            "author": "chrish-slingshot",
            "title": "CrasH Utils",
            "reference": "https://github.com/chrish-slingshot/CrasHUtils",
            "files": [
                "https://github.com/chrish-slingshot/CrasHUtils"
            ],
            "install_type": "git-clone",
            "description": "A mixture of effects and quality of life nodes. Nodes: ImageGlitcher (gives an image a cool glitchy effect), ColorStylizer (highlights a single color in an image), QueryLocalLLM (queries a local LLM API though oobabooga), SDXLReslution (resolution picker for the standard SDXL resolutions, the complete list), SDXLResolutionSplit (splits the SDXL resolution into width and height). "
        },
        {
            "author": "spinagon",
            "title": "ComfyUI-seam-carving",
            "reference": "https://github.com/spinagon/ComfyUI-seam-carving",
            "files": [
                "https://github.com/spinagon/ComfyUI-seam-carving"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Image Resize (seam carving). Seam carving (image resize) for ComfyUI. Based on <a href='https://github.com/li-plus/seam-carving' target='blank'>https://github.com/li-plus/seam-carving</a>. With seam carving algorithm, the image could be intelligently resized while keeping the important contents undistorted. The carving process could be further guided, so that an object could be removed from the image without apparent artifacts."
        },
        {
            "author": "YMC",
            "title": "ymc-node-suite-comfyui",
            "reference": "https://github.com/YMC-GitHub/ymc-node-suite-comfyui",
            "files": [
                "https://github.com/YMC-GitHub/ymc-node-suite-comfyui"
            ],
            "install_type": "git-clone",
            "description": "ymc 's nodes for comfyui. This extension is composed of nodes that provide various utility features such as text, region, and I/O."
        },
        {
            "author": "chibiace",
            "title": "ComfyUI-Chibi-Nodes",
            "reference": "https://github.com/chibiace/ComfyUI-Chibi-Nodes",
            "files": [
                "https://github.com/chibiace/ComfyUI-Chibi-Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Loader, Prompts, ImageTool, Wildcards, LoadEmbedding, ConditionText, SaveImages, ..."
        },
        {
            "author": "DigitalIO",
            "title": "ComfyUI-stable-wildcards",
            "reference": "https://github.com/DigitalIO/ComfyUI-stable-wildcards",
            "files": [
                "https://github.com/DigitalIO/ComfyUI-stable-wildcards"
            ],
            "install_type": "git-clone",
            "description": "Wildcard implementation that can be reproduced with workflows."
        },
        {
            "author": "THtianhao",
            "title": "ComfyUI-Portrait-Maker",
            "reference": "https://github.com/THtianhao/ComfyUI-Portrait-Maker",
            "files": [
                "https://github.com/THtianhao/ComfyUI-Portrait-Maker"
            ],
            "install_type": "git-clone",
            "description": "Nodes:RetainFace, FaceFusion, RatioMerge2Image, MaskMerge2Image, ReplaceBoxImg, ExpandMaskBox, FaceSkin, SkinRetouching, PortraitEnhancement, ..."
        },
        {
            "author": "THtianhao",
            "title": "ComfyUI-FaceChain",
            "reference": "https://github.com/THtianhao/ComfyUI-FaceChain",
            "files": [
                "https://github.com/THtianhao/ComfyUI-FaceChain"
            ],
            "install_type": "git-clone",
            "description": "Nodes:FC_LoraMerge."
        },
        {
            "author": "zer0TF",
            "title": "Cute Comfy",
            "reference": "https://github.com/zer0TF/cute-comfy",
            "files": [
                "https://github.com/zer0TF/cute-comfy"
            ],
            "install_type": "git-clone",
            "description": "Adds a configurable folder watcher that auto-converts Comfy metadata into a Civitai-friendly format for automatic resource tagging when you upload images. Oh, and it makes your UI awesome, too. 💜"
        },
        {
            "author": "chflame163",
            "title": "ComfyUI_MSSpeech_TTS",
            "reference": "https://github.com/chflame163/ComfyUI_MSSpeech_TTS",
            "files": [
                "https://github.com/chflame163/ComfyUI_MSSpeech_TTS"
            ],
            "install_type": "git-clone",
            "description": "A text-to-speech plugin used under ComfyUI. It utilizes the Microsoft Speech TTS interface to convert text content into MP3 format audio files."
        },
        {
            "author": "drustan-hawk",
            "title": "primitive-types",
            "reference": "https://github.com/drustan-hawk/primitive-types",
            "files": [
                "https://github.com/drustan-hawk/primitive-types"
            ],
            "install_type": "git-clone",
            "description": "A text-to-speech plugin used under ComfyUI. It utilizes the Microsoft Speech TTS interface to convert text content into MP3 format audio files."
        },
        {
            "author": "shadowcz007",
            "title": "comfyui-mixlab-nodes [WIP]",
            "reference": "https://github.com/shadowcz007/comfyui-mixlab-nodes",
            "files": [
                "https://github.com/shadowcz007/comfyui-mixlab-nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: RandomPrompt, TransparentImage, LoadImageFromPath, Splitting a long image into sections, ImagesCrop, Consistency Decoder Loader, Consistency Decoder Decode"
        },
        {
            "author": "ostris",
            "title": "Ostris Nodes ComfyUI",
            "reference": "https://github.com/ostris/ostris_nodes_comfyui",
            "files": [
                "https://github.com/ostris/ostris_nodes_comfyui"
            ],
            "install_type": "git-clone",
            "nodename_pattern": "- Ostris$",
            "description": "This is a collection of custom nodes for ComfyUI that I made for some QOL. I will be adding much more advanced ones in the future once I get more familiar with the API."
        },
        {
            "author": "0xbitches",
            "title": "Latent Consistency Model for ComfyUI",
            "reference": "https://github.com/0xbitches/ComfyUI-LCM",
            "files": [
                "https://github.com/0xbitches/ComfyUI-LCM"
            ],
            "install_type": "git-clone",
            "description": "This custom node implements a Latent Consistency Model sampler in ComfyUI. (LCM)"
        },
        {
            "author": "aszc-dev",
            "title": "Core ML Suite for ComfyUI",
            "reference": "https://github.com/aszc-dev/ComfyUI-CoreMLSuite",
            "files": [
                "https://github.com/aszc-dev/ComfyUI-CoreMLSuite"
            ],
            "install_type": "git-clone",
            "description": "This extension contains a set of custom nodes for ComfyUI that allow you to use Core ML models in your ComfyUI workflows. The models can be obtained here, or you can convert your own models using coremltools. The main motivation behind using Core ML models in ComfyUI is to allow you to utilize the ANE (Apple Neural Engine) on Apple Silicon (M1/M2) machines to improve performance."
        },
        {
            "author": "taabata",
            "title": "Syrian Falcon Nodes",
            "reference": "https://github.com/taabata/Comfy_Syrian_Falcon_Nodes",
            "files": [
                "https://github.com/taabata/Comfy_Syrian_Falcon_Nodes/raw/main/SyrianFalconNodes.py"
            ],
            "install_type": "copy",
            "description": "Nodes:Prompt editing, Word as Image"
        },
        {
            "author": "taabata",
            "title": "LCM_Inpaint-Outpaint_Comfy",
            "reference": "https://github.com/taabata/LCM_Inpaint-Outpaint_Comfy",
            "files": [
                "https://github.com/taabata/LCM_Inpaint-Outpaint_Comfy"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI custom nodes for inpainting/outpainting using the new latent consistency model (LCM)"
        },
        {
            "author": "noxinias",
            "title": "ComfyUI_NoxinNodes",
            "reference": "https://github.com/noxinias/ComfyUI_NoxinNodes",
            "files": [
                "https://github.com/noxinias/ComfyUI_NoxinNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Noxin Complete Chime, Noxin Scaled Resolutions, Load from Noxin Prompt Library, Save to Noxin Prompt Library"
        },
        {
            "author": "apesplat",
            "title": "ezXY scripts and nodes",
            "reference": "https://github.com/GMapeSplat/ComfyUI_ezXY",
            "files": [
                "https://github.com/GMapeSplat/ComfyUI_ezXY"
            ],
            "install_type": "git-clone",
            "description": "Extensions/Patches: Enables linking float and integer inputs and ouputs. Values are automatically cast to the correct type and clamped to the correct range. Works with both builtin and custom nodes.<p style='background-color: black; color: red;'>NOTE: This repo patches ComfyUI's validate_inputs and map_node_over_list functions while running. May break depending on your version of ComfyUI. Can be deactivated in config.yaml.</p>Nodes: A collection of nodes for facilitating the generation of XY plots. Capable of plotting changes over most primitive values."
        },
        {
            "author": "kinfolk0117",
            "title": "SimpleTiles",
            "reference": "https://github.com/kinfolk0117/ComfyUI_SimpleTiles",
            "files": [
                "https://github.com/kinfolk0117/ComfyUI_SimpleTiles"
            ],
            "install_type": "git-clone",
            "description": "Nodes:TileSplit, TileMerge."
        },
        {
            "author": "kinfolk0117",
            "title": "ComfyUI_GradientDeepShrink",
            "reference": "https://github.com/kinfolk0117/ComfyUI_GradientDeepShrink",
            "files": [
                "https://github.com/kinfolk0117/ComfyUI_GradientDeepShrink"
            ],
            "install_type": "git-clone",
            "description": "Nodes:GradientPatchModelAddDownscale (Kohya Deep Shrink)."
        },
        {
            "author": "kinfolk0117",
            "title": "TiledIPAdapter",
            "reference": "https://github.com/kinfolk0117/ComfyUI_TiledIPAdapter",
            "files": [
                "https://github.com/kinfolk0117/ComfyUI_TiledIPAdapter"
            ],
            "install_type": "git-clone",
            "description": "Proof of concent on how to use IPAdapter to control tiled upscaling. NOTE: You need to have 'ComfyUI_IPAdapter_plus' installed."
        },
        {
            "author": "Fictiverse",
            "title": "ComfyUI Fictiverse Nodes",
            "reference": "https://github.com/Fictiverse/ComfyUI_Fictiverse",
            "files": [
                "https://github.com/Fictiverse/ComfyUI_Fictiverse"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Color correction."
        },
        {
            "author": "idrirap",
            "title": "ComfyUI-Lora-Auto-Trigger-Words",
            "reference": "https://github.com/idrirap/ComfyUI-Lora-Auto-Trigger-Words",
            "files": [
                "https://github.com/idrirap/ComfyUI-Lora-Auto-Trigger-Words"
            ],
            "install_type": "git-clone",
            "description": "This project is a fork of <a href='https://github.com/Extraltodeus/LoadLoraWithTags'>https://github.com/Extraltodeus/LoadLoraWithTags</a> The aim of these custom nodes is to get an easy access to the tags used to trigger a lora."
        },
        {
            "author": "aianimation55",
            "title": "Comfy UI FatLabels",
            "reference": "https://github.com/aianimation55/ComfyUI-FatLabels",
            "files": [
                "https://github.com/aianimation55/ComfyUI-FatLabels"
            ],
            "install_type": "git-clone",
            "description": "It's a super simple custom node for Comfy UI, to generate text, with a font size option. Useful for bigger labelling of nodes, helpful for wider screen captures or tutorials. Plus you can of course use the text within your generations."
        },
        {
            "author": "noEmbryo",
            "title": "noEmbryo nodes",
            "reference": "https://github.com/noembryo/ComfyUI-noEmbryo",
            "files": [
                "https://github.com/noembryo/ComfyUI-noEmbryo"
            ],
            "install_type": "git-clone",
            "description": "PromptTermList (1-6): are some nodes that help with the creation of Prompts inside ComfyUI. Resolution Scale outputs image dimensions using a scale factor. Regex Text Chopper outputs the chopped parts of a text using RegEx."
        },
        {
            "author": "mikkel",
            "title": "ComfyUI - Mask Bounding Box",
            "reference": "https://github.com/mikkel/comfyui-mask-boundingbox",
            "files": [
                "https://github.com/mikkel/comfyui-mask-boundingbox"
            ],
            "install_type": "git-clone",
            "description": "The ComfyUI Mask Bounding Box Plugin provides functionalities for selecting a specific size mask from an image. Can be combined with ClipSEG to replace any aspect of an SDXL image with an SD1.5 output."
        },
        {
            "author": "ParmanBabra",
            "title": "ComfyUI-Malefish-Custom-Scripts",
            "reference": "https://github.com/ParmanBabra/ComfyUI-Malefish-Custom-Scripts",
            "files": [
                "https://github.com/ParmanBabra/ComfyUI-Malefish-Custom-Scripts"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Multi Lora Loader, Random (Prompt), Combine (Prompt), CSV Prompts Loader"
        },
        {
            "author": "IAmMatan.com",
            "title": "ComfyUI Serving toolkit",
            "reference": "https://github.com/matan1905/ComfyUI-Serving-Toolkit",
            "files": [
                "https://github.com/matan1905/ComfyUI-Serving-Toolkit"
            ],
            "install_type": "git-clone",
            "description": "This extension adds nodes that allow you to easily serve your workflow (for example using a discord bot) "
        },
        {
            "author": "PCMonsterx",
            "title": "ComfyUI-CSV-Loader",
            "reference": "https://github.com/PCMonsterx/ComfyUI-CSV-Loader",
            "files": [
                "https://github.com/PCMonsterx/ComfyUI-CSV-Loader"
            ],
            "install_type": "git-clone",
            "description": "CSV Loader for prompt building within ComfyUI interface. Allows access to positive/negative prompts associated with a name. Selections are being pulled from CSV files."
        },
        {
            "author": "Trung0246",
            "title": "ComfyUI-0246",
            "reference": "https://github.com/Trung0246/ComfyUI-0246",
            "files": [
                "https://github.com/Trung0246/ComfyUI-0246"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Highway, Junction. Random nodes for ComfyUI I made to solve my struggle with ComfyUI. Have varying quality."
        },
        {
            "author": "fexli",
            "title": "fexli-util-node-comfyui",
            "reference": "https://github.com/fexli/fexli-util-node-comfyui",
            "files": [
                "https://github.com/fexli/fexli-util-node-comfyui"
            ],
            "install_type": "git-clone",
            "description": "Nodes:FEImagePadForOutpaint, FEColorOut, FEColor2Image, FERandomizedColor2Image"
        },
        {
            "author": "AbyssYuan0",
            "title": "ComfyUI_BadgerTools",
            "reference": "https://github.com/AbyssYuan0/ComfyUI_BadgerTools",
            "files": [
                "https://github.com/AbyssYuan0/ComfyUI_BadgerTools"
            ],
            "install_type": "git-clone",
            "description": "Nodes:ImageOverlap-badger, FloatToInt-badger, IntToString-badger, FloatToString-badger, ImageNormalization-badger, ImageScaleToSide-badger, NovelToFizz-badger."
        },
        {
            "author": "palant",
            "title": "Image Resize for ComfyUI",
            "reference": "https://github.com/palant/image-resize-comfyui",
            "files": [
                "https://github.com/palant/image-resize-comfyui"
            ],
            "install_type": "git-clone",
            "description": "This custom node provides various tools for resizing images. The goal is resizing without distorting proportions, yet without having to perform any calculations with the size of the original image. If a mask is present, it is resized and modified along with the image."
        },
        {
            "author": "palant",
            "title": "Integrated Nodes for ComfyUI",
            "reference": "https://github.com/palant/integrated-nodes-comfyui",
            "files": [
                "https://github.com/palant/integrated-nodes-comfyui"
            ],
            "install_type": "git-clone",
            "description": "This tool will turn entire workflows or parts of them into single integrated nodes. In a way, it is similar to the Node Templates functionality but hides the inner structure. This is useful if all you want is to reuse and quickly configure a bunch of nodes without caring how they are interconnected."
        },
        {
            "author": "palant",
            "title": "Extended Save Image for ComfyUI",
            "reference": "https://github.com/palant/extended-saveimage-comfyui",
            "files": [
                "https://github.com/palant/extended-saveimage-comfyui"
            ],
            "install_type": "git-clone",
            "description": "This custom node is largely identical to the usual Save Image but allows saving images also in JPEG and WEBP formats, the latter with both lossless and lossy compression. Metadata is embedded in the images as usual, and the resulting images can be used to load a workflow."
        },
        {
            "author": "whmc76",
            "title": "ComfyUI-Openpose-Editor-Plus",
            "reference": "https://github.com/whmc76/ComfyUI-Openpose-Editor-Plus",
            "files": [
                "https://github.com/whmc76/ComfyUI-Openpose-Editor-Plus"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Openpose Editor Plus"
        },
        {
            "author": "martijnat",
            "title": "comfyui-previewlatent",
            "reference": "https://github.com/martijnat/comfyui-previewlatent",
            "files": [
                "https://github.com/martijnat/comfyui-previewlatent"
            ],
            "install_type": "git-clone",
            "description": "a ComfyUI plugin for previewing latents without vae decoding. Useful for showing intermediate results and can be used a faster 'preview image' if you don't wan't to use vae decode."
        },
        {
            "author": "peteromallet",
            "title": "ComfyUI-Creative-Interpolation [Beta]",
            "reference": "https://github.com/peteromallet/ComfyUI-Creative-Interpolation",
            "files": [
                "https://github.com/peteromallet/ComfyUI-Creative-Interpolation"
            ],
            "install_type": "git-clone",
            "description": "This a ComfyUI node for batch creative interpolation. The goal is to allow you to input a batch of images, and to provide a range of simple settings to control how the images are interpolated between."
        },
        {
            "author": "gemell1",
            "title": "ComfyUI_GMIC",
            "reference": "https://github.com/gemell1/ComfyUI_GMIC",
            "files": [
                "https://github.com/gemell1/ComfyUI_GMIC"
            ],
            "install_type": "git-clone",
            "description": "Nodes:GMIC Image Processing."
        },
        {
            "author": "LonicaMewinsky",
            "title": "ComfyBreakAnim",
            "reference": "https://github.com/LonicaMewinsky/ComfyUI-MakeFrame",
            "files": [
                "https://github.com/LonicaMewinsky/ComfyUI-MakeFrame"
            ],
            "install_type": "git-clone",
            "description": "Nodes:BreakFrames, GetKeyFrames, MakeGrid."
        },
        {
            "author": "TheBarret",
            "title": "ZSuite",
            "reference": "https://github.com/TheBarret/ZSuite",
            "files": [
                "https://github.com/TheBarret/ZSuite"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Prompter, RF Noise, SeedMod."
        },
        {
            "author": "romeobuilderotti",
            "title": "ComfyUI PNG Metadata",
            "reference": "https://github.com/romeobuilderotti/ComfyUI-PNG-Metadata",
            "files": [
                "https://github.com/romeobuilderotti/ComfyUI-PNG-Metadata"
            ],
            "install_type": "git-clone",
            "description": "Add custom Metadata fields to your saved PNG files."
        },
        {
            "author": "ka-puna",
            "title": "comfyui-yanc",
            "reference": "https://github.com/ka-puna/comfyui-yanc",
            "files": [
                "https://github.com/ka-puna/comfyui-yanc"
            ],
            "install_type": "git-clone",
            "description": "NOTE: Concatenate Strings, Format Datetime String, Integer Caster, Multiline String, Truncate String. Yet Another Node Collection, a repository of simple nodes for ComfyUI. This repository eases the addition or removal of custom nodes to itself."
        },
        {
            "author": "amorano",
            "title": "Jovimetrix Composition Nodes",
            "reference": "https://github.com/Amorano/Jovimetrix",
            "files": [
                "https://github.com/Amorano/Jovimetrix"
            ],
            "install_type": "git-clone",
            "description": "Composition nodes like Substance Designer heavily inspired by WAS and MTB Node Suites"
        },
        {
            "author": "Umikaze-job",
            "title": "select_folder_path_easy",
            "reference": "https://github.com/Umikaze-job/select_folder_path_easy",
            "files": [
                "https://github.com/Umikaze-job/select_folder_path_easy"
            ],
            "install_type": "git-clone",
            "description": "This extension simply connects the nodes and specifies the output path of the generated images to a manageable path."
        },
        {
            "author": "Niutonian",
            "title": "ComfyUi-NoodleWebcam",
            "reference": "https://github.com/Niutonian/ComfyUi-NoodleWebcam",
            "files": [
                "https://github.com/Niutonian/ComfyUi-NoodleWebcam"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Noodle webcam is a node that records frames and send them to your favourite node."
        },
        {
            "author": "Feidorian",
            "title": "feidorian-ComfyNodes",
            "reference": "https://github.com/Feidorian/feidorian-ComfyNodes",
            "nodename_pattern": "^Feidorian_",
            "files": [
                "https://github.com/Feidorian/feidorian-ComfyNodes"
            ],
            "install_type": "git-clone",
            "description": "This extension provides various custom nodes. literals, loaders, logic, output, switches"
        },
        {
            "author": "wutipong",
            "title": "ComfyUI-TextUtils",
            "reference": "https://github.com/wutipong/ComfyUI-TextUtils",
            "files": [
                "https://github.com/wutipong/ComfyUI-TextUtils"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Create N-Token String"
        },
        {
            "author": "natto-maki",
            "title": "ComfyUI-NegiTools",
            "reference": "https://github.com/natto-maki/ComfyUI-NegiTools",
            "files": [
                "https://github.com/natto-maki/ComfyUI-NegiTools"
            ],
            "install_type": "git-clone",
            "description": "Nodes:OpenAI DALLe3, OpenAI Translate to English, String Function, Seed Generator"
        },
        {
            "author": "LonicaMewinsky",
            "title": "ComfyUI-RawSaver",
            "reference": "https://github.com/LonicaMewinsky/ComfyUI-RawSaver",
            "files": [
                "https://github.com/LonicaMewinsky/ComfyUI-RawSaver"
            ],
            "install_type": "git-clone",
            "description": "Nodes:SaveTifImage. ComfyUI custom node for purpose of saving image as uint16 tif file."
        },
        {
            "author": "jojkaart",
            "title": "ComfyUI-sampler-lcm-alternative",
            "reference": "https://github.com/jojkaart/ComfyUI-sampler-lcm-alternative",
            "files": [
                "https://github.com/jojkaart/ComfyUI-sampler-lcm-alternative"
            ],
            "install_type": "git-clone",
            "description": "Nodes:LCMScheduler, SamplerLCMAlternative, SamplerLCMCycle. ComfyUI Custom Sampler nodes that add a new improved LCM sampler functions"
        },
        {
            "author": "GTSuya-Studio",
            "title": "ComfyUI-GTSuya-Nodes",
            "reference": "https://github.com/GTSuya-Studio/ComfyUI-Gtsuya-Nodes",
            "files": [
                "https://github.com/GTSuya-Studio/ComfyUI-Gtsuya-Nodes"
            ],
            "install_type": "git-clone",
            "description": "ComfyUI-GTSuya-Nodes is a ComyUI extension designed to add several wildcards supports into ComfyUI. Wildcards allow you to use __name__ syntax in your prompt to get a random line from a file named name.txt in a wildcards directory."
        },
        {
            "author": "oyvindg",
            "title": "ComfyUI-TrollSuite",
            "reference": "https://github.com/oyvindg/ComfyUI-TrollSuite",
            "files": [
                "https://github.com/oyvindg/ComfyUI-TrollSuite"
            ],
            "install_type": "git-clone",
            "description": "Nodes: BinaryImageMask, ImagePadding, LoadLastCreatedImage, RandomMask, TransparentImage."
        },
        {
            "author": "drago87",
            "title": "ComfyUI_Dragos_Nodes",
            "reference": "https://github.com/drago87/ComfyUI_Dragos_Nodes",
            "files": [
                "https://github.com/drago87/ComfyUI_Dragos_Nodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes:File Padding, Image Info, VAE Loader With Name"
        },
        {
            "author": "ansonkao",
            "title": "comfyui-geometry",
            "reference": "https://github.com/ansonkao/comfyui-geometry",
            "files": [
                "https://github.com/ansonkao/comfyui-geometry"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Mask to Centroid, Mask to Eigenvector. A small collection of custom nodes for use with ComfyUI, for geometry calculations"
        },
        {
            "author": "bronkula",
            "title": "comfyui-fitsize",
            "reference": "https://github.com/bronkula/comfyui-fitsize",
            "files": [
                "https://github.com/bronkula/comfyui-fitsize"
            ],
            "install_type": "git-clone",
            "description": "Nodes: Fit Size, Fit Size From Image. A simple set of nodes for making an image fit within a bounding box"
        },
        {
            "author": "kijai",
            "title": "ComfyUI-SVD",
            "reference": "https://github.com/kijai/ComfyUI-SVD",
            "files": [
                "https://github.com/kijai/ComfyUI-SVD"
            ],
            "install_type": "git-clone",
            "description": "Preliminary use of SVD in ComfyUI.<BR>NOTE: Quick Implementation, Unstable. See details on repositories."
        },
        {
            "author": "toyxyz",
            "title": "ComfyUI_toyxyz_test_nodes",
            "reference": "https://github.com/toyxyz/ComfyUI_toyxyz_test_nodes",
            "files": [
                "https://github.com/toyxyz/ComfyUI_toyxyz_test_nodes"
            ],
            "install_type": "git-clone",
            "description": "This node was created to send a webcam to ComfyUI in real time. This node is recommended for use with LCM."
        },
        {
            "author": "thecooltechguy",
            "title": "ComfyUI Stable Video Diffusion",
            "reference": "https://github.com/thecooltechguy/ComfyUI-Stable-Video-Diffusion",
            "files": [
                "https://github.com/thecooltechguy/ComfyUI-Stable-Video-Diffusion"
            ],
            "install_type": "git-clone",
            "description": "Easily use Stable Video Diffusion inside ComfyUI!"
        },
        {
            "author": "Danand",
            "title": "ComfyUI-ComfyCouple",
            "reference": "https://github.com/Danand/ComfyUI-ComfyCouple",
            "files": [
                "https://github.com/Danand/ComfyUI-ComfyCouple"
            ],
            "install_type": "git-clone",
            "description": " Simple custom node which helps to generate images of actual couples."
        },
        {
            "author": "42lux",
            "title": "ComfyUI-safety-checker",
            "reference": "https://github.com/42lux/ComfyUI-safety-checker",
            "files": [
                "https://github.com/42lux/ComfyUI-safety-checker"
            ],
            "install_type": "git-clone",
            "description": "A NSFW/Safety Checker Node for ComfyUI."
        },
        {
            "author": "sergekatzmann",
            "title": "ComfyUI_Nimbus-Pack",
            "reference": "https://github.com/sergekatzmann/ComfyUI_Nimbus-Pack",
            "files": [
                "https://github.com/sergekatzmann/ComfyUI_Nimbus-Pack"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Image Square Adapter Node"
        },
        {
            "author": "komojini",
            "title": "ComfyUI_SDXL_DreamBooth_LoRA_CustomNodes",
            "reference": "https://github.com/komojini/ComfyUI_SDXL_DreamBooth_LoRA_CustomNodes",
            "files": [
                "https://github.com/komojini/ComfyUI_SDXL_DreamBooth_LoRA_CustomNodes"
            ],
            "install_type": "git-clone",
            "description": "Nodes:XL DreamBooth LoRA"
        },
        {
            "author": "ZHO-ZHO-ZHO",
            "title": "ComfyUI-Text_Image-Composite",
            "reference": "https://github.com/ZHO-ZHO-ZHO/ComfyUI-Text_Image-Composite",
            "files": [
                "https://github.com/ZHO-ZHO-ZHO/ComfyUI-Text_Image-Composite"
            ],
            "install_type": "git-clone",
            "description": "Nodes:Text_Image_Zho, Text_Image_Multiline_Zho, RGB_Image_Zho, AlphaChanelAddByMask, ImageComposite_Zho, ..."
        },
        {
            "author": "Off-Live",
            "title": "ComfyUI-off-suite",
            "reference": "https://github.com/Off-Live/ComfyUI-off-suite",
            "files": [
                "https://github.com/Off-Live/ComfyUI-off-suite"
            ],
            "install_type": "copy",
            "description": "Nodes:Image Crop Fit Node, OFF SEGS to Image, Crop Center wigh SEGS, Watermarking, GW Number Formatting Node."
        },
        {
            "author": "Ser-Hilary",
            "title": "SDXL_sizing",
            "reference": "https://github.com/Ser-Hilary/SDXL_sizing",
            "files": [
                "https://github.com/Ser-Hilary/SDXL_sizing/raw/main/conditioning_sizing_for_SDXL.py"
            ],
            "install_type": "copy",
            "description": "Nodes:sizing_node. Size calculation node related to image size in prompts supported by SDXL."
        },
        {
            "author": "ailex000",
            "title": "Image Gallery",
            "reference": "https://github.com/ailex000/ComfyUI-Extensions",
            "js_path": "image-gallery",
            "files": [
                "https://github.com/ailex000/ComfyUI-Extensions/raw/main/image-gallery/imageGallery.js"
            ],
            "install_type": "copy",
            "description": "Custom javascript extensions for better UX for ComfyUI. Supported nodes: PreviewImage, SaveImage. Double click on image to open."
        },
        {
            "author": "rock-land",
            "title": "graphNavigator",
            "reference": "https://github.com/rock-land/graphNavigator",
            "js_path": "graphNavigator",
            "files": [
                "https://github.com/rock-land/graphNavigator/raw/main/graphNavigator/graphNavigator.js"
            ],
            "install_type": "copy",
            "description": "ComfyUI Web Extension for saving views and navigating graphs."
        },
        {
            "author": "diffus3",
            "title": "diffus3/ComfyUI-extensions",
            "reference": "https://github.com/diffus3/ComfyUI-extensions",
            "js_path": "diffus3",
            "files": [
                "https://github.com/diffus3/ComfyUI-extensions/raw/main/multiReroute/multireroute.js",
                "https://github.com/diffus3/ComfyUI-extensions/raw/main/setget/setget.js"
            ],
            "install_type": "copy",
            "description": "Extensions: subgraph, setget, multiReroute"
        },
        {
            "author": "m957ymj75urz",
            "title": "m957ymj75urz/ComfyUI-Custom-Nodes",
            "reference": "https://github.com/m957ymj75urz/ComfyUI-Custom-Nodes",
            "js_path": "m957ymj75urz",
            "files": [
                "https://github.com/m957ymj75urz/ComfyUI-Custom-Nodes/raw/main/clip-text-encode-split/clip_text_encode_split.py",
                "https://github.com/m957ymj75urz/ComfyUI-Custom-Nodes/raw/main/colors/colors.js"
            ],
            "install_type": "copy",
            "description": "Nodes: RawText, RawTextCLIPEncode, RawTextCombine, RawTextReplace, Extension: m957ymj75urz.colors"
        },
        {
            "author": "Bikecicle",
            "title": "Waveform Extensions",
            "reference": "https://github.com/Bikecicle/ComfyUI-Waveform-Extensions",
            "files": [
                "https://github.com/Bikecicle/ComfyUI-Waveform-Extensions/raw/main/EXT_AudioManipulation.py",
                "https://github.com/Bikecicle/ComfyUI-Waveform-Extensions/raw/main/EXT_VariationUtils.py"
            ],
            "install_type": "copy",
            "description": "Some additional audio utilites for use on top of Sample Diffusion ComfyUI Extension"
        },
        {
            "author": "dawangraoming",
            "title": "KSampler GPU",
            "reference": "https://github.com/dawangraoming/ComfyUI_ksampler_gpu",
            "files": [
                "https://github.com/dawangraoming/ComfyUI_ksampler_gpu/raw/main/ksampler_gpu.py"
            ],
            "install_type": "copy",
            "description": "KSampler is provided, based on GPU random noise"
        },
        {
            "author": "fitCorder",
            "title": "fcSuite",
            "reference": "https://github.com/fitCorder/fcSuite",
            "files": [
                "https://github.com/fitCorder/fcSuite/raw/main/fcSuite.py"
            ],
            "install_type": "copy",
            "description": "fcFloatMatic is a custom module, that when configured correctly will increment through the lines generating you loras at different strengths. The JSON file will load the config."
        },
        {
            "author": "lrzjason",
            "title": "ComfyUIJasonNode",
            "reference": "https://github.com/lrzjason/ComfyUIJasonNode",
            "files": [
                "https://github.com/lrzjason/ComfyUIJasonNode/raw/main/SDXLMixSampler.py",
                "https://github.com/lrzjason/ComfyUIJasonNode/raw/main/LatentByRatio.py"
            ],
            "install_type": "copy",
            "description": "Nodes:SDXLMixSampler, LatentByRatio"
        },
        {
            "author": "lordgasmic",
            "title": "Wildcards",
            "reference": "https://github.com/lordgasmic/ComfyUI-Wildcards",
            "files": [
                "https://github.com/lordgasmic/ComfyUI-Wildcards/raw/master/wildcards.py"
            ],
            "install_type": "copy",
            "description": "Nodes:CLIPTextEncodeWithWildcards. This wildcard node is a wildcard node that operates based on the seed."
        },
        {
            "author": "throttlekitty",
            "title": "SDXLCustomAspectRatio",
            "reference": "https://github.com/throttlekitty/SDXLCustomAspectRatio",
            "files": [
                "https://raw.githubusercontent.com/throttlekitty/SDXLCustomAspectRatio/main/SDXLAspectRatio.py"
            ],
            "install_type": "copy",
            "description": "A quick and easy ComfyUI custom node for setting SDXL-friendly aspect ratios."
        },
        {
            "author": "s1dlx",
            "title": "comfy_meh",
            "reference": "https://github.com/s1dlx/comfy_meh",
            "files": [
                "https://github.com/s1dlx/comfy_meh/raw/main/meh.py"
            ],
            "install_type": "copy",
            "description": "Advanced merging methods."
        },
        {
            "author": "tudal",
            "title": "Hakkun-ComfyUI-nodes",
            "reference": "https://github.com/tudal/Hakkun-ComfyUI-nodes",
            "files": [
                "https://github.com/tudal/Hakkun-ComfyUI-nodes/raw/main/hakkun_nodes.py"
            ],
            "install_type": "copy",
            "description": "Nodes: Prompt parser. ComfyUI extra nodes. Mostly prompt parsing."
        },
        {
            "author": "SadaleNet",
            "title": "ComfyUI A1111-like Prompt Custom Node Solution",
            "reference": "https://github.com/SadaleNet/CLIPTextEncodeA1111-ComfyUI",
            "files": [
                "https://github.com/SadaleNet/CLIPTextEncodeA1111-ComfyUI/raw/master/custom_nodes/clip_text_encoder_a1111.py"
            ],
            "install_type": "copy",
            "description": "Nodes: CLIPTextEncodeA1111, RerouteTextForCLIPTextEncodeA1111."
        },
        {
            "author": "wsippel",
            "title": "SDXLResolutionPresets",
            "reference": "https://github.com/wsippel/comfyui_ws",
            "files": [
                "https://github.com/wsippel/comfyui_ws/raw/main/sdxl_utility.py"
            ],
            "install_type": "copy",
            "description": "Nodes: SDXLResolutionPresets. Easy access to the officially supported resolutions, in both horizontal and vertical formats: 1024x1024, 1152x896, 1216x832, 1344x768, 1536x640"
        },
        {
            "author": "nicolai256",
            "title": "comfyUI_Nodes_nicolai256",
            "reference": "https://github.com/nicolai256/comfyUI_Nodes_nicolai256",
            "files": [
                "https://github.com/nicolai256/comfyUI_Nodes_nicolai256/raw/main/yugioh-presets.py"
            ],
            "install_type": "copy",
            "description": "Nodes: yugioh_Presets. by Nicolai256 inspired by throttlekitty SDXLAspectRatio"
        },
        {
            "author": "Onierous",
            "title": "QRNG_Node_ComfyUI",
            "reference": "https://github.com/Onierous/QRNG_Node_ComfyUI",
            "files": [
                "https://github.com/Onierous/QRNG_Node_ComfyUI/raw/main/qrng_node.py"
            ],
            "install_type": "copy",
            "description": "Nodes: QRNG Node CSV. A node that takes in an array of random numbers from the ANU QRNG API and stores them locally for generating quantum random number noise_seeds in ComfyUI"
        },
        {
            "author": "ntdviet",
            "title": "ntdviet/comfyui-ext",
            "reference": "https://github.com/ntdviet/comfyui-ext",
            "files": [
                "https://github.com/ntdviet/comfyui-ext/raw/main/custom_nodes/gcLatentTunnel/gcLatentTunnel.py"
            ],
            "install_type": "copy",
            "description": "Nodes:LatentGarbageCollector. This ComfyUI custom node flushes the GPU cache and empty cuda interprocess memory. It's helpfull for low memory environment such as the free Google Colab, especially when the workflow VAE decode latents of the size above 1500x1500."
        },
        {
            "author": "alkemann",
            "title": "alkemann nodes",
            "reference": "https://gist.github.com/alkemann/7361b8eb966f29c8238fd323409efb68",
            "files": [
                "https://gist.github.com/alkemann/7361b8eb966f29c8238fd323409efb68/raw/f9605be0b38d38d3e3a2988f89248ff557010076/alkemann.py"
            ],
            "install_type": "copy",
            "description": "Nodes:Int to Text, Seed With Text, Save A1 Image."
        },
        {
            "author": "catscandrive",
            "title": "Image loader with subfolders",
            "reference": "https://github.com/catscandrive/comfyui-imagesubfolders",
            "files": [
                "https://github.com/catscandrive/comfyui-imagesubfolders/raw/main/loadImageWithSubfolders.py"
            ],
            "install_type": "copy",
            "description": "Adds an Image Loader node that also shows images in subfolders of the default input directory"
        },
        {
            "author": "Smuzzies",
            "title": "Chatbox Overlay node for ComfyUI",
            "reference": "https://github.com/Smuzzies/comfyui_chatbox_overlay",
            "files": [
                "https://github.com/Smuzzies/comfyui_chatbox_overlay/raw/main/chatbox_overlay.py"
            ],
            "install_type": "copy",
            "description": "Nodes: Chatbox Overlay. Custom node for ComfyUI to add a text box over a processed image before save node."
        },
        {
            "author": "CaptainGrock",
            "title": "ComfyUIInvisibleWatermark",
            "reference": "https://github.com/CaptainGrock/ComfyUIInvisibleWatermark",
            "files": [
                "https://github.com/CaptainGrock/ComfyUIInvisibleWatermark/raw/main/Invisible%20Watermark.py"
            ],
            "install_type": "copy",
            "description": "Nodes:Apply Invisible Watermark, Extract Watermark. Adds up to 12 characters encoded into an image that can be extracted."
        },
        {
            "author": "theally",
            "title": "TheAlly's Custom Nodes",
            "reference": "https://civitai.com/models/19625?modelVersionId=23296",
            "files": [
                "https://civitai.com/api/download/models/25114",
                "https://civitai.com/api/download/models/24679",
                "https://civitai.com/api/download/models/24154",
                "https://civitai.com/api/download/models/23884",
                "https://civitai.com/api/download/models/23649",
                "https://civitai.com/api/download/models/23467",
                "https://civitai.com/api/download/models/23296"
            ],
            "install_type": "unzip",
            "description": "Custom nodes for ComfyUI by TheAlly."
        },
        {
            "author": "xss",
            "title": "Custom Nodes by xss",
            "reference": "https://civitai.com/models/24869/comfyui-custom-nodes-by-xss",
            "files": [
                "https://civitai.com/api/download/models/32717",
                "https://civitai.com/api/download/models/47776",
                "https://civitai.com/api/download/models/29772",
                "https://civitai.com/api/download/models/31618",
                "https://civitai.com/api/download/models/31591",
                "https://civitai.com/api/download/models/29773",
                "https://civitai.com/api/download/models/29774",
                "https://civitai.com/api/download/models/29755",
                "https://civitai.com/api/download/models/29750"
            ],
            "install_type": "unzip",
            "description": "Various image processing nodes."
        },
        {
            "author": "aimingfail",
            "title": "Image2Halftone Node for ComfyUI",
            "reference": "https://civitai.com/models/143293/image2halftone-node-for-comfyui",
            "files": [
                "https://civitai.com/api/download/models/158997"
            ],
            "install_type": "unzip",
            "description": "This is a node to convert an image into a CMYK Halftone dot image."
        }
    ]
}
