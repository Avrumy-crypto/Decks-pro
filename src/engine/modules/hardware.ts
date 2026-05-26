import type { BOMLine } from '../../types/bom.types';
import type { MaterialsConfig } from '../../types/config.types';
import type { NormalizedGeometry } from '../../types/deck.types';

interface HardwareInput {
  geo: NormalizedGeometry;
  joistCount: number;
  totalPosts: number;
  ledgerLength_ft: number;
  railingPostCount: number;
  config: MaterialsConfig;
}

export function calculateHardware({ geo, joistCount, totalPosts, ledgerLength_ft, railingPostCount, config }: HardwareInput): BOMLine[] {
  const { hardware } = config;

  const screwsLbs = Math.ceil(geo.area_sqft * hardware.screwsPerSqFt_lbs);
  const joistHangers = joistCount * hardware.joistHangersPerJoist;
  const postBases = totalPosts * hardware.postBasesPerPost;
  const beamCaps = totalPosts * hardware.beamCapPerPost;
  const ledgerBolts = Math.ceil((ledgerLength_ft * 12) / hardware.ledgerBoltSpacing_in) + 1;
  const railingLagScrews = railingPostCount * hardware.railingPostLagScrews;

  const lines: BOMLine[] = [
    {
      id: 'decking-screws',
      category: 'hardware',
      description: 'Decking Screws',
      size: '2.5" composite deck screws',
      quantity: screwsLbs,
      unit: 'lbs',
    },
    {
      id: 'joist-hangers',
      category: 'hardware',
      description: `Joist Hangers (${config.joists.size.toUpperCase()})`,
      size: 'LUS28 or equivalent',
      quantity: joistHangers,
      unit: 'pcs',
      notes: `${hardware.joistHangersPerJoist} per joist × ${joistCount} joists`,
    },
    {
      id: 'post-bases',
      category: 'hardware',
      description: `Post Bases (${hardware.postBaseSku})`,
      size: hardware.postBaseSku,
      quantity: postBases,
      unit: 'pcs',
    },
    {
      id: 'beam-caps',
      category: 'hardware',
      description: `Beam Post Caps (${hardware.beamCapSku})`,
      size: hardware.beamCapSku,
      quantity: beamCaps,
      unit: 'pcs',
    },
    {
      id: 'ledger-bolts',
      category: 'hardware',
      description: '1/2" Ledger Bolts',
      size: '1/2" × 4" lag screws',
      quantity: ledgerBolts,
      unit: 'pcs',
      notes: `${hardware.ledgerBoltSpacing_in}" spacing along ${ledgerLength_ft.toFixed(1)} ft ledger`,
    },
  ];

  if (railingLagScrews > 0) {
    lines.push({
      id: 'railing-lag-screws',
      category: 'hardware',
      description: 'Railing Post Lag Screws',
      size: '3/8" × 3" lag screws',
      quantity: railingLagScrews,
      unit: 'pcs',
      notes: `${hardware.railingPostLagScrews} per railing post × ${railingPostCount} posts`,
    });
  }

  return lines;
}
