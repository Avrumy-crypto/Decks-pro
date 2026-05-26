import { useState } from 'react';

export type InputMode = 'simple' | 'canvas';

export function useInputMode() {
  const [mode, setMode] = useState<InputMode>('simple');
  return { mode, setMode };
}
