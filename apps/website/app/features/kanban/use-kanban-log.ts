import { createContext, useCallback, useContext, useReducer } from "react";

export type KanbanLogEventType =
  | "DRAG_START"
  | "DRAG_END"
  | "CARD_REORDER"
  | "CARD_MOVE"
  | "DROP_ON_EMPTY"
  | "MENU_ACTION";

export interface KanbanLogEntry {
  id: string;
  type: KanbanLogEventType;
  timestamp: number;
  data: Record<string, unknown>;
  message: string;
}

interface KanbanLogState {
  entries: KanbanLogEntry[];
}

type KanbanLogAction = { type: "ADD"; entry: KanbanLogEntry } | { type: "CLEAR" };

function logReducer(state: KanbanLogState, action: KanbanLogAction): KanbanLogState {
  switch (action.type) {
    case "ADD":
      return { entries: [action.entry, ...state.entries] };
    case "CLEAR":
      return { entries: [] };
  }
}

let logIdCounter = 0;

interface KanbanLogContextValue {
  entries: KanbanLogEntry[];
  log: (type: KanbanLogEventType, message: string, data?: Record<string, unknown>) => void;
  clear: () => void;
}

export const KanbanLogContext = createContext<KanbanLogContextValue | null>(null);

export function useKanbanLogReducer() {
  const [state, dispatch] = useReducer(logReducer, { entries: [] });

  const log = useCallback(
    (type: KanbanLogEventType, message: string, data: Record<string, unknown> = {}) => {
      dispatch({
        type: "ADD",
        entry: {
          id: String(++logIdCounter),
          type,
          timestamp: Date.now(),
          data,
          message,
        },
      });
    },
    [],
  );

  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  return { entries: state.entries, log, clear };
}

export function useKanbanLog() {
  const ctx = useContext(KanbanLogContext);
  if (!ctx) throw new Error("useKanbanLog must be used within KanbanLogProvider");
  return ctx;
}
