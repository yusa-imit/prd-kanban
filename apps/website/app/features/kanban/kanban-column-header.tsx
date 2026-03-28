import { Link } from "react-router";
import { Badge } from "ui";
import type { StageId } from "~/types/kanban";

export function KanbanColumnHeader({
  name,
  count,
  stageId,
}: {
  name: string;
  count: number;
  stageId?: StageId;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      {stageId ? (
        <Link to={`/recruitment/${stageId}`} className="text-sm font-semibold hover:underline">
          {name}
        </Link>
      ) : (
        <h2 className="text-sm font-semibold">{name}</h2>
      )}
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );
}
