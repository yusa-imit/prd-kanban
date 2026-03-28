export type StageId = string;
export type CandidateId = string;

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

export interface Candidate {
  id: CandidateId;
  name: string;
  avatarUrl?: string;
  tags: string[];
  appliedAt: string;
}

export interface BoardState {
  recruitment: Recruitment;
  stageOrder: StageId[];
  stages: Record<StageId, Stage>;
  candidates: Record<CandidateId, Candidate>;
  stageCandidates: Record<StageId, CandidateId[]>;
}
