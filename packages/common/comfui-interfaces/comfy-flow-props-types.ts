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
  INT: [number, NumberProps<number>]
  FLOAT: [number, NumberProps<number>]
  STRING: [string, StringProps]
}

export type FlowProps = 'MODEL' | 'CONDITIONING' | 'CLIP' | 'IMAGE' | 'LATENT' | 'CONTROL_NET' | 'MASK'

type Parameter<K extends keyof InputType> = [K, InputType[K][1]]

export type Input = Parameter<keyof InputType> | [string[]] | [FlowProps]

export const Input = {
  isBool(i: Input): i is Parameter<'BOOL'> {
    return i[0] === 'BOOL'
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

  isParameterOrList(i: Input): boolean {
    return Input.isBool(i) || Input.isInt(i) || Input.isFloat(i) || Input.isString(i) || Input.isList(i)
  },
}