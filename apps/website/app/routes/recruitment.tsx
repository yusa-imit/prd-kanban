import type { Route } from "./+types/recruitment";
import { KanbanBoard } from "~/features/kanban/kanban-board";
import { dummyBoardState } from "~/data/dummy-recruitment";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "채용 칸반 보드 - prd-kanban" },
    { name: "description", content: "채용 전형별 칸반 보드" },
  ];
}

export default function Recruitment() {
  return <KanbanBoard initialState={dummyBoardState} />;
}
