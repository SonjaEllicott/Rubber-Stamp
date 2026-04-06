import React, { useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import StampLibrary from './components/StampLibrary';
import CardCanvas from './components/CardCanvas';
import AiGenerator from './components/AiGenerator';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { undo, toolMode, setToolMode } = useAppStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.key === 'Escape') {
        useAppStore.getState().setSelectedPlacedId(null);
        useAppStore.getState().setActiveStampId(null);
      }
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) setToolMode('stamp');
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) setToolMode('select');
      if (e.key === 'e' && !e.ctrlKey && !e.metaKey) setToolMode('erase');
    },
    [undo, setToolMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        {/* Left panel: stamp library + AI generator */}
        <aside className="flex flex-col w-56 bg-[#13111e] border-r border-white/8 overflow-hidden flex-shrink-0">
          <StampLibrary />
          <AiGenerator />
        </aside>

        {/* Canvas area */}
        <CardCanvas />

        {/* Right info panel */}
        <aside className="w-44 bg-[#13111e] border-l border-white/8 flex-shrink-0 flex flex-col p-4 gap-4 text-xs text-white/40">
          <div>
            <p className="font-semibold text-white/60 mb-2 uppercase tracking-widest text-[10px]">Shortcuts</p>
            <ul className="space-y-1.5">
              <li><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">S</kbd> Stamp mode</li>
              <li><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">V</kbd> Select mode</li>
              <li><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">E</kbd> Erase mode</li>
              <li><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">Esc</kbd> Deselect</li>
              <li><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">⌘Z</kbd> Undo</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white/60 mb-2 uppercase tracking-widest text-[10px]">Tips</p>
            <ul className="space-y-2 leading-snug">
              <li>Pick a stamp from the library, then click the card to place it.</li>
              <li>Use <strong className="text-white/50">Select</strong> to drag, resize & rotate stamps.</li>
              <li>Generate custom stamps with the ✨ AI panel below the library.</li>
              <li>Review AI stamps before saving to your collection.</li>
            </ul>
          </div>

          <div className="mt-auto">
            <p className="font-semibold text-white/60 mb-1 uppercase tracking-widest text-[10px]">Active tool</p>
            <p className="capitalize text-white/70 font-medium">{toolMode}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
