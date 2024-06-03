import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface VirtualGridListProps {
  items: any[];
  minItemWidth: number;
  itemHeight: number;
  gridGap: number
  renderItem: (item: any) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string; 
}

export const VirtualGrid: React.FC<VirtualGridListProps & React.PropsWithChildren> = ({ items, minItemWidth, itemHeight, gridGap, renderItem, style = {}, className = "", children}) => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [columnCount, setColumnCount] = useState<number>(3);
  const [itemWidth, setItemWidth] = useState<number>(250); // items[0].width
  const itemSize: number = minItemWidth || 250;
  const gap: number = gridGap;

  useEffect(() => {
    if (gridRef.current) {
      const resizeObserver: ResizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // 计算新的列数，考虑到间隙
          const newColumnCount: number = Math.floor((entry.contentRect.width + gap) / (itemSize + gap));
          setColumnCount(newColumnCount || 1);

          // 计算新的网格项宽度，考虑到间隙
          const newWidth: number = ((entry.contentRect.width - (newColumnCount - 1) * gap) / newColumnCount);
          setItemWidth(newWidth);
        }
      });
      resizeObserver.observe(gridRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // 根据 columnCoun 将 items 分组二维数组
  const rows = items.reduce((acc, item, index) => {
    const rowIndex = Math.floor(index / columnCount);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(item);
    return acc;
  }, [] as any[][]);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => gridRef.current,
    estimateSize: () => itemHeight + gap,
  })

  const totalSize = Math.ceil(items.length / columnCount) * (itemHeight + gap);

  return (
    <div
      ref={gridRef}
      className={`grid-list ${className}`}
      style={{ position: 'relative',  ...style, paddingBottom: 100 }}
    >
      <div style={{ height: totalSize, width: '100%' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: `${virtualRow.start}px`,
                left: 0,
                width: '100%',
                height: `${itemHeight}px`,
                display: 'flex',
                justifyContent: 'space-between',
                gap: `${gap}px`,
              }}
            >
              {rows[virtualRow.index].map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: `${index * (itemWidth + gap)}px`,
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                    }}
                  >
                    {renderItem(item)}
                  </div>
                );
              })}
            </div>
          )
        })}
      </div>
    </div>    
  );
}