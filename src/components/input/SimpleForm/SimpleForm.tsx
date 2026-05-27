import { useState, useEffect } from 'react';
import type { SimpleFormInput, RailingSide, ShapeType } from '../../../types/deck.types';

interface SimpleFormProps {
  onChange: (input: SimpleFormInput) => void;
}

const DEFAULT: SimpleFormInput = {
  width_ft: 12,
  length_ft: 20,
  height_ft: 3,
  shapeType: 'rectangle',
  cutoutWidth_ft: 6,
  cutoutLength_ft: 10,
  railingSides: ['north', 'south', 'east'],
  stairs: [],
};

function NumField({ label, value, onChange, min = 0, step = 0.5, unit = 'ft' }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; unit?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 block w-full rounded-l-md border-gray-300 focus:border-yellow-400 focus:ring-yellow-400 sm:text-sm border px-3 py-2"
        />
        <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 text-sm">
          {unit}
        </span>
      </div>
    </label>
  );
}

const RAILING_SIDES: { id: RailingSide; label: string }[] = [
  { id: 'north', label: 'North (far end)' },
  { id: 'south', label: 'South (house side)' },
  { id: 'east', label: 'East (right side)' },
  { id: 'west', label: 'West (left side)' },
];

export function SimpleForm({ onChange }: SimpleFormProps) {
  const [form, setForm] = useState<SimpleFormInput>(DEFAULT);

  useEffect(() => {
    onChange(form);
  }, [form, onChange]);

  function update<K extends keyof SimpleFormInput>(key: K, value: SimpleFormInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleRailingSide(side: RailingSide) {
    setForm(prev => {
      const has = prev.railingSides.includes(side);
      return {
        ...prev,
        railingSides: has
          ? prev.railingSides.filter(s => s !== side)
          : [...prev.railingSides, side],
      };
    });
  }

  function addStair() {
    setForm(prev => ({
      ...prev,
      stairs: [...prev.stairs, { side: 'south', width_ft: 4 }],
    }));
  }

  function removeStair(i: number) {
    setForm(prev => ({ ...prev, stairs: prev.stairs.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Deck Dimensions</h3>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="Width" value={form.width_ft} onChange={v => update('width_ft', v)} />
          <NumField label="Length (depth from house)" value={form.length_ft} onChange={v => update('length_ft', v)} />
          <NumField label="Height above grade" value={form.height_ft} onChange={v => update('height_ft', v)} step={0.25} />
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Shape</span>
            <select
              value={form.shapeType}
              onChange={e => update('shapeType', e.target.value as ShapeType)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-yellow-400 focus:ring-yellow-400 sm:text-sm border px-3 py-2"
            >
              <option value="rectangle">Rectangle</option>
              <option value="l-shape">L-Shape</option>
              <option value="t-shape">T-Shape</option>
            </select>
          </label>
        </div>

        {(form.shapeType === 'l-shape' || form.shapeType === 't-shape') && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-xs text-yellow-700 mb-2 font-medium">Cutout dimensions (removed section)</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Cutout Width" value={form.cutoutWidth_ft} onChange={v => update('cutoutWidth_ft', v)} />
              <NumField label="Cutout Length" value={form.cutoutLength_ft} onChange={v => update('cutoutLength_ft', v)} />
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Railing Sides</h3>
        <div className="grid grid-cols-2 gap-2">
          {RAILING_SIDES.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.railingSides.includes(id)}
                onChange={() => toggleRailingSide(id)}
                className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Stairs</h3>
          <button
            onClick={addStair}
            className="text-xs bg-yellow-400 text-black hover:bg-yellow-500 px-2 py-1 rounded-md font-semibold transition-colors"
          >
            + Add Stair Run
          </button>
        </div>
        {form.stairs.length === 0 && (
          <p className="text-sm text-gray-400 italic">No stairs added</p>
        )}
        {form.stairs.map((stair, i) => (
          <div key={i} className="flex items-end gap-3 mb-2 p-3 bg-gray-50 rounded-md">
            <div className="flex-1">
              <label className="block">
                <span className="text-xs font-medium text-gray-600">Side</span>
                <select
                  value={stair.side}
                  onChange={e => {
                    const updated = [...form.stairs];
                    updated[i] = { ...stair, side: e.target.value as RailingSide };
                    update('stairs', updated);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 text-sm border px-2 py-1"
                >
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                </select>
              </label>
            </div>
            <div className="flex-1">
              <NumField
                label="Width"
                value={stair.width_ft}
                onChange={v => {
                  const updated = [...form.stairs];
                  updated[i] = { ...stair, width_ft: v };
                  update('stairs', updated);
                }}
              />
            </div>
            <button
              onClick={() => removeStair(i)}
              className="mb-0.5 text-red-400 hover:text-red-600 text-sm px-2 py-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Options</h3>
        <NumField
          label="Waste factor override"
          value={(form.wasteFactor ?? 0.10) * 100}
          onChange={v => update('wasteFactor', v / 100)}
          min={0}
          step={1}
          unit="%"
        />
      </div>
    </div>
  );
}
