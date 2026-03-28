import { create } from "zustand";
import type { CandidateId } from "~/types/kanban";

interface KanbanSelectionState {
  selectedIds: Set<CandidateId>;
  draggingCandidateId: CandidateId | null;
  toggle: (id: CandidateId) => void;
  clear: () => void;
  isSelected: (id: CandidateId) => boolean;
  setDraggingCandidateId: (id: CandidateId | null) => void;
  selectedCount: () => number;
}

export const useKanbanSelectionStore = create<KanbanSelectionState>((set, get) => ({
  selectedIds: new Set(),
  draggingCandidateId: null,
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),
  clear: () => set({ selectedIds: new Set() }),
  isSelected: (id) => get().selectedIds.has(id),
  setDraggingCandidateId: (id) => set({ draggingCandidateId: id }),
  selectedCount: () => get().selectedIds.size,
}));
