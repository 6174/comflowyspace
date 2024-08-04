import { Edge } from "reactflow";
import { ContrlAfterGeneratedValues, FlowPropsKey, Input } from "./comfy-props.types"
import { SDNode } from "./comfy-node.types";
export const NODE_GROUP = 'Group';
export const NODE_REROUTE = "Reroute";
export const NODE_PRIMITIVE = "PrimitiveNode";
export const NODE_GET = "GetNode";
export const NODE_SET = "SetNode";
export const NODE_GET_SELECT_FIELD_NAME = "Constant";
export const NODE_IMAGE_COMPARE = "ImageCompare";
export const NODE_VHS_COMBINE = "VHS_VideoCombine";

export const NODE_ANYTHING_EVERYWHERE = "Anything Everywhere";
export const NODE_ANYTHING_EVERYWHERE3 = "Anything Everywhere3";
export const NODE_ANYTHING_EVERYWHERE_PROMPT = "Prompts Everywhere";
export const NODE_ANYTHING_EVERYWHERE_REGEX = "Anything Everywhere?";
export const NODE_ANYTHING_EVERYWHERE_SEED = "Seed Everywhere";
export const NODE_UNKNOWN = "UNKNOWN_WIDGET"

export type WidgetKey = string
/**
 * Stable Diffusion Widget Interface
 */
export interface Widget {
  name: WidgetKey
  display_name?: string
  description?: string
  unknown?: boolean;
  category: string
  input: {
    required: Record<PropertyKey, Input>,
    optional?: Record<PropertyKey, Input>,
  }
  output: FlowPropsKey[]
  output_name?: string[]
  python_module: string
}

export const UnknownWidget: Widget = {
  name: NODE_UNKNOWN,
  display_name: "Unknown",
  category: "Unknown",
  unknown: true,
  input: { required: {} },
  output: [],
  python_module: "frontend"
};

export type Widgets = Record<WidgetKey, Widget>


export const Widget = {
  isLocalWidget(widget: Widget): boolean {
    return (
      Widget.isPrimitive(widget.name) ||
      widget.name === "Note" ||
      widget.name === "Group" ||
      Widget.isStaticPrimitive(widget.name) ||
      widget.name === NODE_REROUTE ||
      widget.name === NODE_SET ||
      widget.name === NODE_GET ||
      widget.name === NODE_IMAGE_COMPARE
    )
  },
  isSeedParam(param: string): boolean {
    return param === "seed" || param === "noise_seed"
  },
  isSaveImageNode(widgetName: string,): boolean {
    // 保存到 gallery 的节点
    const nodes = ["SaveImage", "SaveAnimatedWEBP", "VHS_VideoCombine", "easy imageSave", "AnimateDiffCombine"];
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
    for (const [key, input] of Object.entries(widget.input.required || {})) {
      if (Input.isBool(input)) {
        fields[key] = input[1]?.default ?? false
      } else if (Input.isFloat(input)) {
        fields[key] = input[1]?.default ?? 0.0
      } else if (Input.isInt(input)) {
        fields[key] = input[1]?.default ?? 1
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


export enum FrontEndWidgetNames {
  GetNode = "GetNode",
  SetNode = "SetNode",
  Reroute = "Reroute"
}

export const specialWidgets: Record<string, Widget> = {
  SetNode: {
    name: "SetNode",
    display_name: "Set Node",
    description: "Set Node",
    category: "utils",
    input: {
      required: {
        "Constant": ["STRING", {}]
      }
    },
    output: [],
    python_module: "frontend"
  },
  GetNode: {
    name: "GetNode",
    display_name: "Get Node",
    description: "Get Node",
    category: "utils",
    input: {
      required: {},
      optional: {
        "Constant": ["STRING", {}]
      }
    },
    output: [],
    python_module: "frontend"
  },
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
    python_module: "frontend"
  },
  Group: {
    "name": NODE_GROUP,
    "display_name": NODE_GROUP,
    "description": "Group",
    "input": {
      "required": {}
    },
    "output": [],
    "category": "utils",
    python_module: "frontend"
  },
  [NODE_PRIMITIVE]: {
    "name": NODE_PRIMITIVE,
    "display_name": NODE_PRIMITIVE,
    "description": "Primitive node can reference anthor node's primitive field as input",
    "input": {
      "required": {}
    },
    "output": [],
    "category": "utils",
    python_module: "frontend"
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
    python_module: "frontend"
  }
}

function createPrimitiveWidget(type: string): Widget {
  return {
    "name": `Primitive_${type}`,
    "input": {
      "required": {}
    },
    "output": [
      type as any
    ],
    "display_name": `${type}`,
    "description": `Primitive type of ${type}`,
    "category": "utils",
    python_module: "frontend"
  }
}

export type SetNodeInfo = {
  id: string,
  reference: {
    id: string,
    referenceNode: SDNode,
    referenceField: string,
    edge: Edge
  },
  field: string
};