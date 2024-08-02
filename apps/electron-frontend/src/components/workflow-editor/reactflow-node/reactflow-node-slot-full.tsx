import { useAppStore } from "@comflowy/common/store";
import { ComfyUIWorkflowNodeInput, ComfyUIWorkflowNodeOutput } from "@comflowy/common/types";
import { useCallback, useEffect, useState } from "react";
import { Connection, type HandleType, OnConnectStartParams } from 'reactflow'

export type ConnectingMeContext = {
  connectingParams: OnConnectStartParams & {
    valueType: string;
  },
  selectSlot: {
    type: HandleType,
    slot: ComfyUIWorkflowNodeInput | ComfyUIWorkflowNodeOutput
  }
}

export function useFullNodeConnecting({ widget, node_id, inputs, outputs }: {
  widget: string,
  node_id: string
  inputs: ComfyUIWorkflowNodeInput[],
  outputs: ComfyUIWorkflowNodeOutput[]
}) {
  const isConnecting = useAppStore(st => st.isConnecting);
  const [tryConnectThisNode, setTryConnectThisNode] = useState(false);
  const connectingParams = useAppStore(st => st.connectingStartParams);
  const [hoveringSlot, setHoveringSlot] = useState(false);
  const [connectContext, setConnectContext] = useState<ConnectingMeContext | null>(null);
  inputs = inputs || [];
  outputs = outputs || [];

  const onMouseEnter = useCallback(() => {
    if (isConnecting && connectingParams) {
      if (connectingParams.nodeId !== node_id) {
        setTryConnectThisNode(true);
      }
    }
  }, [isConnecting, connectingParams, node_id])

  const onMouseLeave = useCallback(() => {
    if (tryConnectThisNode) {
      setTryConnectThisNode(false);
    }
  }, [tryConnectThisNode]);

  const onMouseUp = useCallback(() => {
    if (connectContext && !hoveringSlot) {
      const newConnection: Connection = {
        source: connectContext.selectSlot.type === "source" ? node_id : connectContext.connectingParams.nodeId,
        target: connectContext.selectSlot.type === "target" ? node_id : connectContext.connectingParams.nodeId,
        sourceHandle: connectContext.selectSlot.type === "source" ? connectContext.selectSlot.slot.name.toUpperCase() : connectContext.connectingParams.handleId,
        targetHandle: connectContext.selectSlot.type === "target" ? connectContext.selectSlot.slot.name.toUpperCase() : connectContext.connectingParams.handleId,
      }
      useAppStore.getState().onConnect(newConnection);
    }
  }, [connectContext, hoveringSlot]);

  const onMouseMove = useCallback((ev) => {
    if (tryConnectThisNode) {
      if (ev?.target && typeof ev.target.className === "string" && ev.target.className.includes("node-slot-handle")) {
        setHoveringSlot(true)
      } else {
        setHoveringSlot(false)
      }
    }
  }, [tryConnectThisNode]);

  useEffect(() => {
    if (!tryConnectThisNode) {
      setConnectContext(undefined)
      return
    }

    if (connectingParams) {
      const connectingType = connectingParams.handleType;
      const connectingValueType = connectingParams.valueType;
      if (connectingType === "source") {
        const targetSlot = inputs.find(input => input.type.toUpperCase() === connectingValueType || connectingValueType === "*");
        if (targetSlot) {
          setConnectContext({
            connectingParams: connectingParams,
            selectSlot: {
              type: "target",
              slot: targetSlot
            }
          })
          return
        }
      }

      if (connectingType === "target") {
        const sourceSlot = outputs.find(output => output.name.toUpperCase() === connectingValueType || connectingValueType === "*");
        if (sourceSlot) {
          setConnectContext({
            connectingParams: connectingParams,
            selectSlot: {
              type: "source",
              slot: sourceSlot
            }
          })
          return
        }
      }

      setConnectContext(undefined)
    }
  }, [connectingParams, inputs, outputs, tryConnectThisNode])

  const connectingIndicator = hoveringSlot ? undefined : <NodeConnectIndicator connectContext={connectContext} />;

  return {
    tryConnectThisNode,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    connectContext,
    connectingIndicator
  }
}


function NodeConnectIndicator({ connectContext }: {
  connectContext: ConnectingMeContext | null
}): JSX.Element {
  if (!connectContext) {
    return null
  }

  const { connectingParams, selectSlot } = connectContext;

  return (
    <div className={`node-slot-fullsize`}>
      <div className="label">Release mouse to connect to {selectSlot.slot.name}</div>
    </div>
  )
}
