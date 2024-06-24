import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface VirtualListProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const VirtualList: React.FC<VirtualListProps & React.PropsWithChildren> = ({
  items,
  itemHeight,
  renderItem,
  style = {},
  className = "",
  children
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => listRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan: 5,
  });

  return (
    <div
      ref={listRef}
      className={`virtual-list ${className}`}
      style={{
        height: '100%',
        overflow: 'auto',
        ...style
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem: VirtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};