export default {
    "data": {
      "1": {
        "value": { "widget": "CheckpointLoaderSimple", "fields": { "ckpt_name": "sd-v1-4.ckpt" } },
        "position": { "x": -138.65352317628003, "y": -191.36843297347312 }
      },
      "2": {
        "value": { "widget": "CLIPTextEncode", "fields": { "text": "beautiful mountain scenery" } },
        "position": { "x": -138.7341322824018, "y": -73.6641410349036 }
      },
      "3": {
        "value": { "widget": "CLIPTextEncode", "fields": { "text": "" } },
        "position": { "x": -136.55891054401303, "y": 119.89772257951374 }
      },
      "4": {
        "value": {
          "widget": "KSampler",
          "fields": { "seed": -1, "steps": 20, "cfg": 7, "sampler_name": "euler", "scheduler": "normal", "denoise": 1 }
        },
        "position": { "x": 316.0075115157922, "y": -195.5841212096412 }
      },
      "5": {
        "value": { "widget": "VAEDecode", "fields": {} },
        "position": { "x": 769.6594250929854, "y": -195.09752371886228 }
      },
      "6": {
        "value": { "widget": "SaveImage", "fields": { "filename_prefix": "output" } },
        "position": { "x": 772.0821842803763, "y": -90.8381271274001 }
      },
      "7": {
        "value": { "widget": "EmptyLatentImage", "fields": { "width": 512, "height": 512, "batch_size": 1 } },
        "position": { "x": 316.0075115157922, "y": 11.391056441942904 }
      }
    },
    "connections": [
      { "source": "1", "sourceHandle": "MODEL", "target": "4", "targetHandle": "model" },
      { "source": "1", "sourceHandle": "CLIP", "target": "2", "targetHandle": "clip" },
      { "source": "1", "sourceHandle": "CLIP", "target": "3", "targetHandle": "clip" },
      { "source": "1", "sourceHandle": "VAE", "target": "5", "targetHandle": "vae" },
      { "source": "4", "sourceHandle": "LATENT", "target": "5", "targetHandle": "samples" },
      { "source": "7", "sourceHandle": "LATENT", "target": "4", "targetHandle": "latent_image" },
      { "source": "2", "sourceHandle": "CONDITIONING", "target": "4", "targetHandle": "positive" },
      { "source": "3", "sourceHandle": "CONDITIONING", "target": "4", "targetHandle": "negative" },
      { "source": "5", "sourceHandle": "IMAGE", "target": "6", "targetHandle": "images" }
    ]
  }
  