import { getBackendUrl } from "@comflowy/common/config";
import { LanguageTranslation, registerDynamicTranslation } from "@comflowy/common/i18n";
/**
 * https://github.com/AIGODLIKE/AIGODLIKE-ComfyUI-Translation/
 * http://localhost:4000/static/custom_nodes/Test-Frontend-Extension/dist/ui.html
 */
let loaded = false;
export async function loadI18NFromExtension() {
  if (loaded) {
    return;
  }
  loaded = true;
  const baseUrl = getBackendUrl('/static/custom_nodes/AIGODLIKE-ComfyUI-Translation');
  const translations: Record<string, LanguageTranslation>= {};
  const langs = [{
    name: 'ja-JP',
    lang: 'ja',
  }, {
    name: 'zh-CN',
    lang: 'zh-CN',
    translations: {}
  }];

  const files: Record<string, string> = {
    'NodeCategory': 'NodeCategory.json',
    "Menu": 'Menu.json',
  }

  const nodes = `AlekPet_nodes.json ComfyUI-InstantID.json ComfyUI_FizzNodes.json Derfuu_ComfyUI_ModdedNodes.json comfyui-animatediff.json BNK_TiledKSampler.json ComfyUI-KJNodes.json ComfyUI_IPAdapter_plus.json Efficiency Nodes.json comfyui-dynamicprompts.json ComfyMath.json ComfyUI-LCM.json ComfyUI_InstantID.json FreeU_Advanced.json comfyui-mixlab-nodes.json ComfyUI-3D-Pack.json ComfyUI-LaMA-Preprocessor.json ComfyUI_LatentToRGB.json IPAdapter.json comfyui-portrait-master.json ComfyUI-Advanced-ControlNet.json ComfyUI-Manager.json ComfyUI_LayerStyle.json OneButtonPrompt.json comfyui-prompt-reader-node.json ComfyUI-AnimateAnyone-Evolved.json ComfyUI-MotionCtrl-SVD.json ComfyUI_VLM_nodes.json PowerNoiseSuite.json comfyui-reactor-node.json ComfyUI-AnimateDiff-Evolved.json ComfyUI-MotionCtrl.json ComfyUI_essentials.json SD-Latent-Interposer.json comfyui_dagthoma.json ComfyUI-BiRefNet.json ComfyUI-TiledDiffusion.json ComfyUI_fabric.json SeargeSDXL.json comfyui_segment_anything.json ComfyUI-Crystools.json ComfyUI-Vextra-Nodes.json ComfyUI_post_processing_nodes.json Stability.json custom_node_experiments.json ComfyUI-Custom-Scripts.json ComfyUI-VideoHelperSuite.json ComfyUI_restart_sampling.json UltimateSDUpscale.json fastDecoder.json ComfyUI-Easy-Tools.json ComfyUI-WD14-Tagger.json ComfyUI_roop.json WAS_suite.json images_grid_comfy_plugin.json ComfyUI-Easy-Use.json ComfyUI-layerdiffusion.json ComfyUI_tinyterraNodes.json advanced_encode.json internal.json ComfyUI-ExLlama-Nodes.json ComfyUI-moondream.json Comfyui_ControlNet_aux.json cg-image-picker.json masquerade-nodes-comfyui.json ComfyUI-Flowty-TripoSR.json ComfyUI-zfkun.json Comfyui_Cutoff.json cg-use-everywhere.json rgthree-comfy.json ComfyUI-Impact-Pack.json ComfyUI_Comfyroll_CustomNodes.json Comfyui_Noise.json clip_seg.json sd-dynamic-thresholding.json ComfyUI-Inspire-Pack.json ComfyUI_Dave_CustomNode.json ControlNet-LLLite-ComfyUI.json comfy-qr.json sdxl_prompt_styler.json`.split(' ');
  nodes.forEach(node => {
    files[`Nodes.${node.replace(".json", "")}`] = `Nodes/${node}`
  });

  for (const lang of langs) {
    for (const [key, file] of Object.entries(files)) {
      const url = `${baseUrl}/${lang.name}/${file}`;
      const category = key.split('.')[0];
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        const flattened = flattenObject(data);
        for (const [k, v] of Object.entries(flattened)) {
          const realKey = category + '.' + k;
          if (!translations[realKey]) {
            translations[realKey] = {} as any
          }
          translations[realKey][lang.lang] = v;
        }
      } catch(err) {
        // console.error(err);
      }
    }
  }

  for (const [key, value] of Object.entries(translations)) {
    registerDynamicTranslation(key, value)
  }
  console.log("translations", translations);
}

function flattenObject(obj, prefix = '') {
  let res = {};
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      res = { ...res, ...flattenObject(obj[key], `${prefix}${key}.`) };
    } else {
      res[`${prefix}${key}`] = obj[key];
    }
  }
  return res;
}