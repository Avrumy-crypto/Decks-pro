import { useState } from 'react';
import type { BillOfMaterials, BOMCategory } from '../../types/bom.types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../utils/formatters';

interface BOMDisplayProps {
  bom: BillOfMaterials;
}

const CATEGORY_COLORS: Record<BOMCategory, string> = {
  'surface': 'bg-yellow-50 border-yellow-300',
  'framing': 'bg-sky-50 border-sky-200',
  'beams-posts': 'bg-indigo-50 border-indigo-200',
  'footings': 'bg-stone-50 border-stone-200',
  'railing': 'bg-emerald-50 border-emerald-200',
  'stairs': 'bg-orange-50 border-orange-200',
  'hardware': 'bg-gray-50 border-gray-200',
};

const CATEGORY_HEADER_COLORS: Record<BOMCategory, string> = {
  'surface': 'bg-yellow-400 text-black',
  'framing': 'bg-sky-100 text-sky-900',
  'beams-posts': 'bg-indigo-100 text-indigo-900',
  'footings': 'bg-stone-100 text-stone-900',
  'railing': 'bg-emerald-100 text-emerald-900',
  'stairs': 'bg-orange-100 text-orange-900',
  'hardware': 'bg-gray-100 text-gray-900',
};

export function BOMDisplay({ bom }: BOMDisplayProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const byCategory = CATEGORY_ORDER.reduce<Record<string, typeof bom.lines>>((acc, cat) => {
    const lines = bom.lines.filter(l => l.category === cat);
    if (lines.length > 0) acc[cat] = lines;
    return acc;
  }, {});

  const toggle = (cat: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg border border-gray-800 p-4">
        <h3 className="font-bold text-yellow-400 mb-3 uppercase tracking-wide text-sm">Project Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Area', value: `${bom.inputSummary.area_sqft} sq ft` },
            { label: 'Perimeter', value: `${bom.inputSummary.perimeter_lf} lf` },
            { label: 'Height', value: `${bom.inputSummary.height_ft} ft` },
            { label: 'Stair Runs', value: bom.inputSummary.stairRuns.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 rounded-md p-3 text-center border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
              <div className="font-bold text-yellow-400 mt-1">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Total line items: {bom.lines.length} &bull; Generated: {new Date(bom.generatedAt).toLocaleTimeString()}
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, lines]) => {
        const isOpen = !collapsed.has(cat);
        const colorClass = CATEGORY_COLORS[cat as BOMCategory];
        const headerClass = CATEGORY_HEADER_COLORS[cat as BOMCategory];
        return (
          <div key={cat} className={`rounded-lg border ${colorClass} overflow-hidden`}>
            <button
              onClick={() => toggle(cat)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between ${headerClass} font-semibold text-sm`}
            >
              <span>{CATEGORY_LABELS[cat] ?? cat}</span>
              <span className="flex items-center gap-2">
                <span className="bg-black/10 rounded px-2 py-0.5 text-xs font-medium">{lines.length} items</span>
                <span>{isOpen ? '▲' : '▼'}</span>
              </span>
            </button>

            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-medium">Material</th>
                      <th className="text-left px-4 py-2 font-medium">Size</th>
                      <th className="text-right px-4 py-2 font-medium">Qty</th>
                      <th className="text-left px-4 py-2 font-medium">Unit</th>
                      <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(line => (
                      <tr key={line.id} className="border-b border-gray-100 last:border-0 hover:bg-white/50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{line.description}</td>
                        <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{line.size}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900">{line.quantity}</td>
                        <td className="px-4 py-2.5 text-gray-500">{line.unit}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs hidden sm:table-cell">{line.notes ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
