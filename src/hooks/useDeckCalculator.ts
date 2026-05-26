import { useMemo } from 'react';
import type { DeckInput } from '../types/deck.types';
import type { BillOfMaterials } from '../types/bom.types';
import { calculateBOM } from '../engine/calculator';
import config from '../config/materials.config.json';
import type { MaterialsConfig } from '../types/config.types';

const cfg = config as MaterialsConfig;

export function useDeckCalculator(input: DeckInput | null): BillOfMaterials | null {
  return useMemo(() => {
    if (!input) return null;
    try {
      return calculateBOM(input, cfg);
    } catch (e) {
      console.error('Calculation error:', e);
      return null;
    }
  }, [input]);
}
