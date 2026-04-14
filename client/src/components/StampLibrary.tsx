import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Stamp } from '../types';

interface StampTileProps {
  stamp: Stamp;
  isActive: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

function StampTile({ stamp, isActive, onSelect, onRemove }: StampTileProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onSelect}
      title={stamp.name}
    >
      <div
        className={`
          w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all duration-150
          ${isActive
            ? 'border-violet-400 bg-violet-950/60 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
            : 'border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-950/30'
          }
        `}
      >
        <img
          src={stamp.src}
          alt={stamp.name}
          className="w-9 h-9 object-contain"
          style={{ filter: 'invert(1) brightness(0.85)' }}
        />
      </div>
      {hovering && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none border border-white/10">
          {stamp.name}
        </div>
      )}
      {stamp.aiGenerated && onRemove && hovering && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-400 z-10"
          title="Remove from library"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function StampLibrary() {
  const {
    stampLibrary,
    activeStampId,
    setActiveStampId,
    toolMode,
    setToolMode,
    removeStampFromLibrary,
  } = useAppStore();

  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stampLibrary.map((s) => s.category)));
    return cats.sort();
  }, [stampLibrary]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stampLibrary.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [stampLibrary, search]);

  const grouped = useMemo(() => {
    return categories.reduce<Record<string, Stamp[]>>((acc, cat) => {
      const stamps = filtered.filter((s) => s.category === cat);
      if (stamps.length > 0) acc[cat] = stamps;
      return acc;
    }, {});
  }, [categories, filtered]);

  const handleSelect = (id: string) => {
    setActiveStampId(id === activeStampId ? null : id);
    if (toolMode !== 'stamp') setToolMode('stamp');
  };

  return (
    <aside className="w-56 flex flex-col bg-[#13111e] border-r border-white/8 overflow-hidden">
      <div className="p-3 border-b border-white/8">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
          Stamp Library
        </h2>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 focus:bg-violet-950/20 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(grouped).map(([category, stamps]) => (
          <div key={category}>
            <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2">
              {category}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {stamps.map((stamp) => (
                <StampTile
                  key={stamp.id}
                  stamp={stamp}
                  isActive={activeStampId === stamp.id}
                  onSelect={() => handleSelect(stamp.id)}
                  onRemove={
                    stamp.aiGenerated
                      ? () => removeStampFromLibrary(stamp.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="text-white/30 text-xs text-center mt-8">No stamps found</p>
        )}
      </div>
    </aside>
  );
}
