import { useState } from 'react';
import type { LengthOverrides } from '../../hooks/useMaterialsStore';
import defaultConfig from '../../config/materials.config.json';

interface MaterialsPageProps {
  overrides: LengthOverrides;
  onUpdateCategory: (key: keyof LengthOverrides, lengths: number[]) => void;
  onResetAll: () => void;
}

const ALL_LENGTHS = [6, 8, 10, 12, 14, 16, 18, 20];

interface SectionDef {
  key: keyof LengthOverrides;
  label: string;
  description: string;
  defaultLengths: number[];
  usedFor: string;
}

const SECTIONS: SectionDef[] = [
  {
    key: 'deckingBoard',
    label: 'Decking Boards',
    description: '5/4×6 surface boards — the boards people walk on',
    defaultLengths: defaultConfig.deckingBoard.lengthOptions_ft,
    usedFor: 'Surface of the deck',
  },
  {
    key: 'joists',
    label: 'Joists & Rim Joists',
    description: `${defaultConfig.joists.size} framing lumber — runs under the decking`,
    defaultLengths: defaultConfig.joists.lengthOptions_ft,
    usedFor: 'Interior joists, rim joists, ledger',
  },
  {
    key: 'beams',
    label: 'Beam Lumber',
    description: 'Heavy structural beams — supports the joists',
    defaultLengths: defaultConfig.beams.lengthOptions_ft,
    usedFor: 'Built-up beams spanning between posts',
  },
  {
    key: 'posts',
    label: 'Posts',
    description: `${defaultConfig.posts.size} vertical support posts`,
    defaultLengths: defaultConfig.posts.lengthOptions_ft,
    usedFor: 'Vertical supports from footing to beam',
  },
  {
    key: 'stairs_stringer',
    label: 'Stair Stringers',
    description: `${defaultConfig.stairs.stringer_size} diagonal stair supports`,
    defaultLengths: defaultConfig.stairs.stringer_lengthOptions_ft,
    usedFor: 'The angled sides of each stair run',
  },
  {
    key: 'stairs_tread',
    label: 'Stair Treads',
    description: `${defaultConfig.stairs.tread_size} boards for the stair steps`,
    defaultLengths: [8, 10, 12, 14, 16],
    usedFor: 'The horizontal step boards',
  },
];

function LengthChips({
  available,
  allLengths,
  customLengths,
  onChange,
}: {
  available: number[];
  allLengths: number[];
  customLengths: number[];
  onChange: (lengths: number[]) => void;
}) {
  const [customInput, setCustomInput] = useState('');

  const allShown = [...new Set([...allLengths, ...customLengths])].sort((a, b) => a - b);

  function toggle(len: number) {
    if (available.includes(len)) {
      onChange(available.filter(l => l !== len));
    } else {
      onChange([...available, len].sort((a, b) => a - b));
    }
  }

  function addCustom() {
    const val = parseFloat(customInput);
    if (!val || val <= 0 || val > 40) return;
    if (!available.includes(val)) {
      onChange([...available, val].sort((a, b) => a - b));
    }
    setCustomInput('');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allShown.map(len => {
          const active = available.includes(len);
          return (
            <button
              key={len}
              onClick={() => toggle(len)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {len}'
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Custom length (ft)"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          min={1}
          max={40}
          step={0.5}
          className="w-40 text-sm border border-gray-300 rounded-md px-2 py-1 focus:border-amber-500 focus:ring-amber-500"
        />
        <button
          onClick={addCustom}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

export function MaterialsPage({ overrides, onUpdateCategory, onResetAll }: MaterialsPageProps) {
  const [saved, setSaved] = useState(false);

  function handleChange(key: keyof LengthOverrides, lengths: number[]) {
    onUpdateCategory(key, lengths);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function getActiveLengths(section: SectionDef): number[] {
    const override = overrides[section.key];
    return override && override.length > 0 ? override : section.defaultLengths;
  }

  function getCustomLengths(section: SectionDef): number[] {
    const active = getActiveLengths(section);
    return active.filter(l => !ALL_LENGTHS.includes(l));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Materials Catalog</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select the lumber lengths you stock. The calculator will only use these sizes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">Saved</span>
          )}
          <button
            onClick={onResetAll}
            className="text-sm text-red-500 hover:text-red-700 underline"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {SECTIONS.map(section => {
        const active = getActiveLengths(section);
        const custom = getCustomLengths(section);
        const isCustomized = !!overrides[section.key];

        return (
          <div key={section.key} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{section.label}</h3>
                  {isCustomized && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      Customized
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">Used for: {section.usedFor}</p>
              </div>
              {isCustomized && (
                <button
                  onClick={() => handleChange(section.key, section.defaultLengths)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline shrink-0 ml-4"
                >
                  Reset section
                </button>
              )}
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Available lengths — click to toggle on/off
              </p>
              <LengthChips
                available={active}
                allLengths={ALL_LENGTHS}
                customLengths={custom}
                onChange={lengths => handleChange(section.key, lengths)}
              />
              <p className="text-xs text-gray-400 mt-3">
                {active.length} length{active.length !== 1 ? 's' : ''} selected:{' '}
                <span className="font-medium text-gray-600">
                  {active.map(l => `${l}'`).join(', ')}
                </span>
              </p>
            </div>
          </div>
        );
      })}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>How this works:</strong> When the calculator picks a board length, it always
        chooses the shortest length from your list that fits the required size. If no length fits,
        it uses the longest available. Changes save automatically.
      </div>
    </div>
  );
}
