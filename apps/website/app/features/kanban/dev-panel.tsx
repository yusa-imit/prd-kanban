import { useState } from "react";
import { Badge, Button, ScrollArea } from "ui";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useKanbanLog, type KanbanLogEventType } from "./use-kanban-log";

const eventBadgeVariant: Record<KanbanLogEventType, string> = {
  DRAG_START: "bg-blue-100 text-blue-800",
  DRAG_END: "bg-blue-100 text-blue-800",
  CARD_REORDER: "bg-green-100 text-green-800",
  CARD_MOVE: "bg-green-100 text-green-800",
  DROP_ON_EMPTY: "bg-green-100 text-green-800",
  MENU_ACTION: "bg-purple-100 text-purple-800",
  BULK_MOVE: "bg-orange-100 text-orange-800",
  BULK_DROP_ON_EMPTY: "bg-orange-100 text-orange-800",
};

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("ko-KR", { hour12: false });
}

export function DevPanel() {
  const { entries, clear } = useKanbanLog();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t bg-background">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        <span className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          Dev Log
          {entries.length > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-xs">
              {entries.length}
            </Badge>
          )}
        </span>
        {open && entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        )}
      </button>
      {open && (
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 px-4 pb-4">
            {entries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                인터랙션 로그가 없습니다
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${eventBadgeVariant[entry.type]}`}
                  >
                    {entry.type}
                  </span>
                  <span className="text-foreground">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
