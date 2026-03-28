import type { BoardState } from "~/types/kanban";

export const dummyBoardState: BoardState = {
  recruitment: {
    id: "rec-1",
    title: "프론트엔드 개발자 채용",
    department: "개발팀",
    status: "진행중",
  },
  stageOrder: ["stage-1", "stage-2", "stage-3", "stage-4"],
  stages: {
    "stage-1": { id: "stage-1", name: "서류심사", order: 0 },
    "stage-2": { id: "stage-2", name: "1차 면접", order: 1 },
    "stage-3": { id: "stage-3", name: "2차 면접", order: 2 },
    "stage-4": { id: "stage-4", name: "최종합격", order: 3 },
  },
  candidates: {
    "cand-1": {
      id: "cand-1",
      name: "김민수",
      tags: ["경력 3년", "React"],
      appliedAt: "2025-01-15",
    },
    "cand-2": {
      id: "cand-2",
      name: "이서연",
      tags: ["경력 5년", "TypeScript"],
      appliedAt: "2025-01-14",
    },
    "cand-3": {
      id: "cand-3",
      name: "박지훈",
      tags: ["신입", "React"],
      appliedAt: "2025-01-16",
    },
    "cand-4": {
      id: "cand-4",
      name: "정하은",
      tags: ["경력 2년", "Vue"],
      appliedAt: "2025-01-13",
    },
    "cand-5": {
      id: "cand-5",
      name: "최영호",
      tags: ["경력 7년", "풀스택"],
      appliedAt: "2025-01-12",
    },
    "cand-6": {
      id: "cand-6",
      name: "강수빈",
      tags: ["신입", "TypeScript"],
      appliedAt: "2025-01-17",
    },
    "cand-7": {
      id: "cand-7",
      name: "윤도현",
      tags: ["경력 4년", "Next.js"],
      appliedAt: "2025-01-11",
    },
    "cand-8": {
      id: "cand-8",
      name: "임채원",
      tags: ["경력 1년", "React"],
      appliedAt: "2025-01-18",
    },
    "cand-9": {
      id: "cand-9",
      name: "한지우",
      tags: ["경력 6년", "Angular"],
      appliedAt: "2025-01-10",
    },
    "cand-10": {
      id: "cand-10",
      name: "오승민",
      tags: ["신입", "Svelte"],
      appliedAt: "2025-01-19",
    },
  },
  stageCandidates: {
    "stage-1": ["cand-1", "cand-2", "cand-3", "cand-6"],
    "stage-2": ["cand-4", "cand-5", "cand-8"],
    "stage-3": ["cand-7", "cand-9"],
    "stage-4": ["cand-10"],
  },
};
