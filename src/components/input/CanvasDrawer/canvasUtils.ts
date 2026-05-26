import type { Point } from '../../../types/deck.types';

export function pxToFt(px: number, scale: number): number {
  return px / scale;
}

export function ftToPx(ft: number, scale: number): number {
  return ft * scale;
}

export function snapToGrid(value_ft: number, gridSize_ft: number): number {
  return Math.round(value_ft / gridSize_ft) * gridSize_ft;
}

export function toKonvaPoints(points: Point[], scale: number): number[] {
  const flat: number[] = [];
  for (const p of points) {
    flat.push(ftToPx(p.x, scale), ftToPx(p.y, scale));
  }
  return flat;
}

export function distancePx(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

export function edgeLengthFt(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
