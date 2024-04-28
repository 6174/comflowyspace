export enum ComfyUIErrorTypes {
  widget_not_found = "widget_not_found",
  value_not_in_list = "value_not_in_list",
  image_not_in_list = "image_not_in_list",
  required_field_missing = "required_field_missing"
}

export type ComfyUIError = {
  type?: ComfyUIErrorTypes | string;
  message: string;
  details?: string;
  static?: boolean;
  extra_info?: {
    input_name: string;
    input_config: string[][] | any;
    received_value: string;
  } | any;
};


export type ComfyUINodeError = {
  errors: ComfyUIError[];
  dependent_outputs?: string[];
  class_type?: string;
  extra_info?: any;
}

export type ComfyUIExecuteError = {
  error?: ComfyUIError;
  node_errors: Record<string, ComfyUINodeError>;
}

// {
//   "error": {
//     "type": "prompt_outputs_failed_validation",
//       "message": "Prompt outputs failed validation",
//         "details": "",
//           "extra_info": { }
//   },
//   "node_errors": {
//     "4": {
//       "errors": [
//         {
//           "type": "value_not_in_list",
//           "message": "Value not in list",
//           "details": "ckpt_name: 'SDXL-v1.0-base.safetensors' not in ['sd_xl_basess_1.0.safetensors', 'sd_xl_refiner_1.0.safetensors', 'sd_xl_turbo_1.0_fp16.safetensors', 'v1-5-pruned-emaonly.ckpt']",
//           "extra_info": {
//             "input_name": "ckpt_name",
//             "input_config": [
//               [
//                 "sd_xl_basess_1.0.safetensors",
//                 "sd_xl_refiner_1.0.safetensors",
//                 "sd_xl_turbo_1.0_fp16.safetensors",
//                 "v1-5-pruned-emaonly.ckpt"
//               ]
//             ],
//             "received_value": "SDXL-v1.0-base.safetensors"
//           }
//         }
//       ],
//         "dependent_outputs": [
//           "9"
//         ],
//           "class_type": "CheckpointLoaderSimple"
//     },
//     "12": {
//       "errors": [
//         {
//           "type": "value_not_in_list",
//           "message": "Value not in list",
//           "details": "lora_name: 'SDXL-LCM-LoRA.safetensors' not in ['lcm/SDXL/pytorch_lora_weights.safetensors', 'lora_lcm_sdxl.safetensors']",
//           "extra_info": {
//             "input_name": "lora_name",
//             "input_config": [
//               [
//                 "lcm/SDXL/pytorch_lora_weights.safetensors",
//                 "lora_lcm_sdxl.safetensors"
//               ]
//             ],
//             "received_value": "SDXL-LCM-LoRA.safetensors"
//           }
//         }
//       ],
//         "dependent_outputs": [
//           "9"
//         ],
//           "class_type": "LoraLoader"
//     }
//   }
// }