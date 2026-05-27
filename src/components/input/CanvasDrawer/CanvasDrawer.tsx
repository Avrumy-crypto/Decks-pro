import { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { ShapePolygon } from '../../../types/deck.types';
import { useDrawingState } from './useDrawingState';
import { toKonvaPoints, ftToPx, edgeLengthFt } from './canvasUtils';

interface CanvasDrawerProps {
  onChange: (polygon: ShapePolygon | null) => void;
  height_ft: number;
  onHeightChange: (h: number) => void;
}

const CANVAS_W = 700;
const CANVAS_H = 500;
const GRID_STEP_FT = 1;

export function CanvasDrawer({ onChange, height_ft, onHeightChange }: CanvasDrawerProps) {
  const { state, setMode, setScale, setCursor, placePoint, dragPoint, markStair, removeStair, undo, reset } = useDrawingState();
  const [stairWidth, setStairWidth] = useState(4);
  const stageRef = useRef<Konva.Stage>(null);

  const { points, isClosed, stairMarkers, scale, cursorPx, mode } = state;

  const gridLines = [];
  const cols = Math.floor(CANVAS_W / (GRID_STEP_FT * scale)) + 1;
  const rows = Math.floor(CANVAS_H / (GRID_STEP_FT * scale)) + 1;
  for (let c = 0; c <= cols; c++) {
    const x = c * GRID_STEP_FT * scale;
    gridLines.push(<Line key={`c${c}`} points={[x, 0, x, CANVAS_H]} stroke="#e5e7eb" strokeWidth={0.5} />);
  }
  for (let r = 0; r <= rows; r++) {
    const y = r * GRID_STEP_FT * scale;
    gridLines.push(<Line key={`r${r}`} points={[0, y, CANVAS_W, y]} stroke="#e5e7eb" strokeWidth={0.5} />);
  }

  const konvaPoints = toKonvaPoints(points, scale);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()!.getPointerPosition()!;
    if (mode === 'drawing') {
      placePoint(pos.x, pos.y);
    } else if (mode === 'addStairs' && isClosed && points.length >= 2) {
      let bestEdge = 0;
      let bestDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const p1x = ftToPx(points[i].x, scale);
        const p1y = ftToPx(points[i].y, scale);
        const p2x = ftToPx(points[j].x, scale);
        const p2y = ftToPx(points[j].y, scale);
        const mx = (p1x + p2x) / 2;
        const my = (p1y + p2y) / 2;
        const d = Math.sqrt((pos.x - mx) ** 2 + (pos.y - my) ** 2);
        if (d < bestDist) { bestDist = d; bestEdge = i; }
      }
      markStair(bestEdge, stairWidth);
    }
  }, [mode, isClosed, placePoint, points, scale, markStair, stairWidth]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()!.getPointerPosition()!;
    setCursor(pos.x, pos.y);
  }, [setCursor]);

  const handleDragEnd = useCallback((index: number, e: Konva.KonvaEventObject<DragEvent>) => {
    dragPoint(index, e.target.x(), e.target.y());
    e.target.x(0);
    e.target.y(0);
  }, [dragPoint]);

  const area_sqft = isClosed && points.length >= 3
    ? Math.abs(points.reduce((sum, p, i) => {
        const j = (i + 1) % points.length;
        return sum + p.x * points[j].y - points[j].x * p.y;
      }, 0)) / 2
    : 0;

  const perimeter_lf = isClosed
    ? points.reduce((sum, p, i) => {
        const j = (i + 1) % points.length;
        return sum + edgeLengthFt(p, points[j]);
      }, 0)
    : 0;

  const rubberPoints = !isClosed && points.length > 0 && cursorPx
    ? [...konvaPoints, cursorPx.x, cursorPx.y]
    : konvaPoints;

  const stairLines: ShapePolygon['stairs'] = stairMarkers.map((m, _i) => ({
    edgeIndex: m.edgeIndex,
    offsetAlongEdge_ft: m.offsetAlongEdge_ft,
    width_ft: m.width_ft,
  }));

  if (isClosed) {
    const polygon: ShapePolygon = { points, stairs: stairLines, height_ft };
    onChange(polygon);
  } else {
    onChange(null);
  }

  const scales = [10, 15, 20, 30, 40];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => { reset(); setMode('drawing'); }}
          className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${mode === 'drawing' && !isClosed ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Draw
        </button>
        <button
          onClick={() => setMode('editing')}
          disabled={!isClosed}
          className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors disabled:opacity-40 ${mode === 'editing' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Edit Shape
        </button>
        <button
          onClick={() => setMode('addStairs')}
          disabled={!isClosed}
          className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors disabled:opacity-40 ${mode === 'addStairs' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Add Stairs
        </button>
        <button
          onClick={undo}
          disabled={isClosed || points.length === 0}
          className="px-3 py-1.5 rounded text-sm font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded text-sm font-medium border bg-white text-red-600 border-red-200 hover:bg-red-50"
        >
          Clear
        </button>
        <select
          value={scale}
          onChange={e => setScale(Number(e.target.value))}
          className="px-2 py-1.5 rounded text-sm border border-gray-300"
        >
          {scales.map(s => <option key={s} value={s}>{s} px/ft</option>)}
        </select>
        {mode === 'addStairs' && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Stair width:</span>
            <input
              type="number"
              value={stairWidth}
              onChange={e => setStairWidth(Number(e.target.value))}
              min={2} max={12} step={0.5}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">ft</span>
          </label>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Deck Height:</span>
          <input
            type="number"
            value={height_ft}
            onChange={e => onHeightChange(parseFloat(e.target.value) || 0)}
            min={0} step={0.25}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-500">ft above grade</span>
        </label>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white" style={{ cursor: mode === 'drawing' ? 'crosshair' : mode === 'addStairs' ? 'cell' : 'default' }}>
        <Stage
          ref={stageRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleStageClick}
          onMouseMove={handleMouseMove}
        >
          <Layer>{gridLines}</Layer>

          <Layer>
            {points.length > 0 && (
              <Line
                points={rubberPoints}
                stroke={isClosed ? '#111111' : '#FFC500'}
                strokeWidth={2}
                closed={isClosed}
                fill={isClosed ? 'rgba(255,197,0,0.15)' : undefined}
                dash={isClosed ? undefined : [6, 3]}
              />
            )}

            {isClosed && points.map((p, i) => {
              const j = (i + 1) % points.length;
              const mx = (ftToPx(p.x, scale) + ftToPx(points[j].x, scale)) / 2;
              const my = (ftToPx(p.y, scale) + ftToPx(points[j].y, scale)) / 2;
              const len = edgeLengthFt(p, points[j]);
              return (
                <Text
                  key={`len-${i}`}
                  x={mx - 20}
                  y={my - 8}
                  text={`${len.toFixed(1)}'`}
                  fontSize={10}
                  fill="#6b7280"
                  fontStyle="bold"
                />
              );
            })}

            {isClosed && area_sqft > 0 && (() => {
              const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
              const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
              return (
                <Text
                  x={ftToPx(cx, scale) - 40}
                  y={ftToPx(cy, scale) - 10}
                  text={`${area_sqft.toFixed(0)} sq ft`}
                  fontSize={12}
                  fill="#111111"
                  fontStyle="bold"
                />
              );
            })()}

            {stairMarkers.map((marker, idx) => {
              const ei = marker.edgeIndex;
              const p1 = points[ei];
              const p2 = points[(ei + 1) % points.length];
              const mx = (ftToPx(p1.x, scale) + ftToPx(p2.x, scale)) / 2;
              const my = (ftToPx(p1.y, scale) + ftToPx(p2.y, scale)) / 2;
              const w = ftToPx(marker.width_ft, scale);
              return (
                <Rect
                  key={`stair-${idx}`}
                  x={mx - w / 2}
                  y={my - 8}
                  width={w}
                  height={16}
                  fill="rgba(251,146,60,0.7)"
                  stroke="#f97316"
                  strokeWidth={1}
                  cornerRadius={2}
                  onClick={() => removeStair(idx)}
                />
              );
            })}

            {mode === 'editing' && points.map((p, i) => (
              <Circle
                key={`handle-${i}`}
                x={ftToPx(p.x, scale)}
                y={ftToPx(p.y, scale)}
                radius={6}
                fill="white"
                stroke="#111111"
                strokeWidth={2}
                draggable
                onDragEnd={e => handleDragEnd(i, e)}
              />
            ))}

            {!isClosed && points.map((p, i) => (
              <Circle
                key={`dot-${i}`}
                x={ftToPx(p.x, scale)}
                y={ftToPx(p.y, scale)}
                radius={4}
                fill="#FFC500"
              />
            ))}

            {!isClosed && points.length > 0 && (
              <Circle
                x={ftToPx(points[0].x, scale)}
                y={ftToPx(points[0].y, scale)}
                radius={8}
                fill="none"
                stroke="#16a34a"
                strokeWidth={2}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div className="flex gap-6 text-sm text-gray-600">
        <span>Area: <strong>{area_sqft.toFixed(1)} sq ft</strong></span>
        <span>Perimeter: <strong>{perimeter_lf.toFixed(1)} lf</strong></span>
        {!isClosed && points.length > 0 && (
          <span className="text-yellow-600 font-medium">Click starting point (green) to close shape</span>
        )}
        {isClosed && (
          <span className="text-green-600 font-medium">Shape complete — BOM calculated below</span>
        )}
      </div>

      {stairMarkers.length > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Stairs: </span>
          {stairMarkers.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1 mr-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              {m.width_ft} ft wide
              <button onClick={() => removeStair(i)} className="text-orange-500 hover:text-orange-700">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
