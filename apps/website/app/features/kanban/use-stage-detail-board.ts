import { useCallback, useEffect, useRef, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import type { ActionId, CandidateId, StageDetailState } from "~/types/kanban";
import { useKanbanLog } from "./use-kanban-log";
import { useKanbanSelectionStore } from "./use-kanban-selection";
import { useBoardMutation } from "./use-board-mutation";

function moveCardPure(
  state: StageDetailState,
  vars: {
    candidateId: CandidateId;
    sourceActionId: ActionId;
    destinationActionId: ActionId;
    destinationIndex: number;
  },
): StageDetailState {
  const { candidateId, sourceActionId, destinationActionId, destinationIndex } = vars;
  const sourceCandidates = [...state.actionCandidates[sourceActionId]];
  const sourceIndex = sourceCandidates.indexOf(candidateId);
  if (sourceIndex === -1) return state;

  if (sourceActionId === destinationActionId) {
    const reordered = reorder({
      list: sourceCandidates,
      startIndex: sourceIndex,
      finishIndex: destinationIndex,
    });
    return {
      ...state,
      actionCandidates: { ...state.actionCandidates, [sourceActionId]: reordered },
    };
  }

  sourceCandidates.splice(sourceIndex, 1);
  const destCandidates = [...state.actionCandidates[destinationActionId]];
  destCandidates.splice(destinationIndex, 0, candidateId);

  return {
    ...state,
    actionCandidates: {
      ...state.actionCandidates,
      [sourceActionId]: sourceCandidates,
      [destinationActionId]: destCandidates,
    },
  };
}

function moveCardsPure(
  state: StageDetailState,
  vars: { candidateIds: CandidateId[]; destActionId: ActionId; destIndex: number },
): StageDetailState {
  const { candidateIds, destActionId, destIndex } = vars;
  const idsToMove = new Set(candidateIds);
  const newActionCandidates = { ...state.actionCandidates };

  for (const actionId of Object.keys(newActionCandidates)) {
    newActionCandidates[actionId] = newActionCandidates[actionId].filter(
      (id) => !idsToMove.has(id),
    );
  }

  const destCandidates = [...newActionCandidates[destActionId]];
  const clampedIndex = Math.min(destIndex, destCandidates.length);
  destCandidates.splice(clampedIndex, 0, ...candidateIds);
  newActionCandidates[destActionId] = destCandidates;

  return { ...state, actionCandidates: newActionCandidates };
}

export function useStageDetailBoard(initialState: StageDetailState) {
  const [boardState, setBoardState] = useState(initialState);
  const boardStateRef = useRef(boardState);
  boardStateRef.current = boardState;
  const { log } = useKanbanLog();
  const logRef = useRef(log);
  logRef.current = log;

  const getBoardState = useCallback(() => boardStateRef.current, []);
  const applyState = useCallback((state: StageDetailState) => setBoardState(state), []);

  const moveCard = useBoardMutation(getBoardState, applyState, { mutate: moveCardPure });
  const moveCards = useBoardMutation(getBoardState, applyState, { mutate: moveCardsPure });

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === "card",
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const candidateId = source.data.candidateId as CandidateId;
        const sourceActionId = source.data.stageId as ActionId;
        const isBulk = source.data.isBulk as boolean;
        const selectedCandidateIds = (source.data.selectedCandidateIds ?? []) as CandidateId[];
        const currentState = boardStateRef.current;

        if (isBulk && selectedCandidateIds.length > 1) {
          if (destination.data.type === "card") {
            const destActionId = destination.data.stageId as ActionId;
            const destCandidateId = destination.data.candidateId as CandidateId;
            const closestEdge = extractClosestEdge(destination.data);

            const destCandidates = currentState.actionCandidates[destActionId];
            const indexOfTarget = destCandidates.indexOf(destCandidateId);
            const destIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;

            logRef.current(
              "BULK_MOVE",
              `${selectedCandidateIds.length}명 벌크 이동 → ${destActionId}`,
              { candidateIds: selectedCandidateIds, destActionId },
            );
            moveCards({ candidateIds: selectedCandidateIds, destActionId, destIndex });
          } else if (destination.data.type === "column") {
            const destActionId = destination.data.stageId as ActionId;
            const destLength = currentState.actionCandidates[destActionId].length;

            logRef.current(
              "BULK_DROP_ON_EMPTY",
              `${selectedCandidateIds.length}명 벌크 드롭 → ${destActionId}`,
              { candidateIds: selectedCandidateIds, destActionId },
            );
            moveCards({ candidateIds: selectedCandidateIds, destActionId, destIndex: destLength });
          }
          useKanbanSelectionStore.getState().clear();
          return;
        }

        // Single card drop
        if (destination.data.type === "card") {
          const destActionId = destination.data.stageId as ActionId;
          const destCandidateId = destination.data.candidateId as CandidateId;
          const closestEdge = extractClosestEdge(destination.data);

          const destCandidates = currentState.actionCandidates[destActionId];
          const indexOfTarget = destCandidates.indexOf(destCandidateId);

          if (sourceActionId === destActionId) {
            const startIndex = destCandidates.indexOf(candidateId);
            const destinationIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget: closestEdge,
              axis: "vertical",
            });
            logRef.current(
              "CARD_REORDER",
              `${candidateId} 순서 변경: ${startIndex} → ${destinationIndex} (${destActionId})`,
              {
                candidateId,
                actionId: destActionId,
                fromIndex: startIndex,
                toIndex: destinationIndex,
              },
            );
            moveCard({
              candidateId,
              sourceActionId,
              destinationActionId: destActionId,
              destinationIndex,
            });
          } else {
            const destinationIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;
            logRef.current(
              "CARD_MOVE",
              `${candidateId} 이동: ${sourceActionId} → ${destActionId}`,
              {
                candidateId,
                sourceActionId,
                destActionId,
              },
            );
            moveCard({
              candidateId,
              sourceActionId,
              destinationActionId: destActionId,
              destinationIndex,
            });
          }
        } else if (destination.data.type === "column") {
          const destActionId = destination.data.stageId as ActionId;
          if (sourceActionId === destActionId) return;
          const destLength = currentState.actionCandidates[destActionId].length;
          logRef.current(
            "DROP_ON_EMPTY",
            `${candidateId} 빈 컬럼에 드롭: ${sourceActionId} → ${destActionId}`,
            { candidateId, sourceActionId, destActionId },
          );
          moveCard({
            candidateId,
            sourceActionId,
            destinationActionId: destActionId,
            destinationIndex: destLength,
          });
        }
      },
    });
  }, [moveCard, moveCards]);

  return boardState;
}
