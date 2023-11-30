import { memo } from 'react'
import { type NodeProps, Position, type HandleType, Handle, Node, useStore } from 'reactflow'
import { type Widget, Input, type NodeId, SDNode, PreviewImage } from '@comflowy/common/comfui-interfaces';

import { getBackendUrl } from '@comflowy/common/config'
import { Button, Image, Progress, Space } from 'antd';
import { InputContainer } from '../reactflow-input/reactflow-input-container';
import nodeStyles from "./reactflow-node.style.module.scss";
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
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
  const params = []
  const inputs = []
  const widget = node.data.widget;
  if ((widget?.input?.required?.image?.[1] as any)?.image_upload === true) {
    widget.input.required.upload = ["IMAGEUPLOAD"];
  }
  for (const [property, input] of Object.entries(widget.input.required)) {
    if (Input.isParameterOrList(input)) {
      params.push({ property, input })
    } else {
      inputs.push(property)
    }
  }

  const isInProgress = progressBar !== undefined

  return (
    <div className={`${nodeStyles.reactFlowNode}  ${node.selected ? nodeStyles.reactFlowSelected : ""}`}>
      <div className="node-header">
        <h2 className="node-title">{widget.name}</h2>
        {isInProgress ? <Progress percent={progressBar * 100} size="small" /> : <></>}
        {node.selected ? (
          <div className="node-selected-actions">
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="node-main">
        <div className="node-slots">
          <div className="node-inputs">
            {inputs.map((k) => (
              <Slot key={k} id={k} label={k} type="target" position={Position.Left} />
            ))}
          </div>
          <div className="node-outputs">
            {widget.output.map((k) => (
              <Slot key={k} id={k} label={k} type="source" position={Position.Right} />
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
            imagePreviews && imagePreviews.map(image => {
              const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
              return (
                <div className="node-image-preview-container" key={image.filename}>
                  <Image
                    className="node-preview-image"
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
}

/**
 * https://reactflow.dev/examples/nodes/connection-limit
 * @param param0 
 * @returns 
 */
function Slot({ id, label, type, position }: SlotProps): JSX.Element {
  const color = Input.getInputColor([label.toUpperCase()] as any);
  const transform  = useStore((st => {
    return st.transform[2]
  }));
  return (
    <div className={position === Position.Right ? 'node-slot node-slot-right' : 'node-slot node-slot-left'}>
      <Handle id={id.toUpperCase()} type={type} position={position} className="node-slot-handle" style={{
        backgroundColor: color,
        transform: `scale(${Math.max(1, 1/transform)})`
      }}/>
      <div className="node-slot-name" style={{ marginBottom: 2 }}>
        {label.toUpperCase()}
      </div>
    </div>
  )
}


