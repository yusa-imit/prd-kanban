import { create } from "zustand";

export type KanbanLogEventType =
  | "DRAG_START"
  | "DRAG_END"
  | "CARD_REORDER"
  | "CARD_MOVE"
  | "DROP_ON_EMPTY"
  | "MENU_ACTION"
  | "BULK_MOVE"
  | "BULK_DROP_ON_EMPTY";

export interface KanbanLogEntry {
  id: string;
  type: KanbanLogEventType;
  timestamp: number;
  data: Record<string, unknown>;
  message: string;
}

interface KanbanLogState {
  entries: KanbanLogEntry[];
  log: (type: KanbanLogEventType, message: string, data?: Record<string, unknown>) => void;
  clear: () => void;
}

let logIdCounter = 0;

export const useKanbanLogStore = create<KanbanLogState>((set) => ({
  entries: [],
  log: (type, message, data = {}) => {
    const entry: KanbanLogEntry = {
      id: String(++logIdCounter),
      type,
      timestamp: Date.now(),
      data,
      message,
    };
    set((state) => ({ entries: [entry, ...state.entries] }));
  },
  clear: () => set({ entries: [] }),
}));

export function useKanbanLog() {
  return useKanbanLogStore();
}
