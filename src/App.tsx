import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { SimpleForm } from './components/input/SimpleForm/SimpleForm';
import { CanvasDrawer } from './components/input/CanvasDrawer/CanvasDrawer';
import { BOMDisplay } from './components/bom/BOMDisplay';
import { ExportPanel } from './components/export/ExportPanel';
import { useInputMode } from './hooks/useInputMode';
import { useDeckCalculator } from './hooks/useDeckCalculator';
import type { DeckInput, SimpleFormInput, ShapePolygon } from './types/deck.types';

export default function App() {
  const { mode, setMode } = useInputMode();
  const [deckInput, setDeckInput] = useState<DeckInput | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(3);

  const bom = useDeckCalculator(deckInput);

  const handleSimpleFormChange = useCallback((data: SimpleFormInput) => {
    setDeckInput({ mode: 'simple', data });
  }, []);

  const handleCanvasChange = useCallback((polygon: ShapePolygon | null) => {
    if (polygon) {
      setDeckInput({ mode: 'canvas', data: { ...polygon, height_ft: canvasHeight } });
    } else {
      setDeckInput(null);
    }
  }, [canvasHeight]);

  const handleCanvasHeightChange = useCallback((h: number) => {
    setCanvasHeight(h);
    setDeckInput(prev => {
      if (prev?.mode === 'canvas') {
        return { mode: 'canvas', data: { ...prev.data, height_ft: h } };
      }
      return prev;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header mode={mode} onModeChange={setMode} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={mode === 'canvas' ? 'lg:col-span-3' : 'lg:col-span-1'}>
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {mode === 'simple' ? 'Enter Deck Dimensions' : 'Draw Your Deck'}
              </h2>

              {mode === 'simple' && (
                <SimpleForm onChange={handleSimpleFormChange} />
              )}

              {mode === 'canvas' && (
                <CanvasDrawer
                  onChange={handleCanvasChange}
                  height_ft={canvasHeight}
                  onHeightChange={handleCanvasHeightChange}
                />
              )}
            </div>
          </div>

          <div className={`${mode === 'canvas' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            {bom ? (
              <>
                <BOMDisplay bom={bom} />
                {deckInput && <ExportPanel bom={bom} rawInput={deckInput} />}
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
                <div className="text-4xl mb-3">📐</div>
                <p className="font-medium text-gray-500">
                  {mode === 'simple'
                    ? 'Fill in the deck dimensions to see your material list'
                    : 'Draw your deck shape on the canvas to see your material list'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 py-4 text-center text-xs text-gray-400">
        4X4 Decks Material Calculator — All quantities are estimates. Verify with your project specs.
      </footer>
    </div>
  );
}
