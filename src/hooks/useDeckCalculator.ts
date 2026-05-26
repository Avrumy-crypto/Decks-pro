import { useMemo } from 'react';
import type { DeckInput } from '../types/deck.types';
import type { BillOfMaterials } from '../types/bom.types';
import type { MaterialsConfig } from '../types/config.types';
import { calculateBOM } from '../engine/calculator';

export function useDeckCalculator(input: DeckInput | null, config: MaterialsConfig): BillOfMaterials | null {
  return useMemo(() => {
    if (!input) return null;
    try {
      return calculateBOM(input, config);
    } catch (e) {
      console.error('Calculation error:', e);
      return null;
    }
  }, [input, config]);
}
