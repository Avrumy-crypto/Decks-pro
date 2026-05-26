import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';
import type { NormalizedGeometry } from '../../types/deck.types';
import { chooseBestLength } from '../geometry';

export interface BeamResult {
  lines: BOMLine[];
  beamLines: number;
  postsPerLine: number;
  postSpacing_ft: number;
  beamSize: string;
}

function lookupBeamSize(postSpacing_ft: number, config: MaterialsConfig): string {
  const table = [...config.beams.spanTable].sort((a, b) => a.maxSpan_ft - b.maxSpan_ft);
  const entry = table.find(e => e.maxSpan_ft >= postSpacing_ft);
  return entry ? entry.size : table[table.length - 1].size;
}

function parsePlyCount(sizeStr: string): { plyCount: number; memberSize: string } {
  const match = sizeStr.match(/^(\d+)-(.+)$/);
  if (match) return { plyCount: parseInt(match[1]), memberSize: match[2] };
  return { plyCount: 1, memberSize: sizeStr };
}

export function calculateBeams(geo: NormalizedGeometry, config: MaterialsConfig): BeamResult {
  const { beams } = config;
  const { width_ft, length_ft } = geo;
  const postSpacing_ft = beams.defaultPostSpacing_ft;

  const beamLines = Math.max(1, Math.ceil(length_ft / postSpacing_ft) - 1);
  const postsPerLine = Math.ceil(width_ft / postSpacing_ft) + 1;

  const beamSize = lookupBeamSize(postSpacing_ft, config);
  const { plyCount, memberSize } = parsePlyCount(beamSize);

  const boardLength_ft = chooseBestLength(width_ft / postsPerLine, beams.lengthOptions_ft);
  const boardsPerLine = Math.ceil(width_ft / boardLength_ft) * plyCount;
  const totalBeamBoards = beamLines * boardsPerLine;

  const lines: BOMLine[] = [
    {
      id: 'beam-boards',
      category: 'beams-posts',
      description: 'Beam Boards',
      size: `${memberSize}×${boardLength_ft}'`,
      quantity: totalBeamBoards,
      unit: 'pcs',
      notes: `${beamLines} beam line(s), ${plyCount}-ply ${beamSize}. Posts every ${postSpacing_ft} ft`,
    },
  ];

  return { lines, beamLines, postsPerLine, postSpacing_ft, beamSize };
}
