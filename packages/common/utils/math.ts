import {BBox} from "../types/math.types";

/**
 * 实现一个函数，判断
 */
export function isBoxIntersect(a: BBox, b: BBox) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * extendABox
 */
export function extendBox(box1: BBox, box2: BBox): BBox {
  const x = Math.min(box1.x, box2.x);
  const y = Math.min(box1.y, box2.y);
  const width = Math.max(box1.x + box1.width, box2.x + box2.width) - x;
  const height = Math.max(box1.y + box1.height, box2.y + box2.height) - y;
  return { x, y, width, height };
}

/**
 * 判断一个 BBox 是否包含另外一个 BBox
 */
export function isBoxContain(a: BBox, b: BBox) {
  return (
    a.x <= b.x &&
    a.y <= b.y &&
    a.x + a.width >= b.x + b.width &&
    a.y + a.height >= b.y + b.height
  );
}