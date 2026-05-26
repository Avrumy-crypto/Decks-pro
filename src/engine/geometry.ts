import type { Point, SimpleFormInput, ShapePolygon, NormalizedGeometry, StairSpec, CanvasStairMarker } from '../types/deck.types';

export function shoelaceArea(points: Point[]): number {
  const n = points.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += points[i].x * points[j].y;
    sum -= points[j].x * points[i].y;
  }
  return Math.abs(sum) / 2;
}

export function polygonPerimeter(points: Point[]): number {
  const n = points.length;
  if (n < 2) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    total += segmentLength(points[i], points[j]);
  }
  return total;
}

export function segmentLength(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function edgeMidpoint(p1: Point, p2: Point): Point {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

export function pointAlongEdge(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

function rectanglePoints(w: number, l: number): Point[] {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: l },
    { x: 0, y: l },
  ];
}

function lShapePoints(w: number, l: number, cw: number, cl: number): Point[] {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: cl },
    { x: cw, y: cl },
    { x: cw, y: l },
    { x: 0, y: l },
  ];
}

function tShapePoints(w: number, l: number, cw: number, cl: number): Point[] {
  const leftCut = cw;
  const rightCut = w - cw;
  return [
    { x: leftCut, y: 0 },
    { x: rightCut, y: 0 },
    { x: rightCut, y: cl },
    { x: w, y: cl },
    { x: w, y: l },
    { x: 0, y: l },
    { x: 0, y: cl },
    { x: leftCut, y: cl },
  ];
}

export function simpleFormToGeometry(data: SimpleFormInput): NormalizedGeometry {
  const { width_ft, length_ft, height_ft, shapeType, cutoutWidth_ft, cutoutLength_ft, railingSides, stairs, wasteFactor } = data;

  let points: Point[];
  switch (shapeType) {
    case 'l-shape':
      points = lShapePoints(width_ft, length_ft, cutoutWidth_ft || width_ft / 2, cutoutLength_ft || length_ft / 2);
      break;
    case 't-shape':
      points = tShapePoints(width_ft, length_ft, cutoutWidth_ft || width_ft / 4, cutoutLength_ft || length_ft / 3);
      break;
    default:
      points = rectanglePoints(width_ft, length_ft);
  }

  const area_sqft = shoelaceArea(points);
  const perimeter_lf = polygonPerimeter(points);

  let railingLength_lf = 0;
  if (railingSides.includes('north')) railingLength_lf += width_ft;
  if (railingSides.includes('south')) railingLength_lf += width_ft;
  if (railingSides.includes('east')) railingLength_lf += length_ft;
  if (railingSides.includes('west')) railingLength_lf += length_ft;

  return {
    area_sqft,
    perimeter_lf,
    width_ft,
    length_ft,
    height_ft,
    railingLength_lf,
    stairs,
    wasteFactor: wasteFactor ?? 0.10,
    ledgerLength_ft: width_ft,
  };
}

function canvasStairToSpec(marker: CanvasStairMarker, _points: Point[]): StairSpec {
  const sideIndex = marker.edgeIndex % 4;
  const sides = ['north', 'east', 'south', 'west'] as const;
  return {
    side: sides[sideIndex],
    width_ft: marker.width_ft,
  };
}

export function canvasPolygonToGeometry(data: ShapePolygon): NormalizedGeometry {
  const { points, stairs: stairMarkers, height_ft, wasteFactor } = data;

  const area_sqft = shoelaceArea(points);
  const perimeter_lf = polygonPerimeter(points);

  const bounds = {
    minX: Math.min(...points.map(p => p.x)),
    maxX: Math.max(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)),
    maxY: Math.max(...points.map(p => p.y)),
  };
  const width_ft = bounds.maxX - bounds.minX;
  const length_ft = bounds.maxY - bounds.minY;

  const stairEdgeIndices = new Set(stairMarkers.map(m => m.edgeIndex));
  let railingLength_lf = 0;
  for (let i = 0; i < points.length; i++) {
    if (!stairEdgeIndices.has(i)) {
      const j = (i + 1) % points.length;
      railingLength_lf += segmentLength(points[i], points[j]);
    }
  }
  if (stairMarkers.length === 0 && points.length > 0) {
    railingLength_lf = perimeter_lf - width_ft;
  }

  const stairs: StairSpec[] = stairMarkers.map(m => canvasStairToSpec(m, points));

  return {
    area_sqft,
    perimeter_lf,
    width_ft,
    length_ft,
    height_ft,
    railingLength_lf,
    stairs,
    wasteFactor: wasteFactor ?? 0.10,
    ledgerLength_ft: width_ft,
  };
}

export function chooseBestLength(dimension_ft: number, options: number[]): number {
  const sorted = [...options].sort((a, b) => a - b);
  return sorted.find(l => l >= dimension_ft) ?? sorted[sorted.length - 1];
}
