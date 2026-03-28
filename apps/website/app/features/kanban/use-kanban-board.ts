import { useCallback, useEffect, useRef, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import type { BoardState, CandidateId, StageId } from "~/types/kanban";
import { STAGE_ACTIONS } from "~/data/dummy-recruitment";
import { useKanbanLog } from "./use-kanban-log";
import { useKanbanSelectionStore } from "./use-kanban-selection";
import { useBoardMutation } from "./use-board-mutation";

// Pure state transition: move a single card
function moveCardPure(
  state: BoardState,
  vars: {
    candidateId: CandidateId;
    sourceStageId: StageId;
    destinationStageId: StageId;
    destinationIndex: number;
  },
): BoardState {
  const { candidateId, sourceStageId, destinationStageId, destinationIndex } = vars;
  const sourceCandidates = [...state.stageCandidates[sourceStageId]];
  const sourceIndex = sourceCandidates.indexOf(candidateId);
  if (sourceIndex === -1) return state;

  if (sourceStageId === destinationStageId) {
    const reordered = reorder({
      list: sourceCandidates,
      startIndex: sourceIndex,
      finishIndex: destinationIndex,
    });
    return {
      ...state,
      stageCandidates: { ...state.stageCandidates, [sourceStageId]: reordered },
    };
  }

  sourceCandidates.splice(sourceIndex, 1);
  const destCandidates = [...state.stageCandidates[destinationStageId]];
  destCandidates.splice(destinationIndex, 0, candidateId);

  const destActions = STAGE_ACTIONS[destinationStageId];
  const newActionId = destActions?.[0]?.id;
  const updatedCandidates = {
    ...state.candidates,
    [candidateId]: { ...state.candidates[candidateId], currentActionId: newActionId },
  };

  return {
    ...state,
    candidates: updatedCandidates,
    stageCandidates: {
      ...state.stageCandidates,
      [sourceStageId]: sourceCandidates,
      [destinationStageId]: destCandidates,
    },
  };
}

// Pure state transition: move multiple cards
function moveCardsPure(
  state: BoardState,
  vars: { candidateIds: CandidateId[]; destStageId: StageId; destIndex: number },
): BoardState {
  const { candidateIds, destStageId, destIndex } = vars;
  const idsToMove = new Set(candidateIds);
  const newStageCandidates = { ...state.stageCandidates };

  for (const stageId of Object.keys(newStageCandidates)) {
    newStageCandidates[stageId] = newStageCandidates[stageId].filter((id) => !idsToMove.has(id));
  }

  const destCandidates = [...newStageCandidates[destStageId]];
  const clampedIndex = Math.min(destIndex, destCandidates.length);
  destCandidates.splice(clampedIndex, 0, ...candidateIds);
  newStageCandidates[destStageId] = destCandidates;

  const destActions = STAGE_ACTIONS[destStageId];
  const newActionId = destActions?.[0]?.id;
  const updatedCandidates = { ...state.candidates };
  for (const id of candidateIds) {
    updatedCandidates[id] = { ...updatedCandidates[id], currentActionId: newActionId };
  }

  return { ...state, candidates: updatedCandidates, stageCandidates: newStageCandidates };
}

export function useKanbanBoard(initialState: BoardState) {
  const [boardState, setBoardState] = useState(initialState);
  const boardStateRef = useRef(boardState);
  boardStateRef.current = boardState;
  const { log } = useKanbanLog();
  const logRef = useRef(log);
  logRef.current = log;

  const getBoardState = useCallback(() => boardStateRef.current, []);
  const applyState = useCallback((state: BoardState) => setBoardState(state), []);

  const moveCard = useBoardMutation(getBoardState, applyState, { mutate: moveCardPure });
  const moveCards = useBoardMutation(getBoardState, applyState, { mutate: moveCardsPure });

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === "card",
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const candidateId = source.data.candidateId as CandidateId;
        const sourceStageId = source.data.stageId as StageId;
        const isBulk = source.data.isBulk as boolean;
        const selectedCandidateIds = (source.data.selectedCandidateIds ?? []) as CandidateId[];
        const currentState = boardStateRef.current;

        if (isBulk && selectedCandidateIds.length > 1) {
          if (destination.data.type === "card") {
            const destStageId = destination.data.stageId as StageId;
            const destCandidateId = destination.data.candidateId as CandidateId;
            const closestEdge = extractClosestEdge(destination.data);

            const destCandidates = currentState.stageCandidates[destStageId];
            const indexOfTarget = destCandidates.indexOf(destCandidateId);
            const destIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;

            logRef.current(
              "BULK_MOVE",
              `${selectedCandidateIds.length}명 벌크 이동 → ${destStageId}`,
              {
                candidateIds: selectedCandidateIds,
                destStageId,
              },
            );
            moveCards({ candidateIds: selectedCandidateIds, destStageId, destIndex });
          } else if (destination.data.type === "column") {
            const destStageId = destination.data.stageId as StageId;
            const destLength = currentState.stageCandidates[destStageId].length;

            logRef.current(
              "BULK_DROP_ON_EMPTY",
              `${selectedCandidateIds.length}명 벌크 드롭 → ${destStageId}`,
              { candidateIds: selectedCandidateIds, destStageId },
            );
            moveCards({ candidateIds: selectedCandidateIds, destStageId, destIndex: destLength });
          }
          useKanbanSelectionStore.getState().clear();
          return;
        }

        // Single card drop
        if (destination.data.type === "card") {
          const destStageId = destination.data.stageId as StageId;
          const destCandidateId = destination.data.candidateId as CandidateId;
          const closestEdge = extractClosestEdge(destination.data);

          const destCandidates = currentState.stageCandidates[destStageId];
          const indexOfTarget = destCandidates.indexOf(destCandidateId);

          if (sourceStageId === destStageId) {
            const startIndex = destCandidates.indexOf(candidateId);
            const destinationIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget: closestEdge,
              axis: "vertical",
            });
            logRef.current(
              "CARD_REORDER",
              `${candidateId} 순서 변경: ${startIndex} → ${destinationIndex} (${destStageId})`,
              {
                candidateId,
                stageId: destStageId,
                fromIndex: startIndex,
                toIndex: destinationIndex,
              },
            );
            moveCard({
              candidateId,
              sourceStageId,
              destinationStageId: destStageId,
              destinationIndex,
            });
          } else {
            const destinationIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;
            logRef.current("CARD_MOVE", `${candidateId} 이동: ${sourceStageId} → ${destStageId}`, {
              candidateId,
              sourceStageId,
              destStageId,
            });
            moveCard({
              candidateId,
              sourceStageId,
              destinationStageId: destStageId,
              destinationIndex,
            });
          }
        } else if (destination.data.type === "column") {
          const destStageId = destination.data.stageId as StageId;
          if (sourceStageId === destStageId) return;
          const destLength = currentState.stageCandidates[destStageId].length;
          logRef.current(
            "DROP_ON_EMPTY",
            `${candidateId} 빈 컬럼에 드롭: ${sourceStageId} → ${destStageId}`,
            { candidateId, sourceStageId, destStageId },
          );
          moveCard({
            candidateId,
            sourceStageId,
            destinationStageId: destStageId,
            destinationIndex: destLength,
          });
        }
      },
    });
  }, [moveCard, moveCards]);

  return boardState;
}
