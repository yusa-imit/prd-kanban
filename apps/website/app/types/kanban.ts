export type StageId = string;
export type CandidateId = string;
export type ActionId = string;

export interface Recruitment {
  id: string;
  title: string;
  department: string;
  status: "진행중" | "마감" | "대기";
}

export interface Stage {
  id: StageId;
  name: string;
  order: number;
}

export interface StageAction {
  id: ActionId;
  name: string;
  order: number;
}

export interface Candidate {
  id: CandidateId;
  name: string;
  avatarUrl?: string;
  tags: string[];
  appliedAt: string;
  currentActionId?: ActionId;
}

export interface BoardState {
  recruitment: Recruitment;
  stageOrder: StageId[];
  stages: Record<StageId, Stage>;
  candidates: Record<CandidateId, Candidate>;
  stageCandidates: Record<StageId, CandidateId[]>;
}

export interface StageDetailState {
  stageId: StageId;
  stageName: string;
  actionOrder: ActionId[];
  actions: Record<ActionId, StageAction>;
  actionCandidates: Record<ActionId, CandidateId[]>;
  candidates: Record<CandidateId, Candidate>;
}
