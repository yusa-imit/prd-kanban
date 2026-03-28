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
import { Card, CardContent, Badge, Checkbox } from "ui";
import type { Candidate, StageId } from "~/types/kanban";
import { CandidateContextMenu, CandidateDropdownMenu } from "./candidate-actions";
import { DropIndicator } from "./drop-indicator";
import { useKanbanLog } from "./use-kanban-log";
import { useKanbanSelectionStore } from "./use-kanban-selection";

export function KanbanCard({ candidate, stageId }: { candidate: Candidate; stageId: StageId }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const { log } = useKanbanLog();

  const isSelected = useKanbanSelectionStore((s) => s.selectedIds.has(candidate.id));
  const draggingCandidateId = useKanbanSelectionStore((s) => s.draggingCandidateId);
  const toggle = useKanbanSelectionStore((s) => s.toggle);

  const isBulkDraggingOther =
    draggingCandidateId !== null && draggingCandidateId !== candidate.id && isSelected;

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      draggable({
        element: el,
        getInitialData: () => {
          const store = useKanbanSelectionStore.getState();
          const selected = store.selectedIds.has(candidate.id);
          if (selected && store.selectedIds.size > 1) {
            return {
              type: "card",
              candidateId: candidate.id,
              stageId,
              isBulk: true,
              selectedCandidateIds: [...store.selectedIds],
            };
          }
          return { type: "card", candidateId: candidate.id, stageId, isBulk: false };
        },
        onDragStart: () => {
          setIsDragging(true);
          useKanbanSelectionStore.getState().setDraggingCandidateId(candidate.id);
          log("DRAG_START", `${candidate.name} 드래그 시작 (${stageId})`, {
            candidateId: candidate.id,
            sourceStageId: stageId,
          });
        },
        onDrop: () => {
          setIsDragging(false);
          useKanbanSelectionStore.getState().setDraggingCandidateId(null);
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
        canDrop: ({ source }) => {
          if (source.data.type !== "card") return false;
          if (source.data.candidateId === candidate.id) return false;
          if (
            source.data.isBulk &&
            Array.isArray(source.data.selectedCandidateIds) &&
            (source.data.selectedCandidateIds as string[]).includes(candidate.id)
          ) {
            return false;
          }
          return true;
        },
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
          className={`cursor-grab border bg-card shadow-sm transition-all active:cursor-grabbing ${
            isDragging || isBulkDraggingOther ? "opacity-50" : ""
          } ${isSelected ? "ring-2 ring-primary/50" : ""}`}
        >
          <CardContent className="flex items-center gap-3 p-3">
            <div onPointerDown={(e) => e.stopPropagation()}>
              <Checkbox checked={isSelected} onCheckedChange={() => toggle(candidate.id)} />
            </div>
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
