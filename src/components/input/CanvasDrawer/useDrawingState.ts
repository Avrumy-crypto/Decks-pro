import { useReducer, useCallback } from 'react';
import type { Point, CanvasStairMarker } from '../../../types/deck.types';
import { snapToGrid, pxToFt, distancePx } from './canvasUtils';

export type ToolMode = 'idle' | 'drawing' | 'editing' | 'addStairs';

interface DrawingState {
  mode: ToolMode;
  points: Point[];
  isClosed: boolean;
  stairMarkers: CanvasStairMarker[];
  scale: number;
  snapGrid_ft: number;
  cursorPx: { x: number; y: number } | null;
}

type Action =
  | { type: 'SET_MODE'; mode: ToolMode }
  | { type: 'SET_SCALE'; scale: number }
  | { type: 'SET_CURSOR'; x: number; y: number }
  | { type: 'PLACE_POINT'; x_px: number; y_px: number }
  | { type: 'DRAG_POINT'; index: number; x_px: number; y_px: number }
  | { type: 'MARK_STAIR'; edgeIndex: number; width_ft: number }
  | { type: 'REMOVE_STAIR'; index: number }
  | { type: 'UNDO' }
  | { type: 'RESET' };

const INITIAL: DrawingState = {
  mode: 'idle',
  points: [],
  isClosed: false,
  stairMarkers: [],
  scale: 20,
  snapGrid_ft: 0.5,
  cursorPx: null,
};

const CLOSE_THRESHOLD_PX = 14;

function reducer(state: DrawingState, action: Action): DrawingState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SCALE':
      return { ...state, scale: action.scale };

    case 'SET_CURSOR':
      return { ...state, cursorPx: { x: action.x, y: action.y } };

    case 'PLACE_POINT': {
      if (state.isClosed) return state;
      const x_ft = snapToGrid(pxToFt(action.x_px, state.scale), state.snapGrid_ft);
      const y_ft = snapToGrid(pxToFt(action.y_px, state.scale), state.snapGrid_ft);

      if (state.points.length >= 3) {
        const first = state.points[0];
        const firstPx = { x: first.x * state.scale, y: first.y * state.scale };
        const dist = distancePx(action.x_px, action.y_px, firstPx.x, firstPx.y);
        if (dist < CLOSE_THRESHOLD_PX) {
          return { ...state, isClosed: true, mode: 'editing' };
        }
      }

      return { ...state, points: [...state.points, { x: x_ft, y: y_ft }] };
    }

    case 'DRAG_POINT': {
      if (!state.isClosed) return state;
      const x_ft = snapToGrid(pxToFt(action.x_px, state.scale), state.snapGrid_ft);
      const y_ft = snapToGrid(pxToFt(action.y_px, state.scale), state.snapGrid_ft);
      const points = state.points.map((p, i) =>
        i === action.index ? { x: x_ft, y: y_ft } : p
      );
      return { ...state, points };
    }

    case 'MARK_STAIR': {
      const marker: CanvasStairMarker = {
        edgeIndex: action.edgeIndex,
        offsetAlongEdge_ft: 0,
        width_ft: action.width_ft,
      };
      return { ...state, stairMarkers: [...state.stairMarkers, marker] };
    }

    case 'REMOVE_STAIR':
      return { ...state, stairMarkers: state.stairMarkers.filter((_, i) => i !== action.index) };

    case 'UNDO':
      if (state.isClosed) return state;
      return { ...state, points: state.points.slice(0, -1) };

    case 'RESET':
      return { ...INITIAL, scale: state.scale };

    default:
      return state;
  }
}

export function useDrawingState() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const setMode = useCallback((mode: ToolMode) => dispatch({ type: 'SET_MODE', mode }), []);
  const setScale = useCallback((scale: number) => dispatch({ type: 'SET_SCALE', scale }), []);
  const setCursor = useCallback((x: number, y: number) => dispatch({ type: 'SET_CURSOR', x, y }), []);
  const placePoint = useCallback((x_px: number, y_px: number) => dispatch({ type: 'PLACE_POINT', x_px, y_px }), []);
  const dragPoint = useCallback((index: number, x_px: number, y_px: number) => dispatch({ type: 'DRAG_POINT', index, x_px, y_px }), []);
  const markStair = useCallback((edgeIndex: number, width_ft: number) => dispatch({ type: 'MARK_STAIR', edgeIndex, width_ft }), []);
  const removeStair = useCallback((index: number) => dispatch({ type: 'REMOVE_STAIR', index }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, setMode, setScale, setCursor, placePoint, dragPoint, markStair, removeStair, undo, reset };
}
