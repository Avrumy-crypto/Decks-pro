import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';
import type { StairSpec } from '../../types/deck.types';
import { chooseBestLength } from '../geometry';

export function calculateStairs(height_ft: number, stairs: StairSpec[], config: MaterialsConfig): BOMLine[] {
  if (!stairs || stairs.length === 0) return [];

  const { stairs: sc } = config;
  const lines: BOMLine[] = [];

  stairs.forEach((stair, idx) => {
    const suffix = stairs.length > 1 ? ` (Run ${idx + 1})` : '';
    const totalRise_in = height_ft * 12;

    let numberOfRisers = Math.round(totalRise_in / sc.targetRiserHeight_in);
    let actualRiser_in = totalRise_in / numberOfRisers;

    if (actualRiser_in > sc.maxRiserHeight_in) {
      numberOfRisers += 1;
      actualRiser_in = totalRise_in / numberOfRisers;
    } else if (actualRiser_in < sc.minRiserHeight_in) {
      numberOfRisers -= 1;
      actualRiser_in = totalRise_in / numberOfRisers;
    }

    const numberOfTreads = numberOfRisers - 1;
    const totalRun_ft = (numberOfTreads * sc.treadDepth_in) / 12;
    const totalRise_ft = height_ft;

    const stringerDiagonal_ft = Math.sqrt(totalRise_ft ** 2 + totalRun_ft ** 2) * 1.10;
    const stringerBoardLength_ft = chooseBestLength(stringerDiagonal_ft, sc.stringer_lengthOptions_ft);

    const stairWidth_ft = stair.width_ft || sc.defaultWidth_ft;
    const treadBoardLength_ft = chooseBestLength(stairWidth_ft, [8, 10, 12, 14, 16]);
    const totalTreadBoards = numberOfTreads * sc.treadBoardsPerTread;

    lines.push({
      id: `stair-stringers-${idx}`,
      category: 'stairs',
      description: `Stair Stringers${suffix}`,
      size: `${sc.stringer_size}×${stringerBoardLength_ft}'`,
      quantity: sc.stringerCount,
      unit: 'pcs',
      notes: `${numberOfRisers} risers @ ${actualRiser_in.toFixed(2)}", ${numberOfTreads} treads @ ${sc.treadDepth_in}". Run: ${totalRun_ft.toFixed(1)} ft`,
    });

    lines.push({
      id: `stair-treads-${idx}`,
      category: 'stairs',
      description: `Stair Treads${suffix}`,
      size: `${sc.tread_size}×${treadBoardLength_ft}'`,
      quantity: totalTreadBoards,
      unit: 'pcs',
      notes: `${sc.treadBoardsPerTread} boards per tread × ${numberOfTreads} treads`,
    });

    if (sc.includeRisers) {
      lines.push({
        id: `stair-risers-${idx}`,
        category: 'stairs',
        description: `Stair Risers${suffix}`,
        size: `${sc.riser_size}×${treadBoardLength_ft}'`,
        quantity: numberOfRisers,
        unit: 'pcs',
      });
    }
  });

  return lines;
}
