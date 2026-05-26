import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';

export interface RailingResult {
  lines: BOMLine[];
  postCount: number;
}

export function calculateRailing(railingLength_lf: number, height_ft: number, config: MaterialsConfig): RailingResult {
  const { railing } = config;

  if (railingLength_lf <= 0) {
    return { lines: [], postCount: 0 };
  }

  const heightIn = height_ft * 12;
  const requiresRailing = heightIn >= railing.requiresRailingAbove_in;

  const postCount = Math.ceil(railingLength_lf / railing.postSleeveSpacing_ft) + 1;
  const balusters = Math.floor(railingLength_lf / (railing.balusterSpacing_in / 12));
  const railPieces = Math.ceil(railingLength_lf / railing.stockLength_ft);

  const lines: BOMLine[] = [
    {
      id: 'railing-post-sleeves',
      category: 'railing',
      description: 'Railing Post Sleeves (4×4 over)',
      size: `4×4 sleeve, ${railing.railHeight_in}" height`,
      quantity: postCount,
      unit: 'pcs',
      notes: `Spaced every ${railing.postSleeveSpacing_ft} ft`,
    },
    {
      id: 'top-rail',
      category: 'railing',
      description: 'Top Rail',
      size: `${railing.stockLength_ft}' sections`,
      quantity: railPieces,
      unit: 'pcs',
    },
    {
      id: 'bottom-rail',
      category: 'railing',
      description: 'Bottom Rail',
      size: `${railing.stockLength_ft}' sections`,
      quantity: railPieces,
      unit: 'pcs',
    },
    {
      id: 'balusters',
      category: 'railing',
      description: 'Balusters',
      size: `${railing.railHeight_in - 6}" length`,
      quantity: balusters,
      unit: 'pcs',
      notes: `${railing.balusterSpacing_in}" spacing (max 4" clear opening per IRC)`,
    },
  ];

  if (!requiresRailing) {
    lines.forEach(l => { l.notes = (l.notes ? l.notes + '. ' : '') + 'Note: deck height may not require railing per code — verify locally'; });
  }

  return { lines, postCount };
}
