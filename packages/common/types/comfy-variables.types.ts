import { Connection } from "reactflow";
import { AppState } from "../store/app-state";
import { PersistedWorkflowConnection } from "./comfy-connection.types";
import { PersistedWorkflowNode } from "./comfy-node.types";
import { NODE_ANYTHING_EVERYWHERE, NODE_ANYTHING_EVERYWHERE3, NODE_ANYTHING_EVERYWHERE_PROMPT, NODE_ANYTHING_EVERYWHERE_REGEX, NODE_ANYTHING_EVERYWHERE_SEED, NODE_GET_SELECT_FIELD_NAME, NODE_SET, Widget } from "./comfy-widget.types";
import { PersistedWorkflowDocument } from "./comfy-workflow.types";

export type ComfyGraphVar = {
  name: string;
  type: string;
  connection: PersistedWorkflowConnection,
  source_node: PersistedWorkflowNode,
  target_node: PersistedWorkflowNode
}

export type ComfyGraphRegexVar = ComfyGraphVar & {
  // filter input field value
  input_regex?: string,
  // filter node title
  title_regex?: string
  // filter group name
  group_regex?: string
}

export type ComfyGraghVariables = {
  regex: Record<string, ComfyGraphRegexVar>;
  setter: Record<string, ComfyGraphVar>;
  global: Record<string, ComfyGraphVar>;
}


export function isFieldMatchRegexVar(node_title: string, input_name: string, var_info: ComfyGraphRegexVar): boolean {
  if (var_info.title_regex) {
    const regex = new RegExp(var_info.title_regex);
    return regex.test(node_title);
  }

  if (var_info.input_regex) {
    const regex = new RegExp(var_info.input_regex);
    return regex.test(input_name);
  }
  
  return true;
}

export function getDefaultComfyGraphVars(): ComfyGraghVariables {
  return {
    global: {},
    setter: {},
    regex: {}
  }
}

/**
 * 获取一个变量对应的值
 * @param item 
 */
export function getGraphVarPromptValue(item: ComfyGraphVar): any {
  const source_node = item.source_node;
  const ret = [source_node.id, 0];
  ret[1] = source_node.value.outputs.findIndex((output) => output.name.toUpperCase() === item.type);
  return ret;
}

/**
 * 判断是否是 anywhere widget
 * @param widgetName 
 * @returns 
 */
export function isAnywhereWidget(widgetName: string): boolean {
  return [
    NODE_ANYTHING_EVERYWHERE,
    NODE_ANYTHING_EVERYWHERE3,
    NODE_ANYTHING_EVERYWHERE_PROMPT,
    NODE_ANYTHING_EVERYWHERE_REGEX,
    // NODE_ANYTHING_EVERYWHERE_SEED
  ].includes(widgetName);
}

/**
 * 在连接的时候校验是否可以连接到 anywhere 类型的节点
 * @param st 
 * @param connection 
 * @returns 
 */
export function validateAnywhereEdge(st: AppState, connection: Connection): [boolean, string] {
  const { source, sourceHandle, target, targetHandle } = connection;
  const sourceNode = st.graph[source!];
  const targetNode = st.graph[target!];
  const sourceOutputs = sourceNode.outputs;
  const sourceWidget = st.widgets[sourceNode.widget];
  if (targetHandle === "*") {
    return [false, "success"];
  }

  if (Widget.isLocalWidget(sourceWidget)) {
    return [false, "can't use anywhere for local widget"]
  }

  // 判断是否已经有了对应的全局变量定义了
  const vars = st.gragh_variables;
  const possible_global_var_names = [sourceHandle!,`${sourceHandle!}.positive`, `${sourceHandle!}.negative`];

  const has_var_info = possible_global_var_names.find(var_name => {
    const var_info = vars.global[var_name];
    if (var_info) {
      return true;
    }
    return false;
  })

  if (has_var_info) {
    return [false, "Already has a global variable of this type"]
  }

  return [true, "success"]
}

/**
 * 通过 Graph 解析获取基于节点配置的方式形成的各种变量，比如 GetNode, SetNode, AnythingEveryWhere 等
 * @param workflow 
 * @param widgets 
 * @returns 
 */
