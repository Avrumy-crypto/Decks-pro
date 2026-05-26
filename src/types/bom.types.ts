import type { DeckInput } from './deck.types';

export type BOMCategory =
  | 'surface'
  | 'framing'
  | 'beams-posts'
  | 'footings'
  | 'railing'
  | 'stairs'
  | 'hardware';

export interface BOMLine {
  id: string;
  category: BOMCategory;
  description: string;
  size: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface BillOfMaterials {
  inputSummary: {
    area_sqft: number;
    perimeter_lf: number;
    height_ft: number;
    railingLength_lf: number;
    stairRuns: number;
  };
  lines: BOMLine[];
  generatedAt: string;
}

export interface ExportPayload {
  company: '4X4 Decks';
  version: string;
  bom: BillOfMaterials;
  rawInput: DeckInput;
}
