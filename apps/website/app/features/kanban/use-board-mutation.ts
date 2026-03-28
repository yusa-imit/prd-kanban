import { useCallback, useRef } from "react";

interface MutationOptions<TState, TVariables> {
  mutate: (state: TState, variables: TVariables) => TState;
  apiFn?: (variables: TVariables) => Promise<void>;
  onRollback?: (snapshot: TState) => void;
}

export function useBoardMutation<TState, TVariables>(
  getBoardState: () => TState,
  setBoardState: (state: TState) => void,
  options: MutationOptions<TState, TVariables>,
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
