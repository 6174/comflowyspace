import { memo } from 'react'
import { type NodeProps, Position, type HandleType, Handle } from 'reactflow'
import { type Widget, Input, type NodeId } from '@comflowy/common/comfui-interfaces';

import { getBackendUrl } from '@comflowy/common/config'
import { Button, Space } from 'antd';
import { InputContainer } from '../reactflow-input/reactflow-input-container';
import nodeStyles from "./reactflow-node.style.module.scss";
export const NODE_IDENTIFIER = 'sdNode'

interface ImagePreview {
  image: string
  index: number
}

interface Props {
  node: NodeProps<Widget>
  progressBar?: number
  imagePreviews?: ImagePreview[]
  onPreviewImage: (idx: number) => void
  onDuplicateNode: (id: NodeId) => void
  onDeleteNode: (id: NodeId) => void
}

function NodeComponent({
  node,
  progressBar,
  imagePreviews,
  onPreviewImage,
  onDuplicateNode,
  onDeleteNode,
}: Props): JSX.Element {
  const params = []
  const inputs = []
  for (const [property, input] of Object.entries(node.data.input.required)) {
    if (Input.isParameterOrList(input)) {
      params.push({ property, input })
    } else {
      inputs.push(property)
    }
  }

  const isInProgress = progressBar !== undefined

  return (
    <div className={nodeStyles.reactFlowNode}>
      <div className="node-header">
        <h2 className="node-title">{node.data.name}</h2>
        {isInProgress ? <div className="progress-bar bg-teal-800" style={{ width: `${progressBar * 100}%` }} /> : <></>}
        {node.selected ? (
          <div className="node-selected-actions">
            {/* <DocumentDuplicateIcon
              className="h-5 w-5 text-zinc-200 cursor-pointer"
              onClick={() => onDuplicateNode(node.id)}
            />
            <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" onClick={() => onDeleteNode(node.id)} />
            <ArrowsPointingInIcon className="h-5 w-5 text-blue-500 cursor-pointer" /> */}
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
            {node.data.output.map((k) => (
              <Slot key={k} id={k} label={k} type="source" position={Position.Right} />
            ))}
          </div>
        </div>
        <div className="node-params">
          {params.map(({ property, input }) => (
            <InputContainer key={property} name={property} id={node.id} input={input} />
          ))}
        </div>
        <div className="node-images-preview">
          {imagePreviews
            ?.map(({ image, index }) => (
              <div className="node-image-preview-container" key={image}>
                <img
                  className="node-preview-image"
                  src={getBackendUrl(`/view/${image}`)}
                  onClick={() => onPreviewImage(index)}
                />
              </div>
            ))
            .reverse()}
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

function Slot({ id, label, type, position }: SlotProps): JSX.Element {
  return (
    <div className={position === Position.Right ? 'node-slot node-slot-right' : 'node-slot node-slot-left'}>
      <Handle id={id} type={type} position={position} className="node-slot-handle" />
      <div className="node-slot-name" style={{ marginBottom: 2 }}>
        {label.toUpperCase()}
      </div>
    </div>
  )
}