export function parseGraphVariables(workflow: PersistedWorkflowDocument, widgets: Record<string, Widget>): ComfyGraghVariables {
  const vars = getDefaultComfyGraphVars();
  const nodesMap = workflow.nodes
  const connections = workflow.connections;

  connections.forEach(conn => {
    const source_node = nodesMap[conn.source];
    const target_node = nodesMap[conn.target];
    const target_widget_name = target_node.value.widget;
    const source_widget = widgets[source_node.value.widget];

    // 如果 source 判断是本地的 widget 则不能把它的 output 作为变量，比如 reroute，const 等
    if (Widget.isLocalWidget(source_widget)) {
      return
    }

    // source 的输出具体信息找出来
    const output_handle = conn.sourceHandle as any;
    const outputs = source_widget.output;
    const outputs_names = source_widget.output_name;
    const output_name = outputs_names ? outputs_names[outputs.indexOf(output_handle)] : output_handle;

    // target port 的信息
    const target_handle = conn.targetHandle;

    const var_info: ComfyGraphVar = {
      name: output_name,
      type: output_handle,
      connection: conn,
      source_node,
      target_node
    }

    switch (target_widget_name) {
      case NODE_ANYTHING_EVERYWHERE3:
      case NODE_ANYTHING_EVERYWHERE:
        vars.global[output_handle] = var_info
        break;
      case NODE_ANYTHING_EVERYWHERE_PROMPT:
        if (target_handle == "+ve") {
          vars.global["conditioning.positive"] = {
            ...var_info,
            name: "conditioning.positive"
          }
        }
        if (target_handle == "-ve") {
          vars.global["conditioning.negative"] = {
            ...var_info,
            name: "conditioning.negative"
          }
        }
        break;
      case NODE_ANYTHING_EVERYWHERE_REGEX:
        vars.regex[output_handle] = {
          ...var_info,
          input_regex: target_node.value.fields.input_regex || ".*",
          title_regex: target_node.value.fields.title_regex || ".*",
          group_regex: target_node.value.fields.group_regex || ".*"
        }
        break;
      case NODE_SET: 
        const key = target_node.value.fields[NODE_GET_SELECT_FIELD_NAME]
        vars.setter[key] = var_info
        break;
    }
  })

  return vars;
}

const anythingEverywhere3 = {
  "input": {
    "required": {},
    "optional": {
      "anything": [
        "*",
      ],
      "anything2": [
        "*"
      ],
      "anything3": [
        "*"
      ]
    }
  },
  "output": [],
  "output_name": [],
  "name": "Anything Everywhere3",
  "display_name": "Anything Everywhere3",
  "description": "",
  "category": "everywhere"
}

const anythingEverywhereQ = {
  "input": {
    "required": {},
    "optional": {
      "anything": [
        "*",
      ],
      "title_regex": [
        "STRING",
        {
          "default": ".*"
        }
      ],
      "input_regex": [
        "STRING",
        {
          "default": ".*"
        }
      ],
      "group_regex": [
        "STRING",
        {
          "default": ".*"
        }
      ]
    },
    "hidden": {
      "id": "UNIQUE_ID"
    }
  },
  "output": [],
  "output_is_list": [],
  "output_name": [],
  "name": "Anything Everywhere?",
  "display_name": "Anything Everywhere?",
  "description": "",
  "category": "everywhere",
  "output_node": true
}

const a = {
  "input": {
    "required": {},
    "optional": {
      "anything": [
        "*",
        {}
      ]
    },
    "hidden": {
      "id": "UNIQUE_ID"
    }
  },
  "output": [],
  "output_is_list": [],
  "output_name": [],
  "name": "Anything Everywhere",
  "display_name": "Anything Everywhere",
  "description": "",
  "category": "everywhere",
  "output_node": true
}

const promptEveryWhere = {
  "input": {
    "required": {},
    "optional": {
      "+ve": [
        "*",
        {}
      ],
      "-ve": [
        "*",
        {}
      ]
    }
  },
  "output": [],
  "output_is_list": [],
  "output_name": [],
  "name": "Prompts Everywhere",
  "display_name": "Prompts Everywhere",
  "description": "",
  "category": "everywhere",
  "output_node": true
}

const seedEveryWhere = {
  "input": {
    "required": {
      "seed": [
        "INT",
        {
          "default": 0,
          "min": 0,
          "max": 18446744073709552000
        }
      ]
    },
    "hidden": {
      "id": "UNIQUE_ID"
    }
  },
  "output": [
    "INT"
  ],
  "output_is_list": [
    false
  ],
  "output_name": [
    "INT"
  ],
  "name": "Seed Everywhere",
  "display_name": "Seed Everywhere",
  "description": "",
  "category": "everywhere",
  "output_node": true
}