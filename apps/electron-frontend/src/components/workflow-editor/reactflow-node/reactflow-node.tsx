import { MutableRefObject, memo, useCallback, useEffect, useRef, useState } from 'react'
import { type NodeProps, Position, NodeResizeControl, Dimensions} from 'reactflow'
import { Widget, SDNode, PreviewImage, SDNODE_DEFAULT_COLOR } from '@comflowy/common/types';
import { Image } from 'antd';
import { InputContainer } from '../reactflow-input/reactflow-input-container';
import nodeStyles from "./reactflow-node.style.module.scss";
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import { ResizeIcon } from 'ui/icons';
import { useAppStore } from '@comflowy/common/store';
import Color from "color";
import { getWidgetIcon } from './reactflow-node-icons';
import { PreviewGroupWithDownload } from '../reactflow-gallery/image-with-download';
import { ComfyUINodeError } from '@comflowy/common/types';
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { Slot } from './reactflow-node-slot';
import { InstallMissingWidget, NodeError } from './reactflow-node-errors';
export const NODE_IDENTIFIER = 'sdNode'

interface Props {
  node: NodeProps<{
    widget: Widget;
    value: SDNode;
    dimensions: Dimensions
  }>
  isPositive: boolean;
  isNegative: boolean;
  progressBar?: number;
  nodeError?: ComfyUINodeError;
  widget: Widget;
  imagePreviews?: PreviewImage[]
}

export const NodeComponent = memo(({
  node,
  nodeError,
  progressBar,
  isPositive,
  isNegative,
  widget,
  imagePreviews,
}: Props): JSX.Element => {
  const { inputs, title, outputs, params } = getNodeRenderInfo(node);
  const isInProgress = progressBar !== undefined
  const {mainRef, minHeight, minWidth, setResizing} = useNodeAutoResize(node, imagePreviews);

  const transform = useAppStore(st => st.transform);
  const invisible = transform < 0.2;
  
  let nodeColor = node.data.value.color || SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = node.data.value.bgcolor || SDNODE_DEFAULT_COLOR.bgcolor;

  if (isPositive) {
    nodeBgColor = "#212923";
    nodeColor = "#67A166";
  } 

  if (isNegative) {
    nodeBgColor = "#261E1F";
    nodeColor = "#DE654B";
  }

  const imagePreviewsWithSrc = (imagePreviews || []).map((image, index) => {
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
      ${isPositive ? "positive-node" : ""}
      ${isNegative ? "negative-node" : ""}
      `} style={{
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
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
        {node.selected && (
          <div className="resize-icon nodrag">
            <ResizeIcon />
          </div>
        )}
      </NodeResizeControl>

      {!invisible ? (
        <div className='node-inner'>
          <div className="node-header">
            <h2 className="node-title">
              {getWidgetIcon(widget)} 
              {title} 
              {isPositive && <span>{"("}Positive{")"}</span>} 
              {isNegative && <span>{"("}Negative{")"}</span>} 
              <NodeError nodeError={nodeError}/>
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
                <InputContainer key={property} name={property} id={node.id} node={node.data.value} input={input} widget={widget} />
              ))}
            </div>
            <InstallMissingWidget nodeError={nodeError} node={node.data.value} />
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

/**
 * Auto resize node based on content
 * @param node 
 * @param imagePreviews 
 * @returns
 */
export function useNodeAutoResize(node: NodeProps<any>, imagePreviews: PreviewImage[]): {
  minHeight: number;
  minWidth: number;
  mainRef: MutableRefObject<HTMLDivElement>;
  setResizing: (resizing: boolean) => void;
} {
  const mainRef = useRef<HTMLDivElement>();
  const [minHeight, setMinHeight] = useState(100);
  const [minWidth] = useState(240);
  const onNodesChange = useAppStore(st => st.onNodesChange);
  const [resizing, setResizing] = useState(false);
  const resetWorkflowEvent = useAppStore(st => st.resetWorkflowEvent);

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
          id: node.id,
          dimensions: {
            width: !!dimensions ? dimensions.width : width,
            height
          }
        }])
      }
      setMinHeight(height);
    }
  }, [setMinHeight, node.id, imagePreviews]);
  
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
          if (entry.target === mainRef.current && !resizing) {
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

  return {
    minHeight,
    minWidth,
    mainRef,
    setResizing
  }
}
