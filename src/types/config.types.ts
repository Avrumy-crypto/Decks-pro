export interface SpanTableEntry {
  maxSpan_ft: number;
  size: string;
}

export interface MaterialsConfig {
  deckingBoard: {
    nominalWidth_in: number;
    actualWidth_in: number;
    nominalThickness: string;
    lengthOptions_ft: number[];
    defaultLength_ft: number;
    gapBetweenBoards_in: number;
    wasteFactor: number;
  };
  joists: {
    size: string;
    actualThickness_in: number;
    actualDepth_in: number;
    spacing_in: number;
    lengthOptions_ft: number[];
  };
  rimJoist: {
    size: string;
    lengthOptions_ft: number[];
  };
  ledger: {
    size: string;
    boltSpacing_in: number;
  };
  beams: {
    spanTable: SpanTableEntry[];
    defaultPostSpacing_ft: number;
    lengthOptions_ft: number[];
  };
  posts: {
    size: string;
    embedDepth_ft: number;
    lengthOptions_ft: number[];
  };
  footings: {
    diameter_in: number;
    bagsPerFooting_80lb: number;
    extraBagsPerFtDepth: number;
    baselineDepth_ft: number;
  };
  railing: {
    postSleeveSpacing_ft: number;
    balusterSpacing_in: number;
    balusterWidth_in: number;
    railHeight_in: number;
    stockLength_ft: number;
    requiresRailingAbove_in: number;
  };
  stairs: {
    maxRiserHeight_in: number;
    minRiserHeight_in: number;
    targetRiserHeight_in: number;
    treadDepth_in: number;
    defaultWidth_ft: number;
    stringerCount: number;
    stringer_size: string;
    stringer_lengthOptions_ft: number[];
    tread_size: string;
    treadBoardsPerTread: number;
    riser_size: string;
    includeRisers: boolean;
    wasteFactor: number;
  };
  hardware: {
    screwsPerSqFt_lbs: number;
    joistHangersPerJoist: number;
    postBasesPerPost: number;
    postBaseSku: string;
    beamCapPerPost: number;
    beamCapSku: string;
    ledgerBoltSpacing_in: number;
    railingPostLagScrews: number;
  };
}
