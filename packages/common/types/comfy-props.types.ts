import { NodeId } from "./comfy-node.types";

export type PropertyKey = string
export type ComfyUIWorkflowNodeInput = {
  link?: number;
  name: string;
  type: FlowPropsKey | "*";
}

export type ComfyUIWorkflowNodeOutput = {
  links: number[];
  name: string;
  slot_index: number;
  type: string;
  shape?: number;
}

export type ComfyUIID = number | string;

export interface NumberProps<A> {
  default?: A
  min?: A
  max?: A
  randomizable?: boolean
}

export interface StringProps {
  multiline?: boolean
  dynamic_prompt?: boolean
}

export interface BoolProps {
  default?: boolean
}

export interface InputType {
  BOOL: [boolean, BoolProps]
  BOOLEAN: [boolean, BoolProps]
  INT: [number, NumberProps<number>]
  FLOAT: [number, NumberProps<number>]
  STRING: [string, StringProps]
}

export const FlowPropsArray = [ 
  "MODEL", 
  "CONDITIONING", 
  "LATENT", 
  "CLIP", 
  "VAE", 
  "IMAGE", 
  "MASK", 
  "CLIP_VISION", 
  "STYLE_MODEL", 
  "CLIP_VISION_OUTPUT", 
  "CONTROL_NET", 
  "GLIGEN", 
  "UPSCALE_MODEL", 
  "SAMPLER", 
  "SIGMAS",
  "IMAGEUPLOAD"
] as const;
export type FlowPropsKey = typeof FlowPropsArray[number]
export type FlowProps = [FlowPropsKey];
// export type FlowProps = 'MODEL' | 'CONDITIONING' | 'CLIP' | 'IMAGE' | 'LATENT' | 'CONTROL_NET' | 'MASK' | 'VAE'

type Parameter<K extends keyof InputType> = [K, InputType[K][1]]

export type FlowPrimitiveType = 'INT' | 'BOOL' | 'FLOAT' | 'STRING' | 'BOOLEAN';

export type Input = Parameter<keyof InputType> | [string[]] | [string[], {image_upload?: boolean, default?: string}] | FlowProps

export const Input = {
  getTypeName(i: Input): string {
    if (Input.isList(i)) {
      return 'LIST'
    }
    return i[0] as string;
  },

  isBool(i: Input): i is Parameter<'BOOL'> {
    return i[0] === 'BOOL' || i[0] === 'BOOLEAN'
  },

  isInt(i: Input): i is Parameter<'INT'> {
    return i[0] === 'INT'
  },

  isFloat(i: Input): i is Parameter<'FLOAT'> {
    return i[0] === 'FLOAT'
  },

  isString(i: Input): i is Parameter<'STRING'> {
    return i[0] === 'STRING'
  },

  isList(i: Input): i is [string[]] {
    return Array.isArray(i[0])
  },

  isModel(i: Input): i is FlowProps {
    return i[0] === 'MODEL'
  },

  isControlNet(i: Input): i is FlowProps {
    return i[0] === 'CONTROL_NET'
  },

  isClip(i: Input): i is FlowProps {
    return i[0] === 'CLIP'
  },
  
  isImage(i: Input): i is FlowProps {
    return i[0] === 'IMAGE'
  },

  isLatent(i: Input): i is FlowProps {
    return i[0] === 'LATENT'
  },

  isMask(i: Input): i is FlowProps {
    return i[0] === 'MASK'
  },

  isVae(i: Input): i is FlowProps {
    return i[0] === 'VAE'
  },

  isImageUpload(i: Input): i is FlowProps {
    return i[0] === 'IMAGEUPLOAD'
  },

  isConditioning(i: Input): i is FlowProps {
    return i[0] === 'CONDITIONING'
  },

  isParameterOrList(i: Input): boolean {
    return Input.isBool(i) || Input.isString(i) || Input.isInt(i) || Input.isFloat(i) || Input.isList(i) || Input.isImageUpload(i)
  },
  getInputColor(i: Input): string {
    // GREEN
    if (Input.isModel(i)) {
      return '#F4BD50'
    }
    // PURPLE
    if (Input.isClip(i) || Input.isString(i)) {
      return '#6F62FA'
    }
    // BLUE
    if (Input.isLatent(i)) {
      return '#7BD77A'
    }

    if (Input.isImage(i)) {
      return '#F762FA'
    }

    if (Input.isVae(i)) {
      return '#ED6A5E'
    }

    // YELLOW
    return '#92939B'
  }
}

export type SDNodeColorOption = {
  color: string,
  bgcolor?: string,
  label?: string,
}

export const SDNODE_COLORS: SDNodeColorOption[] = [
  {
    color: '#67A166',
    bgcolor: '#212A23',
    label: 'Green',
  }, {
    color: '#2ABDAE',
    bgcolor: '#21292A',
    label: 'Primary',
  }, {
    color: '#2AAFF7',
    bgcolor: '#21262A',
    label: 'Blue',
  }, {
    color: '#6F62FA',
    bgcolor: '#22212A',
    label: 'Purple',
  }, {
    color: '#F26344',
    bgcolor: '#271F1F',
    label: 'Red',
  }, {
    color: '#F4BD50',
    bgcolor: '#2A2621',
    label: 'Yellow',
  }, {
    color: '#939393',
    bgcolor: '#26262A',
    label: 'Gray',
  },
  {
    color: "#2E303B",
    bgcolor: "#26272F",
    label: 'Default',
  },
]

export const SDNODE_DEFAULT_COLOR = {
  color: "#2E303B",
  bgcolor: "#26272F",
  label: 'Default',
};

export interface PreviewImage {
  filename: string;
  subfolder?: string;
  type?: 'output'
}

export interface NodeInProgress {
  id: NodeId
  progress: number
}

export enum ContrlAfterGeneratedValues {
  Randomnized = "randomize",
  Fixed = "fixed",
  Incremental = "incremental",
  Decremental = "decremental"
}

export const ContrlAfterGeneratedValuesOptions = Object.values(ContrlAfterGeneratedValues);

export function getSubflowFieldId(nodeId: string, fieldName: string): string{
  return `${nodeId}__${fieldName}`
}

export function getSubflowSlotId(nodeId: string, slotName: string): string {
  return `${nodeId}__${slotName}`
}

export function parseSubflowSlotId(slotId: string): {nodeId: string, slotName: string} {
  const [nodeId, slotName] = slotId.split('__');
  return {nodeId, slotName}
}

export function parseSubflowFieldId(fieldId: string): {nodeId: string, fieldName: string} {
  const [nodeId, fieldName] = fieldId.split('__');
  return {nodeId, fieldName}
}
