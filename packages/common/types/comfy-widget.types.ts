import { ContrlAfterGeneratedValues, FlowPropsKey, Input } from "./comfy-props.types"
export const NODE_GROUP = 'Group';
export const NODE_REROUTE = "Reroute";
export const NODE_PRIMITIVE = "PrimitiveNode";
export type WidgetKey = string
/**
 * Stable Diffusion Widget Interface
 */
export interface Widget {
  name: WidgetKey
  display_name?: string
  description?: string
  category: string
  input: {
    required: Record<PropertyKey, Input>,
    optional?: Record<PropertyKey, Input>,
  }
  output: FlowPropsKey[]
  output_name?: string[]
}

export const UnknownWidget: Widget = {
  name: "UNKNOWN_WIDGET",
  display_name: "Unknown",
  category: "Unknown",
  input: { required: {} },
  output: [],
};

export type Widgets = Record<WidgetKey, Widget>

export const Widget = {
  isSeedParam(param: string): boolean {
    return param === "seed" || param === "noise_seed"
  },
  isSaveImageNode(widgetName: string): boolean {
    const nodes = ["SaveImage", "SaveAnimatedWEBP"];
    return nodes.includes(widgetName);
  },
  findSeedFieldName(widget: Widget, inputSlots: string[] = []): string | undefined {
    const inputs = widget.input.required;
    if (inputs.seed && !inputSlots.includes("seed")) {
      return 'seed'
    }
    if (inputs.noise_seed && !inputSlots.includes("noise_seed")) {
      return 'noise_seed'
    }
    return
  },
  getControlledSeedValue(controlType: string, oldSeed: number = 0): number {
    const MAX_VALUE = 18446744073709551615;
    let newSeed = oldSeed;
    switch (controlType) {
      case "randomnized":
      case ContrlAfterGeneratedValues.Randomnized:
        newSeed = Math.random() * MAX_VALUE;
        break;
      case ContrlAfterGeneratedValues.Incremental:
        newSeed = Math.min(MAX_VALUE, oldSeed + 1);
        break;
      case ContrlAfterGeneratedValues.Decremental:
        newSeed = Math.max(-1, oldSeed - 1);
      default:
        break;
    }

    return newSeed
  },
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
  isStaticPrimitive(name: string): boolean {
    const types = ["STRING", "BOOLEAN", "INT", "FLOAT"];
    const type = name.split("_")[1];
    return types.indexOf(type) >= 0;
  },
  isPrimitive(name: string): boolean {
    return name === NODE_PRIMITIVE;
  }
}

export const specialWidgets = {
  Note: {
    "name": "Note",
    "display_name": "Note",
    "description": "Note",
    "input": {
      "required": {
        "text": [
          "STRING",
          {
            "multiline": true
          }
        ]
      }
    },
    "output": [],
    "category": "utils",
  },
  Group: {
    "name": NODE_GROUP,
    "display_name": NODE_GROUP,
    "description": "Group",
    "input": {
      "required": {}
    },
    "output": [],
    "category": "utils"
  },
  [NODE_PRIMITIVE]: {
    "name": NODE_PRIMITIVE,
    "display_name": NODE_PRIMITIVE,
    "description": "Primitive node can reference anthor node's primitive field as input",
    "input": {
      "required": {}
    },
    "output": [],
    "category": "utils"
  },
  Primitive_STRING: createPrimitiveWidget("STRING"),
  Primitive_BOOLEAN: createPrimitiveWidget("BOOLEAN"),
  Primitive_INT: createPrimitiveWidget("INT"),
  Primitive_FLOAT: createPrimitiveWidget("FLOAT"),
  Reroute: {
    "name": NODE_REROUTE,
    "input": {
      "required": {}
    },
    "output": [],
    "display_name": NODE_REROUTE,
    "description": NODE_REROUTE,
    "category": "utils",
  }
}

function createPrimitiveWidget(type: string) {
  return {
    "name": `Primitive_${type}`,
    "input": {
      "required": {}
    },
    "output": [
      type
    ],
    "display_name": `${type}`,
    "description": `Primitive type of ${type}`,
    "category": "utils",
  }
}
