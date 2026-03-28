import type { BoardState } from "~/types/kanban";
import { KanbanBoardHeader } from "./kanban-board-header";
import { KanbanColumn } from "./kanban-column";
import { useKanbanBoard } from "./use-kanban-board";
import { DevPanel } from "./dev-panel";
import { BulkActionToolbar } from "./bulk-action-toolbar";

export function KanbanBoard({ initialState }: { initialState: BoardState }) {
  const boardState = useKanbanBoard(initialState);

  return (
    <div className="flex h-screen flex-col">
      <KanbanBoardHeader recruitment={boardState.recruitment} />
      <div className="flex flex-1 gap-4 overflow-x-auto px-6 pb-6">
        {boardState.stageOrder.map((stageId) => {
          const stage = boardState.stages[stageId];
          const candidateIds = boardState.stageCandidates[stageId];
          const candidates = candidateIds.map((id) => boardState.candidates[id]);
          return (
            <KanbanColumn
              key={stageId}
              stageId={stageId}
              name={stage.name}
              candidates={candidates}
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
