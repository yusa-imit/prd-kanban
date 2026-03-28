import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
} from "ui";
import { MoreHorizontal, Mail, StickyNote, FileText, UserX } from "lucide-react";
import type { Candidate } from "~/types/kanban";

function handleAction(action: string, candidate: Candidate) {
  console.log(`[${action}] ${candidate.name} (${candidate.id})`);
}

function MenuItems({ candidate }: { candidate: Candidate }) {
  return (
    <>
      <ContextMenuItem onSelect={() => handleAction("메시지 보내기", candidate)}>
        <Mail className="mr-2 h-4 w-4" />
        메시지 보내기
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => handleAction("메모 추가", candidate)}>
        <StickyNote className="mr-2 h-4 w-4" />
        메모 추가
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => handleAction("이력서 보기", candidate)}>
        <FileText className="mr-2 h-4 w-4" />
        이력서 보기
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        className="text-destructive"
        onSelect={() => handleAction("탈락 처리", candidate)}
      >
        <UserX className="mr-2 h-4 w-4" />
        탈락 처리
      </ContextMenuItem>
    </>
  );
}

function DropdownMenuItems({ candidate }: { candidate: Candidate }) {
  return (
    <>
      <DropdownMenuItem onSelect={() => handleAction("메시지 보내기", candidate)}>
        <Mail className="mr-2 h-4 w-4" />
        메시지 보내기
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handleAction("메모 추가", candidate)}>
        <StickyNote className="mr-2 h-4 w-4" />
        메모 추가
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handleAction("이력서 보기", candidate)}>
        <FileText className="mr-2 h-4 w-4" />
        이력서 보기
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive"
        onSelect={() => handleAction("탈락 처리", candidate)}
      >
        <UserX className="mr-2 h-4 w-4" />
        탈락 처리
      </DropdownMenuItem>
    </>
  );
}

export function CandidateContextMenu({
  candidate,
  children,
}: {
  candidate: Candidate;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 border bg-popover shadow-lg">
        <MenuItems candidate={candidate} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function CandidateDropdownMenu({ candidate }: { candidate: Candidate }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
          <span className="sr-only">더보기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border bg-popover shadow-lg">
        <DropdownMenuItems candidate={candidate} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
