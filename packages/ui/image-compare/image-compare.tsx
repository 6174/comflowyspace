import React, { useState, useRef, useEffect } from 'react';

interface ImageCompareProps {
  height: number | 'auto';
  leftImage: string;
  rightImage: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({ height, leftImage, rightImage }) => {
  const [position, setPosition] = useState(50);
  const [containerHeight, setContainerHeight] = useState<number | 'auto'>(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);

  const updateHeight = () => {
    if (height === 'auto' && leftImageRef.current && containerRef.current) {
      const img = leftImageRef.current;
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const newHeight = containerRef.current.offsetWidth * aspectRatio;
      setContainerHeight(newHeight);
    } else {
      setContainerHeight(height);
    }
  };

  useEffect(() => {
    updateHeight();
    const container = containerRef.current;
    if (container && height === 'auto') {
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(container);
      updateHeight();
      return () => resizeObserver.disconnect();
    }
  }, [height, leftImage]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDraggingRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(pos, 0), 100));
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleMouseDown);
    container.addEventListener('mousemove', handleMove as any);
    container.addEventListener('touchmove', handleMove as any);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchend', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleMouseDown);
      container.removeEventListener('mousemove', handleMove as any);
      container.removeEventListener('touchmove', handleMove as any);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchend', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight,
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <img
        ref={leftImageRef}
        src={leftImage}
        alt="Left"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <img
        src={rightImage}
        alt="Right"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath: `inset(0 0 0 ${position}%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          height: '100%',
          width: '2px',
          backgroundColor: '#2CC5C8',
          left: `${position}%`,
          cursor: 'ew-resize',
        }}
      />
      <div
        style={{
          position: 'absolute',
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(261deg, #0dc8cb 1.89%, #89efd4 98.61%)',
          left: `calc(${position}% - 20px)`,
          top: 'calc(50% - 20px)',
          cursor: 'ew-resize',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99867 16.9614C8.40629 17.349 8.41461 17.927 8.03305 18.3282C7.64543 18.7359 7.06142 18.7505 6.66016 18.369L3.17627 15.056C2.44382 14.3595 2.42288 13.527 3.11939 12.7946L6.48079 9.25971C6.86841 8.85209 7.45242 8.8374 7.86004 9.22502C8.26766 9.61264 8.26993 10.197 7.88836 10.5982L7.41595 11.095L5.39254 12.955L8.33524 12.7939L11.9014 12.7042L16.0331 12.6065L19.5996 12.5293L22.5464 12.5298L20.4447 10.786L19.9925 10.3559C19.5849 9.96832 19.5766 9.39037 19.9582 8.98912C20.3397 8.58787 20.9298 8.56681 21.331 8.94837L24.8149 12.2613C25.5474 12.9578 25.5683 13.7904 24.8718 14.5228L21.5104 18.0576C21.1228 18.4653 20.5388 18.48 20.1312 18.0923C19.7235 17.7047 19.7152 17.1268 20.1028 16.7191L20.5753 16.2224L22.5987 14.3624L19.656 14.5234L16.0898 14.6131L11.9581 14.7108L8.39161 14.7881L5.44485 14.7876L7.54646 16.5314L7.99867 16.9614Z" fill="white" />
        </svg>
      </div>
    </div>
  );
};

export default ImageCompare;