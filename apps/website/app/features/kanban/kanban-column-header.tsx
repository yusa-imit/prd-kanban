import { Badge } from "ui";

export function KanbanColumnHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <h2 className="text-sm font-semibold">{name}</h2>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );
}
