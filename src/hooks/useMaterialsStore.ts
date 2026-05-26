import { useState, useCallback } from 'react';
import defaultConfig from '../config/materials.config.json';
import type { MaterialsConfig } from '../types/config.types';

const STORAGE_KEY = '4x4decks_catalog_v1';

export interface LengthOverrides {
  deckingBoard?: number[];
  joists?: number[];
  rimJoist?: number[];
  beams?: number[];
  posts?: number[];
  stairs_stringer?: number[];
  stairs_tread?: number[];
}

function loadOverrides(): LengthOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: LengthOverrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function mergeConfigWithOverrides(overrides: LengthOverrides): MaterialsConfig {
  const cfg = structuredClone(defaultConfig) as MaterialsConfig;
  if (overrides.deckingBoard?.length) cfg.deckingBoard.lengthOptions_ft = overrides.deckingBoard;
  if (overrides.joists?.length) cfg.joists.lengthOptions_ft = overrides.joists;
  if (overrides.rimJoist?.length) cfg.rimJoist.lengthOptions_ft = overrides.rimJoist;
  if (overrides.beams?.length) cfg.beams.lengthOptions_ft = overrides.beams;
  if (overrides.posts?.length) cfg.posts.lengthOptions_ft = overrides.posts;
  if (overrides.stairs_stringer?.length) cfg.stairs.stringer_lengthOptions_ft = overrides.stairs_stringer;
  if (overrides.stairs_tread?.length) {
    (cfg.stairs as unknown as Record<string, unknown>).tread_lengthOptions_ft = overrides.stairs_tread;
  }
  return cfg;
}

export function useMaterialsStore() {
  const [overrides, setOverrides] = useState<LengthOverrides>(loadOverrides);

  const config = mergeConfigWithOverrides(overrides);

  const updateCategory = useCallback((
    key: keyof LengthOverrides,
    lengths: number[]
  ) => {
    setOverrides(prev => {
      const next = { ...prev, [key]: lengths.sort((a, b) => a - b) };
      saveOverrides(next);
      return next;
    });
  }, []);

  const resetCategory = useCallback((key: keyof LengthOverrides) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[key];
      saveOverrides(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setOverrides({});
  }, []);

  return { config, overrides, updateCategory, resetCategory, resetAll };
}
