export type ShapeType = 'rectangle' | 'l-shape' | 't-shape' | 'custom';

export type RailingSide = 'north' | 'south' | 'east' | 'west';

export interface StairSpec {
  side: RailingSide;
  width_ft: number;
}

export interface SimpleFormInput {
  width_ft: number;
  length_ft: number;
  height_ft: number;
  shapeType: ShapeType;
  cutoutWidth_ft: number;
  cutoutLength_ft: number;
  railingSides: RailingSide[];
  stairs: StairSpec[];
  wasteFactor?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasStairMarker {
  edgeIndex: number;
  offsetAlongEdge_ft: number;
  width_ft: number;
}

export interface ShapePolygon {
  points: Point[];
  stairs: CanvasStairMarker[];
  height_ft: number;
  wasteFactor?: number;
}

export type DeckInput =
  | { mode: 'simple'; data: SimpleFormInput }
  | { mode: 'canvas'; data: ShapePolygon };

export interface NormalizedGeometry {
  area_sqft: number;
  perimeter_lf: number;
  width_ft: number;
  length_ft: number;
  height_ft: number;
  railingLength_lf: number;
  stairs: StairSpec[];
  wasteFactor: number;
  ledgerLength_ft: number;
}
