import type {
  ActionId,
  BoardState,
  Candidate,
  CandidateId,
  Stage,
  StageAction,
  StageDetailState,
  StageId,
} from "~/types/kanban";

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

export const STAGE_ACTIONS: Record<StageId, StageAction[]> = {
  "stage-1": [
    { id: "act-1-1", name: "접수완료", order: 0 },
    { id: "act-1-2", name: "서류검토중", order: 1 },
    { id: "act-1-3", name: "서류합격", order: 2 },
    { id: "act-1-4", name: "결과통보", order: 3 },
  ],
  "stage-2": [
    { id: "act-2-1", name: "시험발송", order: 0 },
    { id: "act-2-2", name: "시험진행중", order: 1 },
    { id: "act-2-3", name: "채점중", order: 2 },
    { id: "act-2-4", name: "채점완료", order: 3 },
  ],
  "stage-3": [
    { id: "act-3-1", name: "일정조율", order: 0 },
    { id: "act-3-2", name: "면접대기", order: 1 },
    { id: "act-3-3", name: "면접완료", order: 2 },
    { id: "act-3-4", name: "평가중", order: 3 },
    { id: "act-3-5", name: "결과확정", order: 4 },
  ],
  "stage-4": [
    { id: "act-4-1", name: "과제발송", order: 0 },
    { id: "act-4-2", name: "과제진행중", order: 1 },
    { id: "act-4-3", name: "과제제출", order: 2 },
    { id: "act-4-4", name: "평가중", order: 3 },
    { id: "act-4-5", name: "평가완료", order: 4 },
  ],
  "stage-5": [
    { id: "act-5-1", name: "일정조율", order: 0 },
    { id: "act-5-2", name: "면접대기", order: 1 },
    { id: "act-5-3", name: "면접완료", order: 2 },
    { id: "act-5-4", name: "평가중", order: 3 },
  ],
  "stage-6": [
    { id: "act-6-1", name: "일정조율", order: 0 },
    { id: "act-6-2", name: "면접대기", order: 1 },
    { id: "act-6-3", name: "면접완료", order: 2 },
    { id: "act-6-4", name: "평가중", order: 3 },
  ],
  "stage-7": [
    { id: "act-7-1", name: "레퍼런스요청", order: 0 },
    { id: "act-7-2", name: "응답대기", order: 1 },
    { id: "act-7-3", name: "검토중", order: 2 },
    { id: "act-7-4", name: "검토완료", order: 3 },
  ],
  "stage-8": [
    { id: "act-8-1", name: "제안준비", order: 0 },
    { id: "act-8-2", name: "제안발송", order: 1 },
    { id: "act-8-3", name: "협상중", order: 2 },
    { id: "act-8-4", name: "합의완료", order: 3 },
  ],
  "stage-9": [
    { id: "act-9-1", name: "안내발송", order: 0 },
    { id: "act-9-2", name: "검진예약", order: 1 },
    { id: "act-9-3", name: "검진완료", order: 2 },
    { id: "act-9-4", name: "결과확인", order: 3 },
  ],
  "stage-10": [
    { id: "act-10-1", name: "합격통보", order: 0 },
    { id: "act-10-2", name: "서류수령", order: 1 },
    { id: "act-10-3", name: "입사확정", order: 2 },
  ],
  "stage-11": [
    { id: "act-11-1", name: "입사안내", order: 0 },
    { id: "act-11-2", name: "장비준비", order: 1 },
    { id: "act-11-3", name: "입사대기중", order: 2 },
  ],
  "stage-12": [
    { id: "act-12-1", name: "입사완료", order: 0 },
    { id: "act-12-2", name: "온보딩중", order: 1 },
    { id: "act-12-3", name: "온보딩완료", order: 2 },
  ],
};

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

      const stageActions = STAGE_ACTIONS[stageId];
      const currentActionId = stageActions
        ? stageActions[globalIndex % stageActions.length].id
        : undefined;

      candidates[candidateId] = { id: candidateId, name, tags, appliedAt, currentActionId };
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

export function generateStageDetailState(
  stageId: StageId,
  boardState: BoardState,
): StageDetailState {
  const stage = boardState.stages[stageId];
  const stageActions = STAGE_ACTIONS[stageId] ?? [];
  const candidateIdsInStage = boardState.stageCandidates[stageId] ?? [];

  const actionOrder: ActionId[] = stageActions.map((a) => a.id);
  const actions: Record<ActionId, StageAction> = {};
  const actionCandidates: Record<ActionId, CandidateId[]> = {};

  for (const action of stageActions) {
    actions[action.id] = action;
    actionCandidates[action.id] = [];
  }

  const candidates: Record<CandidateId, Candidate> = {};

  for (const candidateId of candidateIdsInStage) {
    const candidate = boardState.candidates[candidateId];
    candidates[candidateId] = candidate;
    const actionId = candidate.currentActionId;
    if (actionId && actionCandidates[actionId]) {
      actionCandidates[actionId].push(candidateId);
    } else if (actionOrder.length > 0) {
      actionCandidates[actionOrder[0]].push(candidateId);
    }
  }

  return {
    stageId,
    stageName: stage?.name ?? stageId,
    actionOrder,
    actions,
    actionCandidates,
    candidates,
  };
}
