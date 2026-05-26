import { describe, it, expect } from 'vitest';
import { calculateBOM } from '../calculator';
import config from '../../config/materials.config.json';
import type { MaterialsConfig } from '../../types/config.types';
import type { DeckInput } from '../../types/deck.types';

const cfg = config as MaterialsConfig;

function makeRectInput(w: number, l: number, h: number, railingSides: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east']): DeckInput {
  return {
    mode: 'simple',
    data: {
      width_ft: w,
      length_ft: l,
      height_ft: h,
      shapeType: 'rectangle',
      cutoutWidth_ft: 0,
      cutoutLength_ft: 0,
      railingSides: [...railingSides],
      stairs: [],
    },
  };
}

describe('calculateBOM — 12×20 rectangle, 3 ft height', () => {
  const input = makeRectInput(12, 20, 3);
  const bom = calculateBOM(input, cfg);

  it('area is 240 sqft', () => {
    expect(bom.inputSummary.area_sqft).toBeCloseTo(240, 0);
  });

  it('produces decking boards with correct quantity (47)', () => {
    const line = bom.lines.find(l => l.id === 'decking-boards');
    expect(line).toBeDefined();
    expect(line!.quantity).toBe(47);
  });

  it('interior joist count is 15', () => {
    const line = bom.lines.find(l => l.id === 'interior-joists');
    expect(line).toBeDefined();
    expect(line!.quantity).toBe(15);
  });

  it('has 2 beam lines', () => {
    const line = bom.lines.find(l => l.id === 'beam-boards');
    expect(line).toBeDefined();
    expect(line!.notes).toMatch(/2 beam line/);
  });

  it('has posts', () => {
    const line = bom.lines.find(l => l.id === 'posts');
    expect(line).toBeDefined();
    expect(line!.quantity).toBeGreaterThan(0);
  });

  it('has concrete bags', () => {
    const line = bom.lines.find(l => l.id === 'concrete-bags');
    expect(line).toBeDefined();
    expect(line!.quantity).toBeGreaterThan(0);
  });

  it('generates all expected categories', () => {
    const categories = new Set(bom.lines.map(l => l.category));
    expect(categories.has('surface')).toBe(true);
    expect(categories.has('framing')).toBe(true);
    expect(categories.has('beams-posts')).toBe(true);
    expect(categories.has('footings')).toBe(true);
    expect(categories.has('hardware')).toBe(true);
  });

  it('no line has zero or negative quantity', () => {
    bom.lines.forEach(l => {
      expect(l.quantity).toBeGreaterThan(0);
    });
  });
});

describe('calculateBOM — railing balusters for 44 lf', () => {
  it('baluster count is ~132 for 44 lf', () => {
    const input: DeckInput = {
      mode: 'simple',
      data: {
        width_ft: 12,
        length_ft: 20,
        height_ft: 3,
        shapeType: 'rectangle',
        cutoutWidth_ft: 0,
        cutoutLength_ft: 0,
        railingSides: ['north', 'south', 'east'],
        stairs: [],
      },
    };
    const bom = calculateBOM(input, cfg);
    const line = bom.lines.find(l => l.id === 'balusters');
    expect(line).toBeDefined();
    expect(line!.quantity).toBe(132);
  });
});

describe('calculateBOM — stairs at 3 ft', () => {
  it('generates stringer and tread lines', () => {
    const input: DeckInput = {
      mode: 'simple',
      data: {
        width_ft: 12,
        length_ft: 20,
        height_ft: 3,
        shapeType: 'rectangle',
        cutoutWidth_ft: 0,
        cutoutLength_ft: 0,
        railingSides: ['north'],
        stairs: [{ side: 'south', width_ft: 4 }],
      },
    };
    const bom = calculateBOM(input, cfg);
    const stringers = bom.lines.find(l => l.id === 'stair-stringers-0');
    const treads = bom.lines.find(l => l.id === 'stair-treads-0');
    expect(stringers).toBeDefined();
    expect(stringers!.quantity).toBe(3);
    expect(treads).toBeDefined();
    expect(treads!.notes).toMatch(/4 treads/);
  });
});

describe('calculateBOM — edge cases', () => {
  it('no stair lines when stairs array is empty', () => {
    const bom = calculateBOM(makeRectInput(12, 20, 3), cfg);
    expect(bom.lines.filter(l => l.category === 'stairs')).toHaveLength(0);
  });

  it('small deck does not crash', () => {
    expect(() => calculateBOM(makeRectInput(1, 1, 0.5), cfg)).not.toThrow();
  });

  it('no railing lines when no sides selected', () => {
    const input = makeRectInput(12, 20, 3, []);
    const bom = calculateBOM(input, cfg);
    expect(bom.lines.filter(l => l.category === 'railing')).toHaveLength(0);
  });
});
