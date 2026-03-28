import { Link } from "react-router";
import { Badge, Checkbox } from "ui";
import type { CandidateId, StageId } from "~/types/kanban";
import { useKanbanSelectionStore } from "./use-kanban-selection";

export function KanbanColumnHeader({
  name,
  count,
  stageId,
  candidateIds,
}: {
  name: string;
  count: number;
  stageId?: StageId;
  candidateIds?: CandidateId[];
}) {
  const selectedIds = useKanbanSelectionStore((s) => s.selectedIds);
  const toggleAll = useKanbanSelectionStore((s) => s.toggleAll);

  const ids = candidateIds ?? [];
  const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
  const allSelected = ids.length > 0 && selectedCount === ids.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {ids.length > 0 && (
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={() => toggleAll(ids)}
          aria-label={`${name} 전체 선택`}
        />
      )}
      {stageId ? (
        <Link to={`/recruitment/${stageId}`} className="text-sm font-semibold hover:underline">
          {name}
        </Link>
      ) : (
        <h2 className="text-sm font-semibold">{name}</h2>
      )}
      <Badge variant="secondary" className="ml-auto text-xs">
        {count}
      </Badge>
    </div>
  );
}
