import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import type { AppTab } from './components/layout/Header';
import { SimpleForm } from './components/input/SimpleForm/SimpleForm';
import { CanvasDrawer } from './components/input/CanvasDrawer/CanvasDrawer';
import { BOMDisplay } from './components/bom/BOMDisplay';
import { ExportPanel } from './components/export/ExportPanel';
import { MaterialsPage } from './components/materials/MaterialsPage';
import { useMaterialsStore } from './hooks/useMaterialsStore';
import { useDeckCalculator } from './hooks/useDeckCalculator';
import type { DeckInput, SimpleFormInput, ShapePolygon } from './types/deck.types';

export default function App() {
  const [tab, setTab] = useState<AppTab>('simple');
  const [deckInput, setDeckInput] = useState<DeckInput | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(3);

  const { config, overrides, updateCategory, resetAll } = useMaterialsStore();
  const bom = useDeckCalculator(deckInput, config);

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

  const isCalculatorTab = tab === 'simple' || tab === 'canvas';

  return (
    <div className="min-h-screen bg-gray-100">
      <Header tab={tab} onTabChange={setTab} />

      <main className="max-w-7xl mx-auto px-4 py-6">

        {tab === 'materials' && (
          <MaterialsPage
            overrides={overrides}
            onUpdateCategory={updateCategory}
            onResetAll={resetAll}
          />
        )}

        {isCalculatorTab && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={tab === 'canvas' ? 'lg:col-span-3' : 'lg:col-span-1'}>
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  {tab === 'simple' ? 'Enter Deck Dimensions' : 'Draw Your Deck'}
                </h2>

                {tab === 'simple' && (
                  <SimpleForm onChange={handleSimpleFormChange} />
                )}

                {tab === 'canvas' && (
                  <CanvasDrawer
                    onChange={handleCanvasChange}
                    height_ft={canvasHeight}
                    onHeightChange={handleCanvasHeightChange}
                  />
                )}
              </div>
            </div>

            <div className={`${tab === 'canvas' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
              {bom ? (
                <>
                  <BOMDisplay bom={bom} />
                  {deckInput && <ExportPanel bom={bom} rawInput={deckInput} />}
                </>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">📐</div>
                  <p className="font-medium text-gray-500">
                    {tab === 'simple'
                      ? 'Fill in the deck dimensions to see your material list'
                      : 'Draw your deck shape on the canvas to see your material list'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Using materials from your catalog — <button onClick={() => setTab('materials')} className="underline text-yellow-600 hover:text-yellow-800">manage in My Materials</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 py-4 text-center text-xs text-gray-400">
        4X4 Decks Material Calculator — All quantities are estimates. Verify with your project specs.
      </footer>
    </div>
  );
}
