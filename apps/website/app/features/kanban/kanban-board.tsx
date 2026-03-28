import type { BoardState } from "~/types/kanban";
import { KanbanBoardHeader } from "./kanban-board-header";
import { KanbanColumn } from "./kanban-column";
import { useKanbanBoard } from "./use-kanban-board";
import { KanbanLogContext, useKanbanLogReducer } from "./use-kanban-log";
import { DevPanel } from "./dev-panel";

function KanbanBoardInner({ initialState }: { initialState: BoardState }) {
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
      <DevPanel />
    </div>
  );
}

export function KanbanBoard({ initialState }: { initialState: BoardState }) {
  const logValue = useKanbanLogReducer();

  return (
    <KanbanLogContext value={logValue}>
      <KanbanBoardInner initialState={initialState} />
    </KanbanLogContext>
  );
}
