import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { ArrowLeft } from "lucide-react";
import { Badge, Button } from "ui";
import type { StageDetailState } from "~/types/kanban";
import { KanbanColumn } from "./kanban-column";
import { useStageDetailBoard } from "./use-stage-detail-board";
import { DevPanel } from "./dev-panel";
import { BulkActionToolbar } from "./bulk-action-toolbar";

export function StageDetailBoard({ initialState }: { initialState: StageDetailState }) {
  const boardState = useStageDetailBoard(initialState);
  const boardScrollRef = useRef<HTMLDivElement>(null);

  const totalCandidates = Object.keys(boardState.candidates).length;

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
      <div className="flex items-center gap-4 px-6 py-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to="/recruitment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{boardState.stageName}</h1>
        <Badge variant="secondary" className="text-sm">
          {totalCandidates}명
        </Badge>
      </div>
      <div ref={boardScrollRef} className="flex flex-1 gap-4 overflow-x-auto px-6 pb-6">
        {boardState.actionOrder.map((actionId) => {
          const action = boardState.actions[actionId];
          const candidateIds = boardState.actionCandidates[actionId];
          return (
            <KanbanColumn
              key={actionId}
              stageId={actionId}
              name={action.name}
              candidateIds={candidateIds}
              candidates={boardState.candidates}
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
