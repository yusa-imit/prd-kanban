import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import { ScrollArea } from "ui";
import type { Candidate, StageId } from "~/types/kanban";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

export function KanbanColumn({
  stageId,
  name,
  candidates,
}: {
  stageId: StageId;
  name: string;
  candidates: Candidate[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
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

  return (
    <div
      ref={ref}
      className={`bg-muted/40 flex w-80 shrink-0 flex-col rounded-lg border transition-colors ${isDragOver ? "bg-muted/80 border-primary/30" : ""}`}
    >
      <KanbanColumnHeader name={name} count={candidates.length} />
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="flex flex-col gap-2">
          {candidates.map((candidate) => (
            <KanbanCard key={candidate.id} candidate={candidate} stageId={stageId} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
