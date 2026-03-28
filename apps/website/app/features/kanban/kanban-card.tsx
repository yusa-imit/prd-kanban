import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import invariant from "tiny-invariant";
import { Card, CardContent, Badge } from "ui";
import type { Candidate, StageId } from "~/types/kanban";
import { CandidateContextMenu, CandidateDropdownMenu } from "./candidate-actions";
import { DropIndicator } from "./drop-indicator";
import { useKanbanLog } from "./use-kanban-log";

export function KanbanCard({ candidate, stageId }: { candidate: Candidate; stageId: StageId }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const { log } = useKanbanLog();

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ type: "card", candidateId: candidate.id, stageId }),
        onDragStart: () => {
          setIsDragging(true);
          log("DRAG_START", `${candidate.name} 드래그 시작 (${stageId})`, {
            candidateId: candidate.id,
            sourceStageId: stageId,
          });
        },
        onDrop: () => {
          setIsDragging(false);
          log("DRAG_END", `${candidate.name} 드래그 종료`, {
            candidateId: candidate.id,
          });
        },
      }),
      dropTargetForElements({
        element: el,
        getData: ({ input, element }) => {
          const data = { type: "card", candidateId: candidate.id, stageId };
          return attachClosestEdge(data, { input, element, allowedEdges: ["top", "bottom"] });
        },
        canDrop: ({ source }) =>
          source.data.type === "card" && source.data.candidateId !== candidate.id,
        onDrag: ({ self }) => {
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      }),
    );
  }, [candidate.id, candidate.name, stageId, log]);

  return (
    <div ref={ref} className="relative">
      {closestEdge === "top" && <DropIndicator edge="top" />}
      <CandidateContextMenu candidate={candidate}>
        <Card
          className={`cursor-grab border bg-card shadow-sm transition-opacity active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
        >
          <CardContent className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{candidate.name}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {candidate.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <CandidateDropdownMenu candidate={candidate} />
          </CardContent>
        </Card>
      </CandidateContextMenu>
      {closestEdge === "bottom" && <DropIndicator edge="bottom" />}
    </div>
  );
}
