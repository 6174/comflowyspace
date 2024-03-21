export default {
    "client_id": "aa1d81085b8940e7be7e34724ecfe819",
    "prompt": {
        "3": {
            "inputs": {
                "seed": 156680208700286,
                "steps": 20,
                "cfg": 8,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": [
                    "4",
                    0
                ],
                "positive": [
                    "6",
                    0
                ],
                "negative": [
                    "7",
                    0
                ],
                "latent_image": [
                    "5",
                    0
                ]
            },
            "class_type": "KSampler"
        },
        "4": {
            "inputs": {
                "ckpt_name": "v1-5-dream-shaper.safetensors"
            },
            "class_type": "CheckpointLoaderSimple"
        },
        "5": {
            "inputs": {
                "width": 512,
                "height": 512,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage"
        },
        "6": {
            "inputs": {
                "text": "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,",
                "clip": [
                    "4",
                    1
                ]
            },
            "class_type": "CLIPTextEncode"
        },
        "7": {
            "inputs": {
                "text": "text, watermark",
                "clip": [
                    "4",
                    1
                ]
            },
            "class_type": "CLIPTextEncode"
        },
        "8": {
            "inputs": {
                "samples": [
                    "3",
                    0
                ],
                "vae": [
                    "4",
                    2
                ]
            },
            "class_type": "VAEDecode"
        },
        "9": {
            "inputs": {
                "filename_prefix": "ComfyUI",
                "images": [
                    "8",
                    0
                ]
            },
            "class_type": "SaveImage"
        }
    }
}

const my = {
    "1": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": {
            "ckpt_name": "v1-5-dream-shaper.safetensors"
        }
    },
    "2": {
        "class_type": "CLIPTextEncode",
        "inputs": {
            "text": "beautiful mountain scenery",
            "CLIP": [
                "1",
                1
            ]
        }
    },
    "3": {
        "class_type": "CLIPTextEncode",
        "inputs": {
            "text": "",
            "CLIP": [
                "1",
                1
            ]
        }
    },
    "4": {
        "class_type": "KSampler",
        "inputs": {
            "seed": -1,
            "steps": 20,
            "cfg": 7,
            "sampler_name": "euler",
            "scheduler": "normal",
            "denoise": 1,
            "MODEL": [
                "1",
                0
            ],
            "LATENT_IMAGE": [
                "7",
                0
            ],
            "POSITIVE": [
                "2",
                0
            ],
            "NEGATIVE": [
                "3",
                0
            ]
        }
    },
    "5": {
        "class_type": "VAEDecode",
        "inputs": {
            "VAE": [
                "1",
                2
            ],
            "SAMPLES": [
                "4",
                0
            ]
        }
    },
    "7": {
        "class_type": "EmptyLatentImage",
        "inputs": {
            "width": 512,
            "height": 512,
            "batch_size": 1
        }
    },
    "node-c0fa4d74-454f-4be2-9bf8-881e1191c27a": {
        "class_type": "SaveImage",
        "inputs": {
            "filename_prefix": "ComfyUI",
            "IMAGES": [
                "5",
                0
            ]
        }
    }
}