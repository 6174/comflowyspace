export type PropertyKey = string

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

export type Input = Parameter<keyof InputType> | [string[]] | [string[], {image_upload: boolean}] | FlowProps

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
    if (Input.isLatent(i) || Input.isImage(i)) {
      return '#7BD77A'
    }

    if (Input.isVae(i)) {
      return '#ED6A5E'
    }

    // YELLOW
    return '#92939B'
  }
}
