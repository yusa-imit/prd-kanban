import { useParams } from "react-router";
import { dummyBoardState, generateStageDetailState } from "~/data/dummy-recruitment";
import { StageDetailBoard } from "~/features/kanban/stage-detail-board";

export function meta() {
  return [
    { title: "전형 상세 - prd-kanban" },
    { name: "description", content: "전형별 액션 칸반 보드" },
  ];
}

export default function RecruitmentStage() {
  const { stageId } = useParams<{ stageId: string }>();
  if (!stageId || !dummyBoardState.stages[stageId]) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">존재하지 않는 전형입니다.</p>
      </div>
    );
  }

  const detailState = generateStageDetailState(stageId, dummyBoardState);
  return <StageDetailBoard initialState={detailState} />;
}
