import { Rect } from "reactflow";

/**
 * 实现一个函数，判断
 */
export function isRectIntersect(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * extendARect
 */
export function extendRect(box1: Rect, box2: Rect): Rect {
  const x = Math.min(box1.x, box2.x);
  const y = Math.min(box1.y, box2.y);
  const width = Math.max(box1.x + box1.width, box2.x + box2.width) - x;
  const height = Math.max(box1.y + box1.height, box2.y + box2.height) - y;
  return { x, y, width, height };
}

/**
 * 判断一个 Rect 是否包含另外一个 Rect
 */
export function isRectContain(a: Rect, b: Rect) {
  return (
    a.x <= b.x &&
    a.y <= b.y &&
    a.x + a.width >= b.x + b.width &&
    a.y + a.height >= b.y + b.height
  );
}