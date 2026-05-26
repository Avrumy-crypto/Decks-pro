import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';
import type { NormalizedGeometry } from '../../types/deck.types';
import { chooseBestLength } from '../geometry';

export function calculateDecking(geo: NormalizedGeometry, config: MaterialsConfig): BOMLine[] {
  const { deckingBoard } = config;
  const wasteFactor = geo.wasteFactor;

  // Boards run perpendicular to joists (across the width of the deck)
  const boardLength_ft = chooseBestLength(geo.width_ft, deckingBoard.lengthOptions_ft);

  const effectiveBoardWidth_ft = (deckingBoard.actualWidth_in + deckingBoard.gapBetweenBoards_in) / 12;
  const boardsNeeded = Math.ceil(
    (geo.area_sqft / (effectiveBoardWidth_ft * boardLength_ft)) * (1 + wasteFactor)
  );

  return [
    {
      id: 'decking-boards',
      category: 'surface',
      description: `${deckingBoard.nominalThickness}×${deckingBoard.nominalWidth_in} Decking Boards`,
      size: `${deckingBoard.nominalThickness}×${deckingBoard.nominalWidth_in}×${boardLength_ft}'`,
      quantity: boardsNeeded,
      unit: 'pcs',
      notes: `Includes ${Math.round(wasteFactor * 100)}% waste. Area: ${geo.area_sqft.toFixed(1)} sq ft`,
    },
  ];
}
