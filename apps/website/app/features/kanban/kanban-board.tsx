import { useEffect, useRef } from "react";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import type { BoardState } from "~/types/kanban";
import { KanbanBoardHeader } from "./kanban-board-header";
import { KanbanColumn } from "./kanban-column";
import { useKanbanBoard } from "./use-kanban-board";
import { DevPanel } from "./dev-panel";
import { BulkActionToolbar } from "./bulk-action-toolbar";

export function KanbanBoard({ initialState }: { initialState: BoardState }) {
  const boardState = useKanbanBoard(initialState);
  const boardScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boardScrollRef.current;
    if (!el) return;

    return autoScrollForElements({
      element: el,
      canScroll: ({ source }) => source.data.type === "card",
    });
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <KanbanBoardHeader recruitment={boardState.recruitment} />
      <div ref={boardScrollRef} className="flex flex-1 gap-4 overflow-x-auto px-6 pb-6">
        {boardState.stageOrder.map((stageId) => {
          const stage = boardState.stages[stageId];
          const candidateIds = boardState.stageCandidates[stageId];
          return (
            <KanbanColumn
              key={stageId}
              stageId={stageId}
              name={stage.name}
              candidateIds={candidateIds}
              candidates={boardState.candidates}
              linkStageId={stageId}
            />
          );
        })}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-50 shadow-lg">
        <BulkActionToolbar />
        <DevPanel />
      </div>
    </div>
  );
}
