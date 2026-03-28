import type { BoardState, Candidate, CandidateId, Stage, StageId } from "~/types/kanban";

const STAGE_NAMES = [
  "서류심사",
  "코딩테스트",
  "1차 면접",
  "과제전형",
  "2차 면접",
  "임원면접",
  "레퍼런스체크",
  "처우협상",
  "건강검진",
  "최종합격",
  "입사대기",
  "입사완료",
];

const LAST_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
  "황",
  "안",
  "송",
  "류",
  "홍",
];

const FIRST_NAMES = [
  "민수",
  "서연",
  "지훈",
  "하은",
  "영호",
  "수빈",
  "도현",
  "채원",
  "지우",
  "승민",
  "예린",
  "태윤",
  "소희",
  "준혁",
  "다은",
  "현우",
  "유진",
  "시우",
  "나영",
  "건우",
];

const SKILL_TAGS = [
  "React",
  "TypeScript",
  "Vue",
  "Angular",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "GraphQL",
  "REST API",
  "AWS",
  "Docker",
  "Kubernetes",
];

const EXPERIENCE_TAGS = [
  "신입",
  "경력 1년",
  "경력 2년",
  "경력 3년",
  "경력 4년",
  "경력 5년",
  "경력 6년",
  "경력 7년",
  "경력 8년",
  "경력 10년+",
];

const CANDIDATES_PER_STAGE = 1000;

export function generateBoardState(): BoardState {
  const stageOrder: StageId[] = [];
  const stages: Record<StageId, Stage> = {};
  const candidates: Record<CandidateId, Candidate> = {};
  const stageCandidates: Record<StageId, CandidateId[]> = {};

  // Generate stages
  for (let i = 0; i < STAGE_NAMES.length; i++) {
    const stageId: StageId = `stage-${i + 1}`;
    stageOrder.push(stageId);
    stages[stageId] = { id: stageId, name: STAGE_NAMES[i], order: i };
    stageCandidates[stageId] = [];
  }

  // Generate candidates deterministically
  let candidateIndex = 0;
  for (let s = 0; s < STAGE_NAMES.length; s++) {
    const stageId = stageOrder[s];
    for (let c = 0; c < CANDIDATES_PER_STAGE; c++) {
      const globalIndex = candidateIndex++;
      const candidateId: CandidateId = `cand-${globalIndex + 1}`;

      const lastName = LAST_NAMES[globalIndex % LAST_NAMES.length];
      const firstName =
        FIRST_NAMES[Math.floor(globalIndex / LAST_NAMES.length) % FIRST_NAMES.length];
      const name = `${lastName}${firstName}`;

      const experience = EXPERIENCE_TAGS[globalIndex % EXPERIENCE_TAGS.length];
      const skill1 = SKILL_TAGS[globalIndex % SKILL_TAGS.length];
      const skill2 = SKILL_TAGS[(globalIndex * 7 + 3) % SKILL_TAGS.length];
      const tags = skill1 === skill2 ? [experience, skill1] : [experience, skill1, skill2];

      // Deterministic date: 2025-01-01 + (globalIndex % 365) days
      const day = (globalIndex % 28) + 1;
      const month = (Math.floor(globalIndex / 28) % 12) + 1;
      const appliedAt = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      candidates[candidateId] = { id: candidateId, name, tags, appliedAt };
      stageCandidates[stageId].push(candidateId);
    }
  }

  return {
    recruitment: {
      id: "rec-1",
      title: "프론트엔드 개발자 채용",
      department: "개발팀",
      status: "진행중",
    },
    stageOrder,
    stages,
    candidates,
    stageCandidates,
  };
}

export const dummyBoardState: BoardState = generateBoardState();
