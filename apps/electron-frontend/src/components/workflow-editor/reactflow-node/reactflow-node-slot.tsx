import { useAppStore } from "@comflowy/common/store";
import { validateEdge } from "@comflowy/common/store/app-state";
import { Input } from "@comflowy/common/types";
import { useCallback, useEffect, useState } from "react";
import { type NodeProps, Position, type HandleType, Handle, NodeResizeControl, Connection, Dimensions } from 'reactflow'

export interface SlotProps {
  id: string
  label: string
  type: HandleType
  position: Position
  valueType: string
}

/**
 * https://reactflow.dev/examples/nodes/connection-limit
 * @param param0 
 * @returns 
 */
export function Slot({ id, label, type, position, valueType }: SlotProps): JSX.Element {
  const color = Input.getInputColor([label.toUpperCase()] as any);
  const isConnecting = useAppStore(st => st.isConnecting);
  const connectingParams = useAppStore(st => st.connectingStartParams);
  const transform = useAppStore(st => st.transform);
  const [connectingMe, setConnectingMe] = useState(false);
  const isValidConnection = useCallback((connection: Connection) => {
    const st = useAppStore.getState();
    const [validate, message] = validateEdge(st, connection);
    !validate && console.log("connect failed", message)
    return validate
  }, [])
  useEffect(() => {
    if (isConnecting && connectingParams) {
      const sourceType = connectingParams.handleType;
      if (sourceType !== type && connectingParams.valueType === valueType) {
        setConnectingMe(true);
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

  if (isValidConnection && isConnecting && connectingMe) {
    transformFactor = Math.max(1, (1 / transform)) * 2.8;
  };

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
        {type === "source" ? label.toUpperCase() : label.toLowerCase()}
      </div>
    </div>
  )
}
