import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Stamp, PlacedStamp, CardDesign, ToolMode } from '../types';
import { DEFAULT_STAMPS } from '../utils/defaultStamps';

interface HistoryEntry {
  placedStamps: PlacedStamp[];
  background: string;
}

interface AppState {
  // Library
  stampLibrary: Stamp[];
  addStampToLibrary: (stamp: Stamp) => void;
  removeStampFromLibrary: (id: string) => void;

  // Active design
  activeDesign: CardDesign;
  setDesignBackground: (color: string) => void;
  setDesignName: (name: string) => void;

  // Stamp placement
  placeStamp: (stampId: string, x: number, y: number) => void;
  updatePlacedStamp: (id: string, changes: Partial<PlacedStamp>) => void;
  removePlacedStamp: (id: string) => void;
  clearCanvas: () => void;

  // Selection
  selectedPlacedId: string | null;
  setSelectedPlacedId: (id: string | null) => void;

  // Active stamp to place
  activeStampId: string | null;
  setActiveStampId: (id: string | null) => void;

  // Tool
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;

  // Stamp tint / brush settings
  currentTint: string;
  setCurrentTint: (color: string) => void;
  currentOpacity: number;
  setCurrentOpacity: (v: number) => void;
  currentScale: number;
  setCurrentScale: (v: number) => void;

  // History (undo)
  history: HistoryEntry[];
  pushHistory: () => void;
  undo: () => void;

  // AI pending stamps (try before saving)
  pendingAiStamps: Stamp[];
  addPendingAiStamp: (stamp: Stamp) => void;
  acceptAiStamp: (id: string) => void;
  discardAiStamp: (id: string) => void;
}

const newDesign = (): CardDesign => ({
  id: uuidv4(),
  name: 'My Card',
  background: '#f5f0e8',
  placedStamps: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      stampLibrary: DEFAULT_STAMPS,
      addStampToLibrary: (stamp) =>
        set((s) => ({ stampLibrary: [...s.stampLibrary, stamp] })),
      removeStampFromLibrary: (id) =>
        set((s) => ({
          stampLibrary: s.stampLibrary.filter((st) => st.id !== id),
        })),

      activeDesign: newDesign(),
      setDesignBackground: (color) =>
        set((s) => ({
          activeDesign: { ...s.activeDesign, background: color, updatedAt: Date.now() },
        })),
      setDesignName: (name) =>
        set((s) => ({
          activeDesign: { ...s.activeDesign, name, updatedAt: Date.now() },
        })),

      placeStamp: (stampId, x, y) => {
        get().pushHistory();
        const placed: PlacedStamp = {
          id: uuidv4(),
          stampId,
          x,
          y,
          rotation: 0,
          scale: get().currentScale,
          tint: get().currentTint,
          opacity: get().currentOpacity,
          flipX: false,
        };
        set((s) => ({
          activeDesign: {
            ...s.activeDesign,
            placedStamps: [...s.activeDesign.placedStamps, placed],
            updatedAt: Date.now(),
          },
          selectedPlacedId: placed.id,
        }));
      },

      updatePlacedStamp: (id, changes) =>
        set((s) => ({
          activeDesign: {
            ...s.activeDesign,
            placedStamps: s.activeDesign.placedStamps.map((p) =>
              p.id === id ? { ...p, ...changes } : p
            ),
            updatedAt: Date.now(),
          },
        })),

      removePlacedStamp: (id) => {
        get().pushHistory();
        set((s) => ({
          activeDesign: {
            ...s.activeDesign,
            placedStamps: s.activeDesign.placedStamps.filter((p) => p.id !== id),
            updatedAt: Date.now(),
          },
          selectedPlacedId: s.selectedPlacedId === id ? null : s.selectedPlacedId,
        }));
      },

      clearCanvas: () => {
        get().pushHistory();
        set((s) => ({
          activeDesign: {
            ...s.activeDesign,
            placedStamps: [],
            updatedAt: Date.now(),
          },
          selectedPlacedId: null,
        }));
      },

      selectedPlacedId: null,
      setSelectedPlacedId: (id) => set({ selectedPlacedId: id }),

      activeStampId: null,
      setActiveStampId: (id) => set({ activeStampId: id }),

      toolMode: 'stamp',
      setToolMode: (mode) => set({ toolMode: mode }),

      currentTint: '#000000',
      setCurrentTint: (color) => set({ currentTint: color }),
      currentOpacity: 1,
      setCurrentOpacity: (v) => set({ currentOpacity: v }),
      currentScale: 1,
      setCurrentScale: (v) => set({ currentScale: v }),

      history: [],
      pushHistory: () =>
        set((s) => ({
          history: [
            ...s.history.slice(-49),
            {
              placedStamps: s.activeDesign.placedStamps,
              background: s.activeDesign.background,
            },
          ],
        })),
      undo: () =>
        set((s) => {
          if (s.history.length === 0) return {};
          const prev = s.history[s.history.length - 1];
          return {
            history: s.history.slice(0, -1),
            activeDesign: {
              ...s.activeDesign,
              placedStamps: prev.placedStamps,
              background: prev.background,
              updatedAt: Date.now(),
            },
            selectedPlacedId: null,
          };
        }),

      pendingAiStamps: [],
      addPendingAiStamp: (stamp) =>
        set((s) => ({ pendingAiStamps: [...s.pendingAiStamps, stamp] })),
      acceptAiStamp: (id) =>
        set((s) => {
          const stamp = s.pendingAiStamps.find((st) => st.id === id);
          if (!stamp) return {};
          return {
            stampLibrary: [...s.stampLibrary, stamp],
            pendingAiStamps: s.pendingAiStamps.filter((st) => st.id !== id),
          };
        }),
      discardAiStamp: (id) =>
        set((s) => ({
          pendingAiStamps: s.pendingAiStamps.filter((st) => st.id !== id),
        })),
    }),
    {
      name: 'rubber-stamp-storage',
      partialize: (s) => ({
        stampLibrary: s.stampLibrary,
        activeDesign: s.activeDesign,
      }),
    }
  )
);
