import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { type NodeProps, Position, type HandleType, Handle, Node, useStore, NodeResizer, NodeResizeControl, Connection} from 'reactflow'
import { type Widget, Input, type NodeId, SDNode, PreviewImage, SDNODE_DEFAULT_COLOR } from '@comflowy/common/comfui-interfaces';

import { Button, Image, Progress, Space } from 'antd';
import { InputContainer } from '../reactflow-input/reactflow-input-container';
import nodeStyles from "./reactflow-node.style.module.scss";
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import { ResizeIcon } from 'ui/icons';
import { useAppStore } from '@comflowy/common/store';
import { validateEdge } from '@comflowy/common/store/app-state';
import Color from "color";
export const NODE_IDENTIFIER = 'sdNode'

interface Props {
  node: NodeProps<{
    widget: Widget;
    value: SDNode;
  }>
  progressBar?: number
  imagePreviews?: PreviewImage[]
  onDuplicateNode: (id: NodeId) => void
  onNodesDelete: (nodes: Node[]) => void
}

function NodeComponent({
  node,
  progressBar,
  imagePreviews,
  onDuplicateNode,
  onNodesDelete,
}: Props): JSX.Element {
  const params: {property: string, input: Input}[] = []
  const widget = node.data.widget;
  const inputs = node.data.value.inputs || [];
  const outputs = node.data.value.outputs || [];
  const nodeTitle = node.data.value.title || widget.name;
  const inputKeys = inputs.map(input => input.name);

  if ((widget?.input?.required?.image?.[1] as any)?.image_upload === true) {
    widget.input.required.upload = ["IMAGEUPLOAD"];
  }

  for (const [property, input] of Object.entries(widget.input.required)) {
    if (!inputKeys.includes(property)) {
      params.push({ property, input })
    }
  }

  // If it is a primitive node , add according primitive type params
  if (widget.name === "PrimitiveNode") {
    const paramType = node.data.value.outputs[0].type;
    const extraInfo: any = {};
    if (paramType === "STRING") {
      extraInfo.multiline = true;
    } else if (paramType === "BOOLEAN") {
      extraInfo.default = true;
    }
    params.push({
      property: paramType,
      input: [paramType as any, extraInfo]
    })
  }

  const isInProgress = progressBar !== undefined
  const [minHeight, setMinHeight] = useState(100);
  const [minWidth, setMinWidth] = useState(180);
  const mainRef = useRef<HTMLDivElement>();

  const updateMinHeight = () => {
    if (mainRef.current) {
      setMinHeight(mainRef.current.clientHeight + 25)
    }
  }

  useEffect(() => {
    updateMinHeight();
  }, [mainRef])

  const resizeIcon = (
    <div className="resize-icon">
      <ResizeIcon/>
    </div>
  )

  return (
    <div className={`${nodeStyles.reactFlowNode}  ${(node.selected || isInProgress) ? nodeStyles.reactFlowSelected : ""}`} style={{
      '--node-color': node.data.value.color || SDNODE_DEFAULT_COLOR.color,
      '--node-border-color': Color(node.data.value.color || SDNODE_DEFAULT_COLOR.color).lighten(0.2).hex(),
      '--node-bg-color': node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor,
    } as React.CSSProperties}>
      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none"
        }}
        minWidth={minWidth}
        minHeight={minHeight} 
      >
        {node.selected && resizeIcon}
      </NodeResizeControl>

      <div className="node-header">
        <h2 className="node-title">{ nodeTitle }</h2>

        {isInProgress ? <Progress
            percent={progressBar * 100} 
            style={{
              position: "absolute",
              top: 14,
              left: 0,
              width: "100%",
              height: 4,
              zIndex: 1,
              borderRadius: 0
            }} 
            showInfo={false} 
            size="small" /> : <></>}
        {node.selected ? (
          <div className="node-selected-actions">
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="node-main" ref={mainRef}>

        <div className="node-slots">
          <div className="node-inputs">
            {inputs.map((input, index) => (
              <Slot key={input.name + index} valueType={input.type} id={input.name} label={input.name} type="target" position={Position.Left} />
            ))}
          </div>
          <div className="node-outputs">
            {outputs.map((output, index) => (
              <Slot key={output.name + index} valueType={output.type} id={output.name} label={output.name} type="source" position={Position.Right} />
            ))}
          </div>
        </div>

        <div className="node-params">
          {params.map(({ property, input }) => (
            <InputContainer key={property} name={property} id={node.id} input={input} widget={widget}/>
          ))}
        </div>
          
        <div className="node-images-preview">
          {
            imagePreviews && imagePreviews.map((image, index) => {
              const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
              return (
                <div className="node-image-preview-container" key={image.filename} style={{
                  display: "flex",
                  marginTop: 10,
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <Image
                    className="node-preview-image"
                    onLoadCapture={ev => {
                      console.log("onload capture");
                      setMinHeight(mainRef.current.clientHeight + 25)
                    }}
                    // ref={image => {
                    //   console.log("find ref image");
                    //   image && image.complete && updateMinHeight();
                    // }}
                    // onLoad={ev => {
                    //   console.log("onload capture"); 
                    // }}
                    src={imageSrc}
                    style={{
                      maxWidth: 200,
                      maxHeight: 200
                    }}
                    onClick={ev => {
                      console.log("preview");
                    }}
                  />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default memo(NodeComponent)

interface SlotProps {
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
function Slot({ id, label, type, position, valueType }: SlotProps): JSX.Element {
  const color = Input.getInputColor([label.toUpperCase()] as any);
  const isConnecting = useAppStore(st => st.isConnecting);
  const connectingParams = useAppStore(st => st.connectingStartParams);

  const transform  = useStore((st => {
    return st.transform[2]
  }));
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

  const scaleFactor = (isValidConnection && isConnecting && connectingMe) ? 4 : 1;

  return (
    <div className={position === Position.Right ? 'node-slot node-slot-right' : 'node-slot node-slot-left'}>
      <Handle 
        id={id.toUpperCase()} 
        isConnectable={true}
        isValidConnection={isValidConnection}
        type={type} 
        position={position} 
        className="node-slot-handle" 
        style={{
          backgroundColor: color,
          transform: `scale(${Math.max(1, (1/transform) * scaleFactor)})`
        }}/>
      <div className="node-slot-name" style={{ marginBottom: 2 }}>
        {type === "source" ? label.toUpperCase() : label.toLowerCase()}
      </div>
    </div>
  )
}


