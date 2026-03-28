import { useCallback, useRef } from "react";
import type { BoardState } from "~/types/kanban";

interface MutationOptions<TVariables> {
  mutate: (state: BoardState, variables: TVariables) => BoardState;
  apiFn?: (variables: TVariables) => Promise<void>;
  onRollback?: (snapshot: BoardState) => void;
}

export function useBoardMutation<TVariables>(
  getBoardState: () => BoardState,
  setBoardState: (state: BoardState) => void,
  options: MutationOptions<TVariables>,
) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    (variables: TVariables) => {
      const { mutate, apiFn, onRollback } = optionsRef.current;
      const snapshot = getBoardState();
      const nextState = mutate(snapshot, variables);
      setBoardState(nextState);

      if (apiFn) {
        apiFn(variables).catch(() => {
          setBoardState(snapshot);
          onRollback?.(snapshot);
        });
      }
    },
    [getBoardState, setBoardState],
  );

  return execute;
}
