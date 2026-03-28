import { Badge } from "ui";
import type { Recruitment } from "~/types/kanban";

const statusVariant: Record<Recruitment["status"], "default" | "secondary" | "outline"> = {
  진행중: "default",
  마감: "secondary",
  대기: "outline",
};

export function KanbanBoardHeader({ recruitment }: { recruitment: Recruitment }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <h1 className="text-2xl font-bold">{recruitment.title}</h1>
      <span className="text-muted-foreground text-sm">{recruitment.department}</span>
      <Badge variant={statusVariant[recruitment.status]}>{recruitment.status}</Badge>
    </div>
  );
}
