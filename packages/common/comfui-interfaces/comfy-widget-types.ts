import { FlowPropsKey, Input } from "./comfy-flow-props-types"

export type WidgetKey = string
/**
 * Stable Diffusion Widget Interface
 */
export interface Widget {
  name: WidgetKey
  display_name?: string
  description?: string
  category: string
  input: { required: Record<PropertyKey, Input> }
  output: FlowPropsKey[]
}

export const UnknownWidget: Widget = {
  name: "UNKNOWN_WIDGET",
  display_name: "Unknown",
  category: "Unknown",
  input: {required: {}},
  output: [],
};

export type Widgets = Record<WidgetKey, Widget>

export const Widget = {
  getDefaultFields(widget: Widget): Record<PropertyKey, any> {
    const fields: Record<PropertyKey, any> = {}
    for (const [key, input] of Object.entries(widget.input.required)) {
      if (Input.isBool(input)) {
        fields[key] = input[1].default ?? false
      } else if (Input.isFloat(input)) {
        fields[key] = input[1].default ?? 0.0
      } else if (Input.isInt(input)) {
        fields[key] = input[1].default ?? 0
      } else if (Input.isString(input)) {
        fields[key] = ''
      } else if (Input.isList(input)) {
        fields[key] = input[0][0]
      }
    }
    return fields
  },
  findSeedFieldName(widget: Widget): string | undefined {
    const inputs = widget.input.required;
    if (inputs.seed) {
      return 'seed'
    }
    if (inputs.noise_seed) {
      return 'noise_seed'
    }
    return
  }
}

export enum ContrlAfterGeneratedValues {
  Randomnized = "randomnized",
  Fixed = "fixed",
  Incremental = "incremental",
  Decremental = "decremental"
}

export const ContrlAfterGeneratedValuesOptions = Object.values(ContrlAfterGeneratedValues);

console.log("ContrlAfterGeneratedValuesOptions", ContrlAfterGeneratedValuesOptions);
