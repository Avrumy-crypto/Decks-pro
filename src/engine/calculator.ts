import type { DeckInput } from '../types/deck.types';
import type { BillOfMaterials } from '../types/bom.types';
import type { MaterialsConfig } from '../types/config.types';
import { simpleFormToGeometry, canvasPolygonToGeometry } from './geometry';
import { calculateDecking } from './modules/decking';
import { calculateFraming } from './modules/framing';
import { calculateBeams } from './modules/beams';
import { calculatePosts } from './modules/posts';
import { calculateFootings } from './modules/footings';
import { calculateRailing } from './modules/railing';
import { calculateStairs } from './modules/stairs';
import { calculateHardware } from './modules/hardware';

export function calculateBOM(input: DeckInput, config: MaterialsConfig): BillOfMaterials {
  const geo = input.mode === 'simple'
    ? simpleFormToGeometry(input.data)
    : canvasPolygonToGeometry(input.data);

  const deckingLines = calculateDecking(geo, config);
  const framingResult = calculateFraming(geo, config);
  const beamResult = calculateBeams(geo, config);
  const postResult = calculatePosts(geo, beamResult, config);
  const footingLines = calculateFootings(postResult.totalPosts, geo.height_ft, config);
  const railingResult = calculateRailing(geo.railingLength_lf, geo.height_ft, config);
  const stairLines = calculateStairs(geo.height_ft, geo.stairs, config);
  const hardwareLines = calculateHardware({
    geo,
    joistCount: framingResult.joistCount,
    totalPosts: postResult.totalPosts,
    ledgerLength_ft: framingResult.ledgerLength_ft,
    railingPostCount: railingResult.postCount,
    config,
  });

  const allLines = [
    ...deckingLines,
    ...framingResult.lines,
    ...beamResult.lines,
    ...postResult.lines,
    ...footingLines,
    ...railingResult.lines,
    ...stairLines,
    ...hardwareLines,
  ];

  return {
    inputSummary: {
      area_sqft: Math.round(geo.area_sqft * 10) / 10,
      perimeter_lf: Math.round(geo.perimeter_lf * 10) / 10,
      height_ft: geo.height_ft,
      railingLength_lf: Math.round(geo.railingLength_lf * 10) / 10,
      stairRuns: geo.stairs.length,
    },
    lines: allLines,
    generatedAt: new Date().toISOString(),
  };
}
