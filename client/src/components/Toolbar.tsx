import React, { useRef, useState, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import Konva from 'konva';
import { useAppStore } from '../store/useAppStore';
import type { ToolMode } from '../types';

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

interface ColorSwatchProps {
  label: string;
  color: string;
  onChange: (c: string) => void;
}

function ColorSwatch({ label, color, onChange }: ColorSwatchProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/8 transition-colors"
        title={label}
      >
        <div
          className="w-6 h-6 rounded-md border-2 border-white/20 shadow-inner"
          style={{ background: color }}
        />
        <span className="text-[10px] text-white/40">{label}</span>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-white/10">
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

function Slider({ label, value, min, max, step, onChange, format }: SliderProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <span className="text-[10px] text-white/40">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20 accent-violet-500"
      />
      <span className="text-[10px] text-white/50 font-mono">
        {format ? format(value) : value}
      </span>
    </div>
  );
}

interface ToolBtnProps {
  mode: ToolMode;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ToolBtn({ active, onClick, icon, label }: ToolBtnProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm
        ${active
          ? 'bg-violet-600/80 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
          : 'text-white/50 hover:bg-white/8 hover:text-white/80'
        }`}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export default function Toolbar() {
  const {
    toolMode,
    setToolMode,
    currentTint,
    setCurrentTint,
    currentOpacity,
    setCurrentOpacity,
    currentScale,
    setCurrentScale,
    activeDesign,
    setDesignBackground,
    setDesignName,
    undo,
    clearCanvas,
    history,
    selectedPlacedId,
    updatePlacedStamp,
    removePlacedStamp,
  } = useAppStore();

  const selectedStamp = activeDesign.placedStamps.find((p) => p.id === selectedPlacedId);

  const exportCard = useCallback(async () => {
    const stage = Konva.stages[0];
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 3 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${activeDesign.name.replace(/\s+/g, '_')}.png`;
    a.click();
  }, [activeDesign.name]);

  return (
    <header className="flex items-center gap-2 px-4 py-2 bg-[#13111e] border-b border-white/8 overflow-x-auto flex-shrink-0">
      {/* Card name */}
      <input
        type="text"
        value={activeDesign.name}
        onChange={(e) => setDesignName(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/60 w-36 font-semibold"
        title="Card name"
      />

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Tool modes */}
      <div className="flex gap-1">
        <ToolBtn
          mode="stamp"
          active={toolMode === 'stamp'}
          onClick={() => setToolMode('stamp')}
          label="Stamp"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
        <ToolBtn
          mode="select"
          active={toolMode === 'select'}
          onClick={() => setToolMode('select')}
          label="Select"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
        />
        <ToolBtn
          mode="erase"
          active={toolMode === 'erase'}
          onClick={() => setToolMode('erase')}
          label="Erase"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        />
      </div>

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Stamp appearance */}
      <ColorSwatch label="Tint" color={currentTint} onChange={setCurrentTint} />
      <Slider
        label="Size"
        value={currentScale}
        min={0.3}
        max={3}
        step={0.05}
        onChange={setCurrentScale}
        format={(v) => `${Math.round(v * 100)}%`}
      />
      <Slider
        label="Opacity"
        value={currentOpacity}
        min={0.1}
        max={1}
        step={0.05}
        onChange={setCurrentOpacity}
        format={(v) => `${Math.round(v * 100)}%`}
      />

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Background */}
      <ColorSwatch label="BG" color={activeDesign.background} onChange={setDesignBackground} />

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Selected stamp props */}
      {selectedStamp && toolMode === 'select' && (
        <>
          <Slider
            label="Rotate"
            value={selectedStamp.rotation}
            min={-180}
            max={180}
            step={1}
            onChange={(v) => updatePlacedStamp(selectedStamp.id, { rotation: v })}
            format={(v) => `${v}°`}
          />
          <button
            onClick={() => updatePlacedStamp(selectedStamp.id, { flipX: !selectedStamp.flipX })}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white/80 transition-colors"
            title="Flip horizontal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-[10px]">Flip</span>
          </button>
          <button
            onClick={() => removePlacedStamp(selectedStamp.id)}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
            title="Delete selected stamp"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-[10px]">Delete</span>
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
        </>
      )}

      {/* History */}
      <button
        onClick={undo}
        disabled={history.length === 0}
        className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="text-[10px]">Undo</span>
      </button>

      <button
        onClick={clearCanvas}
        className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-orange-500/20 text-white/50 hover:text-orange-400 transition-colors"
        title="Clear canvas"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-[10px]">Clear</span>
      </button>

      <button
        onClick={exportCard}
        className="flex flex-col items-center gap-1 px-3 py-1.5 ml-auto rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
        title="Export as PNG"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-[10px]">Export</span>
      </button>
    </header>
  );
}
