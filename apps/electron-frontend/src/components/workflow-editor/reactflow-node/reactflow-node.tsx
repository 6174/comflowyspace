import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { type NodeProps, Position, type HandleType, Handle, NodeResizeControl, Connection, Dimensions} from 'reactflow'
import { Widget, Input, SDNode, PreviewImage, SDNODE_DEFAULT_COLOR, ContrlAfterGeneratedValuesOptions } from '@comflowy/common/comfui-interfaces';

import { Image, Popover } from 'antd';
import { InputContainer } from '../reactflow-input/reactflow-input-container';
import nodeStyles from "./reactflow-node.style.module.scss";
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import { ResizeIcon } from 'ui/icons';
import { useAppStore } from '@comflowy/common/store';
import { validateEdge } from '@comflowy/common/store/app-state';
import Color from "color";
import { getWidgetIcon } from './reactflow-node-icons';
import { PreviewGroupWithDownload } from '../reactflow-gallery/image-with-download';
import { ComfyUINodeError } from '@comflowy/common/comfui-interfaces/comfy-error-types';

export const NODE_IDENTIFIER = 'sdNode'

interface Props {
  node: NodeProps<{
    widget: Widget;
    value: SDNode;
    dimensions: Dimensions
  }>
  progressBar?: number;
  nodeError?: ComfyUINodeError;
  widget: Widget;
  imagePreviews?: PreviewImage[]
}

export const NodeComponent = memo(({
  node,
  nodeError,
  progressBar,
  widget,
  imagePreviews,
}: Props): JSX.Element => {
  const params: {property: string, input: Input}[] = []
  const nodeId = node.id;
  const inputs = node.data.value.inputs || [];
  const outputs = node.data.value.outputs || [];
  const nodeTitle = node.data.value.title || widget?.name;
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
  if (Widget.isPrimitive(widget.name)) {
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

  // if it has a seed, add seed control_after_generated param
  const seedFieldName = Widget.findSeedFieldName(widget);
  if (seedFieldName) {
    const index = params.findIndex(param => param.property === seedFieldName);
    params.splice(index + 1, 0, {
      property: "control_after_generated",
      input: [ContrlAfterGeneratedValuesOptions]
    });
  }

  const isInProgress = progressBar !== undefined
  const [minHeight, setMinHeight] = useState(100);
  const [minWidth] = useState(240);

  const mainRef = useRef<HTMLDivElement>();

  const onNodesChange = useAppStore(st => st.onNodesChange);

  const updateMinHeight = useCallback(async () => {
    if (mainRef.current) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 100)
      });
      if (!mainRef.current) {
        return
      }
      const height = mainRef.current.offsetHeight + 25 + (imagePreviews.length > 0 ? 200 : 0);
      const width = mainRef.current.offsetWidth + 4;
      const dimensions = node.data.dimensions
      // console.log("dimensions", height, dimensions);
      if (!dimensions || dimensions.height < height - 2) {
        onNodesChange([{
          type: "dimensions",
          id: nodeId,
          dimensions: {
            width: !!dimensions ? dimensions.width : width,
            height
          }
        }])
      }
      setMinHeight(height);
    }
  }, [setMinHeight, nodeId, imagePreviews]);
  
  const resetWorkflowEvent = useAppStore(st => st.resetWorkflowEvent);  
  const [resizing, setResizing] = useState(false);
  useEffect(() => {
    updateMinHeight();
    const disposable = resetWorkflowEvent.on(async () => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 100)
      });
      console.log("reset workflow event")
      updateMinHeight();
    })

    if (mainRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          if(entry.target === mainRef.current && !resizing) {
            updateMinHeight(); 
          }
        });
      });

      resizeObserver.observe(mainRef.current);

      // Cleanup
      return () => {
        if (resizeObserver && mainRef.current) {
          resizeObserver.unobserve(mainRef.current);
        }
        disposable.dispose();
      };
    }

    return () => {
      disposable.dispose();
    } 
  }, [mainRef])

  useEffect(() => {
    if (imagePreviews.length > 0) {
      updateMinHeight();
    }
  }, [imagePreviews])

  const resizeIcon = (
    <div className="resize-icon nodrag">
      <ResizeIcon/>
    </div>
  )
  const transform = useAppStore(st => st.transform);

  const invisible = transform < 0.2;

  const nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  const imagePreviewsWithSrc = (imagePreviews||[]).map((image, index) => {
    const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
    return {
      src: imageSrc,
      filename: image.filename
    }
  });
  return (
    <div className={`
      ${nodeStyles.reactFlowNode} 
      ${node.selected && !isInProgress && !nodeError ? nodeStyles.reactFlowSelected : ""} 
      ${isInProgress ? nodeStyles.reactFlowProgress : ""}
      ${isInProgress ? nodeStyles.reactFlowProgress : ""}
      ${nodeError ? nodeStyles.reactFlowError : ""}
      `} style={{
      '--node-color': node.data.value.color || SDNODE_DEFAULT_COLOR.color,
      '--node-border-color': Color(node.data.value.color || SDNODE_DEFAULT_COLOR.color).lighten(0.2).hex(),
      '--node-bg-color': (isInProgress || !!nodeError) ? nodeBgColor : Color(nodeBgColor).alpha(.95).hexa(),
    } as React.CSSProperties}>

      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none"
        }}
        onResizeStart={() => {
          setResizing(true);
        }}
        onResizeEnd={() => {
          setResizing(false);
        }}
        minWidth={minWidth}
        minHeight={minHeight} 
      >
        {node.selected && resizeIcon}
      </NodeResizeControl>

      {!invisible ? (
        <div className='node-inner'>
          <div className="node-header">
            <h2 className="node-title">
              {getWidgetIcon(widget)} {nodeTitle} <NodeError nodeError={nodeError}/>
            </h2>

            {isInProgress? 
              <div className="progress-bar">
                <div className="progress-indicator" style={{
                  width: `${progressBar * 100}%`
                }}></div>
              </div>
              : null}
            
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
                <InputContainer key={property} name={property} id={node.id} input={input} widget={widget} />
              ))}
            </div>
            <div style={{ height: 10 }}></div>
          </div>

          <div className={`node-images-preview ${imagePreviews.length > 1 ? "multiple" : "single"}`} >
            <div className="inner">
              <PreviewGroupWithDownload images={imagePreviewsWithSrc}>
              {
                imagePreviewsWithSrc.map((image, index) => {
                  return (
                    <Image
                      key={image.src + index}
                      className="node-preview-image"
                      src={image.src}
                    />
                  )
                })
              }
              </PreviewGroupWithDownload>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="node-header"></div>
          <div className="node-main"></div>
        </>
      )}
    </div>
  )
});

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
        } as React.CSSProperties}/>
      <div className="node-slot-name" style={{ marginBottom: 2 }}>
        {type === "source" ? label.toUpperCase() : label.toLowerCase()}
      </div>
    </div>
  )
}

function NodeError({ nodeError }: { nodeError?: ComfyUINodeError }) {
  const [visible, setVisible] = useState(false);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  if (!nodeError) {
    return null
  }

  const errorsEl = (
    <div className={nodeStyles.nodeErrors}>
      {nodeError.errors.map((error, index) => (
        <div key={index} className="node-error">
          {error.message + ":" + error.details}
        </div>
      ))}
    </div>
  )

  return (
    <div className={nodeStyles.nodeErrorWrapper}>
      <Popover
        title={null}
        content={errorsEl}
        trigger="hover"
      >
        Errors
      </Popover>
    </div>
  )
}


