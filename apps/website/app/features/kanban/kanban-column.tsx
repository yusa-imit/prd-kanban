import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { useVirtualizer } from "@tanstack/react-virtual";
import invariant from "tiny-invariant";
import type { Candidate, CandidateId, StageId } from "~/types/kanban";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

export function KanbanColumn({
  stageId,
  name,
  candidateIds,
  candidates,
  linkStageId,
}: {
  stageId: StageId;
  name: string;
  candidateIds: CandidateId[];
  candidates: Record<CandidateId, Candidate>;
  linkStageId?: StageId;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const el = columnRef.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      getData: () => ({ type: "column", stageId }),
      canDrop: ({ source }) => source.data.type === "card",
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });
  }, [stageId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    return autoScrollForElements({
      element: el,
      canScroll: ({ source }) => source.data.type === "card",
    });
  }, []);

  const virtualizer = useVirtualizer({
    count: candidateIds.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 5,
    gap: 8,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  return (
    <div
      ref={columnRef}
      className={`bg-muted/40 flex w-80 shrink-0 flex-col rounded-lg border transition-colors ${isDragOver ? "bg-muted/80 border-primary/30" : ""}`}
    >
      <KanbanColumnHeader name={name} count={candidateIds.length} stageId={linkStageId} />
      <div ref={scrollRef} className="kanban-scroll flex-1 overflow-y-auto px-2 pb-2">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const candidateId = candidateIds[virtualItem.index];
            const candidate = candidates[candidateId];
            return (
              <div
                key={candidateId}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                className="absolute left-0 top-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <KanbanCard candidate={candidate} stageId={stageId} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
