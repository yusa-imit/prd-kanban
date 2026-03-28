import { useCallback, useEffect, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import type { BoardState, CandidateId, StageId } from "~/types/kanban";

export function useKanbanBoard(initialState: BoardState) {
  const [boardState, setBoardState] = useState(initialState);

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

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === "card",
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const candidateId = source.data.candidateId as CandidateId;
        const sourceStageId = source.data.stageId as StageId;

        if (destination.data.type === "card") {
          // Dropped on another card
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
            moveCard(candidateId, sourceStageId, destStageId, destinationIndex);
          } else {
            const destinationIndex = closestEdge === "top" ? indexOfTarget : indexOfTarget + 1;
            moveCard(candidateId, sourceStageId, destStageId, destinationIndex);
          }
        } else if (destination.data.type === "column") {
          // Dropped on column (empty area)
          const destStageId = destination.data.stageId as StageId;
          if (sourceStageId === destStageId) return;
          const destLength = boardState.stageCandidates[destStageId].length;
          moveCard(candidateId, sourceStageId, destStageId, destLength);
        }
      },
    });
  }, [boardState, moveCard]);

  return boardState;
}
