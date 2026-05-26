import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';
import type { NormalizedGeometry } from '../../types/deck.types';
import { chooseBestLength } from '../geometry';

export interface FramingResult {
  lines: BOMLine[];
  joistCount: number;
  ledgerLength_ft: number;
}

export function calculateFraming(geo: NormalizedGeometry, config: MaterialsConfig): FramingResult {
  const { joists, rimJoist, ledger } = config;
  const { width_ft, length_ft, ledgerLength_ft } = geo;

  const spacingFt = joists.spacing_in / 12;
  const rimThickness_ft = (joists.actualThickness_in / 12) * 2;
  const joistCount = Math.floor((length_ft - rimThickness_ft) / spacingFt) + 1;
  const joistLength_ft = chooseBestLength(width_ft, joists.lengthOptions_ft);

  const rimPerimeter_lf = width_ft * 2 + length_ft;
  const rimBoardLength_ft = chooseBestLength(
    Math.max(width_ft, length_ft),
    rimJoist.lengthOptions_ft
  );
  const rimPieces = Math.ceil(rimPerimeter_lf / rimBoardLength_ft);

  const ledgerBoardLength_ft = chooseBestLength(ledgerLength_ft, rimJoist.lengthOptions_ft);
  const ledgerPieces = Math.ceil(ledgerLength_ft / ledgerBoardLength_ft);

  const lines: BOMLine[] = [
    {
      id: 'ledger',
      category: 'framing',
      description: 'Ledger Board',
      size: `${ledger.size}×${ledgerBoardLength_ft}'`,
      quantity: ledgerPieces,
      unit: 'pcs',
      notes: `Attaches to house wall. ${ledgerLength_ft.toFixed(1)} lf needed`,
    },
    {
      id: 'rim-joists',
      category: 'framing',
      description: 'Rim Joists (3 exposed sides)',
      size: `${rimJoist.size}×${rimBoardLength_ft}'`,
      quantity: rimPieces,
      unit: 'pcs',
      notes: `${rimPerimeter_lf.toFixed(1)} lf of rim`,
    },
    {
      id: 'interior-joists',
      category: 'framing',
      description: `Interior Joists (${joists.spacing_in}" OC)`,
      size: `${joists.size}×${joistLength_ft}'`,
      quantity: joistCount,
      unit: 'pcs',
    },
  ];

  return { lines, joistCount, ledgerLength_ft };
}
