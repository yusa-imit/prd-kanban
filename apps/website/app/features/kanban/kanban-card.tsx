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
import { STAGE_ACTIONS } from "~/data/dummy-recruitment";
import { CandidateContextMenu, CandidateDropdownMenu } from "./candidate-actions";
import { DropIndicator } from "./drop-indicator";
import { useKanbanLog } from "./use-kanban-log";
import { useKanbanSelectionStore } from "./use-kanban-selection";

// --- Utility functions ---

function isExperienceTag(tag: string): boolean {
  return tag === "신입" || tag.startsWith("경력");
}

function getExperienceTagClasses(tag: string): string {
  if (tag === "신입") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
  }
  const match = tag.match(/경력\s*(\d+)/);
  if (match) {
    const years = parseInt(match[1], 10);
    if (years <= 3) {
      return "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800";
    }
    if (years <= 7) {
      return "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800";
    }
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  }
  // "경력" without a number — treat as mid-level
  return "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800";
}

function getActionTag(actionName: string): { label: string; classes: string } {
  if (/완료|확정|합격|수령/.test(actionName)) {
    return {
      label: "완료",
      classes:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    };
  }
  if (actionName.endsWith("중")) {
    return {
      label: "진행",
      classes:
        "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    };
  }
  if (/대기/.test(actionName)) {
    return {
      label: "대기",
      classes:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    };
  }
  if (/발송|요청|안내|조율|준비|접수|통보|예약/.test(actionName)) {
    return {
      label: "준비",
      classes:
        "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    };
  }
  return { label: "기타", classes: "bg-muted text-muted-foreground border-border/60" };
}

function formatAppliedDate(isoDate: string): string {
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${dd} ${hh}:${mm}`;
}

// --- Component ---

function resolveActionName(candidate: Candidate, stageId: StageId): string | null {
  if (!candidate.currentActionId) return null;
  const actions = STAGE_ACTIONS[stageId];
  if (!actions) return null;
  const action = actions.find((a) => a.id === candidate.currentActionId);
  return action?.name ?? null;
}

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

  const actionName = resolveActionName(candidate, stageId);

  return (
    <div ref={ref} className="relative">
      {closestEdge === "top" && <DropIndicator edge="top" />}
      <CandidateContextMenu candidate={candidate}>
        <Card
          className={`cursor-grab border bg-card py-0 shadow-sm transition-all duration-150 hover:shadow-md hover:border-border/80 active:cursor-grabbing active:scale-[0.98] ${
            isDragging || isBulkDraggingOther ? "opacity-40 scale-[0.97] shadow-none" : ""
          } ${isSelected ? "ring-2 ring-primary/50 border-primary/30 bg-primary/[0.02]" : ""}`}
        >
          <CardContent className="p-0">
            <div className="flex items-start gap-2 px-2 py-2">
              <div className="shrink-0 pt-0.5" onPointerDown={(e) => e.stopPropagation()}>
                <Checkbox checked={isSelected} onCheckedChange={() => toggle(candidate.id)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{candidate.name}</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {candidate.tags.map((tag) =>
                    isExperienceTag(tag) ? (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`h-[18px] px-1.5 py-0 text-[10px] ${getExperienceTagClasses(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ) : (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="h-[18px] border-border/60 px-1.5 py-0 text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
              <div className="shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                <CandidateDropdownMenu candidate={candidate} />
              </div>
            </div>
            {actionName && (
              <div className="border-border/40 flex items-center justify-between border-t py-1.5 pr-2 pl-[32px]">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`h-[18px] shrink-0 px-1.5 py-0 text-[10px] font-medium ${getActionTag(actionName).classes}`}
                  >
                    {getActionTag(actionName).label}
                  </Badge>
                  <span className="text-muted-foreground truncate text-xs">{actionName}</span>
                </div>
                <span className="text-muted-foreground/60 shrink-0 text-[10px] tabular-nums">
                  {formatAppliedDate(candidate.appliedAt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </CandidateContextMenu>
      {closestEdge === "bottom" && <DropIndicator edge="bottom" />}
    </div>
  );
}
