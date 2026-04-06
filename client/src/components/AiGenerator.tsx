import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store/useAppStore';
import type { Stamp } from '../types';

const STYLES = ['bold', 'detailed', 'minimal', 'geometric'] as const;
type Style = (typeof STYLES)[number];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface PendingCardProps {
  stamp: Stamp;
  onAccept: () => void;
  onDiscard: () => void;
  onUse: () => void;
}

function PendingCard({ stamp, onAccept, onDiscard, onUse }: PendingCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-lg bg-white/8 flex items-center justify-center cursor-pointer hover:bg-white/12 transition-colors"
        onClick={onUse}
        title="Click to use this stamp"
      >
        <img
          src={stamp.src}
          alt={stamp.name}
          className="w-14 h-14 object-contain"
          style={{ filter: 'invert(1) brightness(0.85)' }}
        />
      </div>
      <p className="text-xs text-white/60 text-center leading-tight">{stamp.name}</p>
      <div className="flex gap-2 w-full">
        <button
          onClick={onAccept}
          className="flex-1 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
          title="Save to library"
        >
          Save
        </button>
        <button
          onClick={onDiscard}
          className="flex-1 py-1 rounded-md bg-white/8 hover:bg-red-500/30 text-white/60 hover:text-red-400 text-xs font-medium transition-colors"
          title="Discard"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

export default function AiGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<Style>('bold');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const {
    pendingAiStamps,
    addPendingAiStamp,
    acceptAiStamp,
    discardAiStamp,
    addStampToLibrary,
    setActiveStampId,
    setToolMode,
  } = useAppStore();

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');

      const newStamp: Stamp = {
        id: uuidv4(),
        name: prompt.trim().slice(0, 40),
        category: 'AI Generated',
        src: svgToDataUrl(data.svg as string),
        aiGenerated: true,
        createdAt: Date.now(),
      };
      addPendingAiStamp(newStamp);
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleUseDirectly = (stamp: Stamp) => {
    addStampToLibrary(stamp);
    discardAiStamp(stamp.id);
    setActiveStampId(stamp.id);
    setToolMode('stamp');
  };

  return (
    <div className="border-t border-white/8">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/80">✨ AI Stamp Generator</span>
          {pendingAiStamps.length > 0 && (
            <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full font-bold">
              {pendingAiStamps.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-3 pb-4 space-y-3">
          {/* Prompt input */}
          <div>
            <textarea
              rows={2}
              placeholder="Describe your stamp… (e.g. 'fire-breathing dragon head')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generate();
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 resize-none transition-colors"
            />
          </div>

          {/* Style selector */}
          <div className="flex gap-1.5 flex-wrap">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors
                  ${style === s
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Generating…
              </span>
            ) : (
              'Generate Stamp'
            )}
          </button>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Pending stamps */}
          {pendingAiStamps.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2">
                Review Generated Stamps
              </p>
              <div className="grid grid-cols-2 gap-2">
                {pendingAiStamps.map((stamp) => (
                  <PendingCard
                    key={stamp.id}
                    stamp={stamp}
                    onAccept={() => acceptAiStamp(stamp.id)}
                    onDiscard={() => discardAiStamp(stamp.id)}
                    onUse={() => handleUseDirectly(stamp)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
