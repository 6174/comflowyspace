import { describe, expect, test } from '@jest/globals';
import { parseComflowyLogs } from '../comflowy-log-parser';
const testString = `
** ComfyUI startup time: 2024-02-27 22:20:19.904847
** Platform: Darwin
** Python version: 3.10.8 (main, Nov 24 2022, 08:08:27) [Clang 14.0.6 ]
** Python executable: /Users/jimmywong/miniconda3/envs/comflowy/bin/python
** Log path: /Volumes/T7 Shield/AI /ComfyUI/comfyui.log

Prestartup times for custom nodes:
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/rgthree-comfy
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-Manager

Total VRAM 36864 MB, total RAM 36864 MB
Set vram state to: SHARED
Device: mps
VAE dtype: torch.float32
Using sub quadratic optimization for cross attention, if you have memory or speed issues try using: --use-split-cross-attention
### Loading: ComfyUI-Manager (V2.8.3)
### ComfyUI Revision: 2025 [1e0fcc9a] | Released on '2024-02-27'
[ReActor] - STATUS - Running v0.4.1-b11 in ComfyUI
Torch version: 2.3.0.dev20240122
[ComfyUI-Manager] default cache updated: https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main/alter-list.json
[ComfyUI-Manager] default cache updated: https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main/model-list.json

[rgthree] Loaded 34 fantastic nodes.
[rgthree] Will use rgthree's optimized recursive execution.

### Loading: ComfyUI-Inspire-Pack (V0.65.5)
[comfyui_controlnet_aux] | INFO -> Using ckpts path: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/comfyui_controlnet_aux/ckpts
[comfyui_controlnet_aux] | INFO -> Using symlinks: False
[comfyui_controlnet_aux] | INFO -> Using ort providers: ['CUDAExecutionProvider', 'DirectMLExecutionProvider', 'OpenVINOExecutionProvider', 'ROCMExecutionProvider', 'CPUExecutionProvider', 'CoreMLExecutionProvider']
[ComfyUI-Manager] default cache updated: https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main/custom-node-list.json
[ComfyUI-Manager] default cache updated: https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main/extension-node-map.json
DWPose: Onnxruntime with acceleration providers detected
[AnimateDiffEvo] - ERROR - No motion models found. Please download one and place in: ['/Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved/models', '/Volumes/T7 Shield/AI /ComfyUI/models/animatediff_models']
FizzleDorf Custom Nodes: Loaded
Traceback (most recent call last):
  File "/Volumes/T7 Shield/AI /ComfyUI/nodes.py", line 1887, in load_custom_node
    module_spec.loader.exec_module(module)
  File "<frozen importlib._bootstrap_external>", line 879, in exec_module
  File "<frozen importlib._bootstrap_external>", line 1016, in get_code
  File "<frozen importlib._bootstrap_external>", line 1073, in get_data
FileNotFoundError: [Errno 2] No such file or directory: '/Volumes/T7 Shield/AI /ComfyUI/custom_nodes/IPAdapter-ComfyUI/__init__.py'

Cannot import /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/IPAdapter-ComfyUI module for custom nodes: [Errno 2] No such file or directory: '/Volumes/T7 Shield/AI /ComfyUI/custom_nodes/IPAdapter-ComfyUI/__init__.py'
[VideoHelperSuite] - WARNING - Failed to import imageio_ffmpeg
[VideoHelperSuite] - ERROR - No valid ffmpeg found.
Efficiency Nodes: Attempting to add Control Net options to the 'HiRes-Fix Script' Node (comfyui_controlnet_aux add-on)...Success!

Import times for custom nodes:
   0.0 seconds (IMPORT FAILED): /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/IPAdapter-ComfyUI
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/sdxl_prompt_styler
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI_TiledKSampler
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-BRIA_AI-RMBG
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI_experiments
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-Custom-Scripts
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/efficiency-nodes-comfyui
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/Derfuu_ComfyUI_ModdedNodes
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/rgthree-comfy
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-Inspire-Pack
   0.0 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite
   0.1 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI_InstantID
   0.2 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI-Manager
   0.2 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/ComfyUI_FizzNodes
   0.4 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/comfyui_controlnet_aux
   0.6 seconds: /Volumes/T7 Shield/AI /ComfyUI/custom_nodes/comfyui-reactor-node

Starting server

To see the GUI go to: http://127.0.0.1:8188
`

describe('Logs module', () => {
  const logs = parseComflowyLogs(testString);
  console.log("logs:", logs);
  test('logs has extensions', () => {
    expect(logs.length).toBe(3);
  });

  test('logs has import results', () => {
    expect(logs.length).toBe(3);
  });

});
