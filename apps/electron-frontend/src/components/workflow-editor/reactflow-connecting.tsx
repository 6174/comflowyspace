import { PersistedWorkflowNode, Widget } from "@comflowy/common/types";
import { Connection, Edge, Node, OnConnectStartParams } from "reactflow";

export function onEdgeUpdateFailed(params: {
  event: MouseEvent,
  nodes: Node[],
  onConnect: (connection: Connection) => void;
  widgets: Record<string, Widget>,
  setWidgetTreeContext: (context: any) => void,
  connectingParams: OnConnectStartParams
}) {
  const { event, widgets, onConnect, setWidgetTreeContext, nodes, connectingParams } = params;
  try {
    const node = nodes.find(node => {
      return node.id === connectingParams.nodeId;
    });
    const nodeWidget = node.data.widget;
    let handleValueType = connectingParams.handleId;
    if (connectingParams.handleType !== "source") { 
      const handleInput = nodeWidget.input.required[handleValueType.toLowerCase()];
      handleValueType = handleInput[0];
    }
    // If connection params handle type is source, then search from widget inputs by edge handle id
    setWidgetTreeContext({
      position: {
        x: event.clientX,
        y: event.clientY
      },
      filter: (widget: Widget) => {
        try {
          if (connectingParams.handleType === "source") {
            // search from widget outputs 
            const inputs = Object.keys(widget.input.required || []);
            return inputs.some(inputKey => {
              const input = widget.input.required[inputKey];
              return input[0] === connectingParams.handleId;
            });
          } else {
            const output = (widget.output || []) as string[];
            if (output.indexOf(handleValueType) >= 0) {
              return true;
            }
          }
          return false;
        } catch(err) {
          return false;
        }
      },
      showCategory: false,
      onNodeCreated: (node: PersistedWorkflowNode) => {
        const widget = widgets[node.value.widget];
        setWidgetTreeContext(null);
        try {
          if (connectingParams.handleType === "source") {
            const inputs = widget.input.required;
            const inputKey = Object.keys(inputs).find(inputKey => {
              const input = inputs[inputKey];
              return input[0] === connectingParams.handleId;
            });
            if (inputKey) {
              onConnect({
                source: connectingParams.nodeId,
                sourceHandle: connectingParams.handleId,
                target: node.id,
                targetHandle: inputKey.toUpperCase()
              })
            }
          } else {
            if (widget.output?.indexOf(handleValueType as any) >= 0) {
              onConnect({
                target: connectingParams.nodeId,
                targetHandle: connectingParams.handleId,
                source: node.id,
                sourceHandle: handleValueType
              })
            }
          }
        } catch(err) {
          console.log("auto connect error", err);
        }
      }
    })
  } catch(err) {
    console.log("show create modal error", err);
  }
}