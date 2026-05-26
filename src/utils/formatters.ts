export function formatQty(qty: number, unit: string): string {
  return `${qty} ${unit}`;
}

export function formatDimension(val: number, decimals = 1): string {
  return val.toFixed(decimals);
}

export const CATEGORY_LABELS: Record<string, string> = {
  'surface': 'Decking Surface',
  'framing': 'Framing',
  'beams-posts': 'Beams & Posts',
  'footings': 'Footings & Concrete',
  'railing': 'Railing',
  'stairs': 'Stairs',
  'hardware': 'Hardware & Fasteners',
};

export const CATEGORY_ORDER = ['surface', 'framing', 'beams-posts', 'footings', 'railing', 'stairs', 'hardware'];
