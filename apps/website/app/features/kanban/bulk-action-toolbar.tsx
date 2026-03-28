import { Button } from "ui";
import { Mail, StickyNote, FileText, UserX, X } from "lucide-react";
import { useKanbanSelectionStore } from "./use-kanban-selection";
import { useKanbanLog } from "./use-kanban-log";

export function BulkActionToolbar() {
  const selectedIds = useKanbanSelectionStore((s) => s.selectedIds);
  const clear = useKanbanSelectionStore((s) => s.clear);
  const { log } = useKanbanLog();
  const count = selectedIds.size;

  if (count === 0) return null;

  const handleAction = (action: string) => {
    log("MENU_ACTION", `[${action}] ${count}명 벌크 액션`, {
      action,
      candidateIds: [...selectedIds],
      bulk: true,
    });
  };

  return (
    <div className="flex items-center gap-2 border-t bg-background px-4 py-2">
      <span className="text-sm font-medium">{count}명 선택됨</span>
      <div className="mx-2 h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => handleAction("메시지 보내기")}
      >
        <Mail className="h-3.5 w-3.5" />
        메시지 보내기
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => handleAction("메모 추가")}
      >
        <StickyNote className="h-3.5 w-3.5" />
        메모 추가
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => handleAction("이력서 보기")}
      >
        <FileText className="h-3.5 w-3.5" />
        이력서 보기
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
        onClick={() => handleAction("탈락 처리")}
      >
        <UserX className="h-3.5 w-3.5" />
        탈락 처리
      </Button>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-xs" onClick={clear}>
        <X className="h-3.5 w-3.5" />
        전체 해제
      </Button>
    </div>
  );
}
