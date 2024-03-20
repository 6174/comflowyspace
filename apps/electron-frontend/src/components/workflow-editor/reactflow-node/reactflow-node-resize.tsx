import { MutableRefObject,  useCallback, useEffect, useRef, useState } from 'react'
import { type NodeProps, NodeResizeControl } from 'reactflow'
import { NodeVisibleState, PreviewImage } from '@comflowy/common/types';
import { useAppStore } from '@comflowy/common/store';
import ResizeIcon from 'ui/icons/resize-icon';

export function ComflowyNodeResizer({ setResizing, minWidth, minHeight, node }: {
  setResizing: (resizing: boolean) => void;
  minWidth: number;
  minHeight: number;
  node: NodeProps;
}) {
  return (
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
  )
}

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
  const collapsed = node.data.visibleState === NodeVisibleState.Collapsed;
  const mainRef = useRef<HTMLDivElement>();
  const [minHeight, setMinHeight] = useState(100);
  const [minWidth] = useState(240);
  const onNodesChange = useAppStore(st => st.onNodesChange);
  const [resizing, setResizing] = useState(false);
  const resetWorkflowEvent = useAppStore(st => st.resetWorkflowEvent);

  const updateMinHeight = useCallback(async () => {
    if (mainRef.current && !collapsed) {
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
  }, [setMinHeight, node.id, imagePreviews, collapsed]);

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
