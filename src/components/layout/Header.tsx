import type { InputMode } from '../../hooks/useInputMode';

interface HeaderProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="bg-amber-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 rounded-lg p-2 font-black text-xl leading-none">4X4</div>
          <div>
            <div className="font-bold text-lg leading-tight">4X4 Decks</div>
            <div className="text-amber-300 text-xs">Material Calculator</div>
          </div>
        </div>

        <nav className="flex gap-1 bg-amber-950/40 rounded-lg p-1">
          <button
            onClick={() => onModeChange('simple')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'simple'
                ? 'bg-white text-amber-900'
                : 'text-amber-200 hover:text-white hover:bg-amber-800/50'
            }`}
          >
            Form Input
          </button>
          <button
            onClick={() => onModeChange('canvas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'canvas'
                ? 'bg-white text-amber-900'
                : 'text-amber-200 hover:text-white hover:bg-amber-800/50'
            }`}
          >
            Draw Deck
          </button>
        </nav>
      </div>
    </header>
  );
}
