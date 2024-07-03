import { dt } from "@comflowy/common/i18n";
import { useAppStore } from "@comflowy/common/store";
import { validateEdge } from "@comflowy/common/store/app-state";
import { Input } from "@comflowy/common/types";
import { ALREADY_HAS_GLOBAL_VARIABLE_MESSAGE, isAnywhereWidget } from "@comflowy/common/types/comfy-variables.types";
import { use, useCallback, useEffect, useState } from "react";
import { type NodeProps, Position, type HandleType, Handle, NodeResizeControl, Connection, Dimensions } from 'reactflow'
import { message as AntMessage } from "antd";

export interface SlotProps {
  id: string
  node_id: string
  label: string
  type: HandleType
  position: Position
  valueType: string,
  widget: string
}

/**
 * https://reactflow.dev/examples/nodes/connection-limit
 * @param param0 
 * @returns 
 */
export function Slot({ id, label, type, position, valueType, widget, node_id }: SlotProps): JSX.Element {
  const color = Input.getInputColor([label.toUpperCase()] as any);
  const isConnecting = useAppStore(st => st.isConnecting);
  const connectingParams = useAppStore(st => st.connectingStartParams);
  const transform = useAppStore(st => st.transform);
  const [connectingMe, setConnectingMe] = useState(false);

  const isValidConnection = useCallback((connection: Connection) => {
    const st = useAppStore.getState();
    const [validate, message] = validateEdge(st, connection);
    !validate && console.log("connect failed", message)
    // if (!validate && message === ALREADY_HAS_GLOBAL_VARIABLE_MESSAGE) {
    //   AntMessage.error(ALREADY_HAS_GLOBAL_VARIABLE_MESSAGE)
    // }
    return validate
  }, []);

  useEffect(() => {
    if (isConnecting && connectingParams) {
      const sourceType = connectingParams.handleType;
      if (sourceType !== type) {
        if (connectingParams.valueType === valueType || valueType === "*") {
          setConnectingMe(true);
        }
      } else {
        setConnectingMe(false);
      }
    } else {
      setConnectingMe(false);
    }
  }, [isConnecting, connectingParams])

  let transformFactor = 1;
  const [hover, setHover] = useState(false);
  if (hover && !isConnecting) {
    transformFactor = Math.max(1, (1 / transform)) * 2.2;
  }

  if (isConnecting && connectingMe) {
    transformFactor = Math.max(1, (1 / transform)) * 2.8;
  };

  const slotLabel = useSlotLabel({ node_id, valueType, type, label });

  return (
    <div className={position === Position.Right ? 'node-slot node-slot-right' : 'node-slot node-slot-left'}>
      <Handle
        id={id.toUpperCase()}
        isConnectable={true}
        isValidConnection={isValidConnection}
        type={type}
        position={position}
        onMouseMove={ev => {
          setHover(true);
        }}
        onMouseOut={ev => {
          setHover(false);
        }}
        className="node-slot-handle"
        style={{
          backgroundColor: color,
          // visibility: (transforming || invisible)? "hidden" : "visible",
          transform: `scale(${transformFactor})`
        } as React.CSSProperties} />
      <div className="node-slot-name" style={{ marginBottom: 2 }}>
        {slotLabel}
      </div>
    </div>
  )
}

function useSlotLabel(props: {
  node_id: string,
  valueType: string,
  type: HandleType,
  label: string
}) {
  const widgets = useAppStore(st => st.widgets);
  const connection = useAppStore(st => {
    const all_connections = st.edges;
    return all_connections.find(edge => {
      return edge.target === props.node_id && edge.targetHandle === props.label.toUpperCase();
    });
  });
  const source_node = useAppStore(st => st.graph[connection?.source!]);
  const target_node = useAppStore(st => st.graph[props.node_id]);
  const target_node_widget = target_node?.widget;

  const casedLabel = props.type === "source" ? props.label.toUpperCase() : props.label.toLowerCase();
  let defaultLabel = (
    <span>
      {dt(`Nodes.${target_node_widget}.${props.type === "source" ? "outputs" : "inputs"}.${casedLabel}`, casedLabel)}
    </span>
  )

  // 如果是 anywhere widget，且有连接，返回连接的 sourceHandle
  if (connection && isAnywhereWidget(target_node_widget)) {
    const source_node_widget = widgets[source_node.widget];
    const source_outputs = source_node_widget.output;
    const source_output_names = source_node_widget.output_name;
    const source_output_index = source_outputs.findIndex((output) => output === connection.sourceHandle);
    const source_output_name = source_output_names[source_output_index]; 
    if (connection.targetHandle === "+VE") {
      return (
        <span>
          Positive
        </span>
      )
    }
    if (connection.targetHandle === "-VE") {
      return (
        <span>
          Negative
        </span>
      )
    }
    return (
      <span>
        {source_output_name}
      </span>
    )
  }

  return defaultLabel
}

