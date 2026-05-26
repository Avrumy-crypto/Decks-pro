import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';
import type { NormalizedGeometry } from '../../types/deck.types';
import type { BeamResult } from './beams';
import { chooseBestLength } from '../geometry';

export interface PostResult {
  lines: BOMLine[];
  totalPosts: number;
}

export function calculatePosts(geo: NormalizedGeometry, beamResult: BeamResult, config: MaterialsConfig): PostResult {
  const { posts } = config;
  const { height_ft } = geo;

  const totalPosts = beamResult.beamLines * beamResult.postsPerLine;
  const totalPostLength_ft = height_ft + posts.embedDepth_ft;
  const postBoardLength_ft = chooseBestLength(totalPostLength_ft, posts.lengthOptions_ft);

  const lines: BOMLine[] = [
    {
      id: 'posts',
      category: 'beams-posts',
      description: `${posts.size} Posts`,
      size: `${posts.size}×${postBoardLength_ft}'`,
      quantity: totalPosts,
      unit: 'pcs',
      notes: `${height_ft} ft exposed + ${posts.embedDepth_ft} ft embedment = ${totalPostLength_ft.toFixed(1)} ft total`,
    },
  ];

  return { lines, totalPosts };
}
