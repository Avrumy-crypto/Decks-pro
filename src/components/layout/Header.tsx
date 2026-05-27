export type AppTab = 'simple' | 'canvas' | 'materials';

interface HeaderProps {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function Header({ tab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Four by Four Decks"
            className="h-12 w-12 rounded-full"
          />
          <div>
            <div className="font-black text-lg leading-tight tracking-wide">FOUR×FOUR DECKS</div>
            <div className="text-yellow-400 text-xs font-medium tracking-widest uppercase">Material Calculator</div>
          </div>
        </div>

        <nav className="flex gap-1 bg-white/10 rounded-lg p-1">
          {(['simple', 'canvas', 'materials'] as AppTab[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {t === 'simple' ? 'Form Input' : t === 'canvas' ? 'Draw Deck' : 'My Materials'}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
