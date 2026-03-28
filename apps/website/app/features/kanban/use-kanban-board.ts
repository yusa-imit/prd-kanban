import { useCallback, useEffect, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import type { BoardState, CandidateId, StageId } from "~/types/kanban";
import { useKanbanLog } from "./use-kanban-log";
import { useKanbanSelectionStore } from "./use-kanban-selection";

export function useKanbanBoard(initialState: BoardState) {
  const [boardState, setBoardState] = useState(initialState);
  const { log } = useKanbanLog();

  const moveCard = useCallback(
    (
      candidateId: CandidateId,
      sourceStageId: StageId,
      destinationStageId: StageId,
      destinationIndex: number,
    ) => {
      setBoardState((prev) => {
        const sourceCandidates = [...prev.stageCandidates[sourceStageId]];
        const sourceIndex = sourceCandidates.indexOf(candidateId);
        if (sourceIndex === -1) return prev;

        if (sourceStageId === destinationStageId) {
          const reordered = reorder({
            list: sourceCandidates,
            startIndex: sourceIndex,
            finishIndex: destinationIndex,
          });
          return {
            ...prev,
            stageCandidates: { ...prev.stageCandidates, [sourceStageId]: reordered },
          };
        }

        // Move to different column
        sourceCandidates.splice(sourceIndex, 1);
        const destCandidates = [...prev.stageCandidates[destinationStageId]];
        destCandidates.splice(destinationIndex, 0, candidateId);

        return {
          ...prev,
          stageCandidates: {
            ...prev.stageCandidates,
            [sourceStageId]: sourceCandidates,
            [destinationStageId]: destCandidates,
          },
        };
      });
    },
    [],
  );

  const moveCards = useCallback(
    (candidateIds: CandidateId[], destStageId: StageId, destIndex: number) => {
      setBoardState((prev) => {
        const idsToMove = new Set(candidateIds);
        // Remove selected candidates from all columns
        const newStageCandidates = { ...prev.stageCandidates };
        for (const stageId of Object.keys(newStageCandidates)) {
          newStageCandidates[stageId] = newStageCandidates[stageId].filter(
            (id) => !idsToMove.has(id),
          );
        }
        // Insert at destination
        const destCandidates = [...newStageCandidates[destStageId]];
        const clampedIndex = Math.min(destIndex, destCandidates.length);
        destCandidates.splice(clampedIndex, 0, ...candidateIds);
        newStageCandidates[destStageId] = destCandidates;

        return { ...prev, stageCandidates: newStageCandidates };
      });
    },
    [],
  );

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

        if (isBulk && selectedCandidateIds.length > 1) {
          // Bulk drop
          if (destination.data.type === "card") {
            const destStageId = destination.data.stageId as StageId;
            const destCandidateId = destination.data.candidateId as CandidateId;
            const closestEdge = extractClosestEdge(destination.data);

            const destCandidates = boardState.stageCandidates[destStageId];
            const indexOfTarget = destCandidates.indexOf(destCandidateId);
            const destIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;

            log("BULK_MOVE", `${selectedCandidateIds.length}명 벌크 이동 → ${destStageId}`, {
              candidateIds: selectedCandidateIds,
              destStageId,
            });
            moveCards(selectedCandidateIds, destStageId, destIndex);
          } else if (destination.data.type === "column") {
            const destStageId = destination.data.stageId as StageId;
            const destLength = boardState.stageCandidates[destStageId].length;

            log(
              "BULK_DROP_ON_EMPTY",
              `${selectedCandidateIds.length}명 벌크 드롭 → ${destStageId}`,
              {
                candidateIds: selectedCandidateIds,
                destStageId,
              },
            );
            moveCards(selectedCandidateIds, destStageId, destLength);
          }
          useKanbanSelectionStore.getState().clear();
          return;
        }

        // Single card drop
        if (destination.data.type === "card") {
          const destStageId = destination.data.stageId as StageId;
          const destCandidateId = destination.data.candidateId as CandidateId;
          const closestEdge = extractClosestEdge(destination.data);

          const destCandidates = boardState.stageCandidates[destStageId];
          const indexOfTarget = destCandidates.indexOf(destCandidateId);

          if (sourceStageId === destStageId) {
            const startIndex = destCandidates.indexOf(candidateId);
            const destinationIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget: closestEdge,
              axis: "vertical",
            });
            log(
              "CARD_REORDER",
              `${candidateId} 순서 변경: ${startIndex} → ${destinationIndex} (${destStageId})`,
              {
                candidateId,
                stageId: destStageId,
                fromIndex: startIndex,
                toIndex: destinationIndex,
              },
            );
            moveCard(candidateId, sourceStageId, destStageId, destinationIndex);
          } else {
            const destinationIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;
            log("CARD_MOVE", `${candidateId} 이동: ${sourceStageId} → ${destStageId}`, {
              candidateId,
              sourceStageId,
              destStageId,
            });
            moveCard(candidateId, sourceStageId, destStageId, destinationIndex);
          }
        } else if (destination.data.type === "column") {
          const destStageId = destination.data.stageId as StageId;
          if (sourceStageId === destStageId) return;
          const destLength = boardState.stageCandidates[destStageId].length;
          log("DROP_ON_EMPTY", `${candidateId} 빈 컬럼에 드롭: ${sourceStageId} → ${destStageId}`, {
            candidateId,
            sourceStageId,
            destStageId,
          });
          moveCard(candidateId, sourceStageId, destStageId, destLength);
        }
      },
    });
  }, [boardState, moveCard, moveCards, log]);

  return boardState;
}
