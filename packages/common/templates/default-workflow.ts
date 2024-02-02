export default {
  "id": "3cb40958-7201-4c7a-b46e-49e75c0e1d48",
  "title": "Untitled",
  "nodes": {
    "3": {
      "id": "3",
      "value": {
        "widget": "KSampler",
        "fields": {
          "seed": 156680208700286,
          "control_after_generated": "randomize",
          "steps": 20,
          "cfg": 8,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": 1
        },
        "inputs": [
          {
            "name": "model",
            "type": "MODEL",
            "link": 1
          },
          {
            "name": "positive",
            "type": "CONDITIONING",
            "link": 4
          },
          {
            "name": "negative",
            "type": "CONDITIONING",
            "link": 6
          },
          {
            "name": "latent_image",
            "type": "LATENT",
            "link": 2
          }
        ],
        "outputs": [
          {
            "name": "LATENT",
            "type": "LATENT",
            "links": [
              7
            ],
            "slot_index": 0
          }
        ]
      },
      "dimensions": {
        "width": 315,
        "height": 262
      },
      "position": {
        "x": 863,
        "y": 186
      }
    },
    "4": {
      "id": "4",
      "value": {
        "widget": "CheckpointLoaderSimple",
        "fields": {
          "ckpt_name": "v1-5-pruned-emaonly.ckpt"
        },
        "inputs": [],
        "outputs": [
          {
            "name": "MODEL",
            "type": "MODEL",
            "links": [
              1
            ],
            "slot_index": 0
          },
          {
            "name": "CLIP",
            "type": "CLIP",
            "links": [
              3,
              5
            ],
            "slot_index": 1
          },
          {
            "name": "VAE",
            "type": "VAE",
            "links": [
              8
            ],
            "slot_index": 2
          }
        ]
      },
      "dimensions": {
        "width": 315,
        "height": 98
      },
      "position": {
        "x": 26,
        "y": 474
      }
    },
    "5": {
      "id": "5",
      "value": {
        "widget": "EmptyLatentImage",
        "fields": {
          "width": 512,
          "height": 512,
          "batch_size": 1
        },
        "inputs": [],
        "outputs": [
          {
            "name": "LATENT",
            "type": "LATENT",
            "links": [
              2
            ],
            "slot_index": 0
          }
        ]
      },
      "dimensions": {
        "width": 315,
        "height": 106
      },
      "position": {
        "x": 473,
        "y": 609
      }
    },
    "6": {
      "id": "6",
      "value": {
        "widget": "CLIPTextEncode",
        "fields": {
          "text": "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,"
        },
        "inputs": [
          {
            "name": "clip",
            "type": "CLIP",
            "link": 3
          }
        ],
        "outputs": [
          {
            "name": "CONDITIONING",
            "type": "CONDITIONING",
            "links": [
              4
            ],
            "slot_index": 0
          }
        ]
      },
      "dimensions": {
        "width": 422.84503173828125,
        "height": 164.31304931640625
      },
      "position": {
        "x": 398.740959666203,
        "y": 70.93602225312932
      }
    },
    "7": {
      "id": "7",
      "value": {
        "widget": "CLIPTextEncode",
        "fields": {
          "text": "text, watermark"
        },
        "inputs": [
          {
            "name": "clip",
            "type": "CLIP",
            "link": 5
          }
        ],
        "outputs": [
          {
            "name": "CONDITIONING",
            "type": "CONDITIONING",
            "links": [
              6
            ],
            "slot_index": 0
          }
        ]
      },
      "dimensions": {
        "width": 425.27801513671875,
        "height": 180.6060791015625
      },
      "position": {
        "x": 397.99165507649514,
        "y": 325.2145340751043
      }
    },
    "8": {
      "id": "8",
      "value": {
        "widget": "VAEDecode",
        "fields": {},
        "inputs": [
          {
            "name": "samples",
            "type": "LATENT",
            "link": 7
          },
          {
            "name": "vae",
            "type": "VAE",
            "link": 8
          }
        ],
        "outputs": [
          {
            "name": "IMAGE",
            "type": "IMAGE",
            "links": [
              9
            ],
            "slot_index": 0
          }
        ]
      },
      "dimensions": {
        "width": 210,
        "height": 46
      },
      "position": {
        "x": 1209,
        "y": 188
      }
    },
    "9": {
      "id": "9",
      "value": {
        "widget": "SaveImage",
        "fields": {
          "filename_prefix": "ComfyUI"
        },
        "inputs": [
          {
            "name": "images",
            "type": "IMAGE",
            "link": 9
          }
        ],
        "outputs": []
      },
      "dimensions": {
        "width": 210,
        "height": 58
      },
      "position": {
        "x": 1451,
        "y": 189
      }
    }
  },
  "connections": [
    {
      "id": "1",
      "source": "4",
      "target": "3",
      "sourceHandle": "MODEL",
      "targetHandle": "MODEL",
      "handleType": "MODEL"
    },
    {
      "id": "2",
      "source": "5",
      "target": "3",
      "sourceHandle": "LATENT",
      "targetHandle": "LATENT_IMAGE",
      "handleType": "LATENT"
    },
    {
      "id": "3",
      "source": "4",
      "target": "6",
      "sourceHandle": "CLIP",
      "targetHandle": "CLIP",
      "handleType": "CLIP"
    },
    {
      "id": "4",
      "source": "6",
      "target": "3",
      "sourceHandle": "CONDITIONING",
      "targetHandle": "POSITIVE",
      "handleType": "CONDITIONING"
    },
    {
      "id": "5",
      "source": "4",
      "target": "7",
      "sourceHandle": "CLIP",
      "targetHandle": "CLIP",
      "handleType": "CLIP"
    },
    {
      "id": "6",
      "source": "7",
      "target": "3",
      "sourceHandle": "CONDITIONING",
      "targetHandle": "NEGATIVE",
      "handleType": "CONDITIONING"
    },
    {
      "id": "7",
      "source": "3",
      "target": "8",
      "sourceHandle": "LATENT",
      "targetHandle": "SAMPLES",
      "handleType": "LATENT"
    },
    {
      "id": "8",
      "source": "4",
      "target": "8",
      "sourceHandle": "VAE",
      "targetHandle": "VAE",
      "handleType": "VAE"
    },
    {
      "id": "9",
      "source": "8",
      "target": "9",
      "sourceHandle": "IMAGE",
      "targetHandle": "IMAGES",
      "handleType": "IMAGE"
    }
  ]
}