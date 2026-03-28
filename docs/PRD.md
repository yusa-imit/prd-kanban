# PRD Kanban - 채용 칸반 보드

## Iteration 1: 채용 칸반 보드 기본 구현

### 목표

드래그앤드롭으로 지원자를 채용 전형 간 이동할 수 있는 칸반 보드 구현

### 마일스톤 기준

- [x] 4개 전형 컬럼 렌더링
- [x] 10명의 지원자 카드 렌더링
- [x] 카드 드래그앤드롭으로 컬럼 간 이동
- [x] 같은 컬럼 내 순서 변경
- [x] 빈 컬럼에 카드 드롭

---

## Iteration 2: 개발자 인터랙션 로그 패널

### 목표

드래그앤드롭, 메뉴 액션 등 모든 인터랙션을 실시간 로그로 표시하는 개발자 패널 구현

### 마일스톤 기준

- [x] DevPanel 토글 UI
- [x] 드래그 시작/종료 로그
- [x] 카드 이동/순서 변경 로그
- [x] 컨텍스트 메뉴 액션 로그
- [x] 로그 필터링 및 클리어

---

## Iteration 3: 벌크 선택 및 액션 툴바

### 목표

체크박스로 다중 지원자 선택, 벌크 드래그앤드롭, 벌크 액션 툴바 구현

### 마일스톤 기준

- [x] 체크박스로 개별 카드 선택/해제
- [x] 벌크 선택 시 하단 액션 툴바 표시
- [x] 선택된 카드 벌크 드래그앤드롭
- [x] 벌크 액션 (메시지, 메모, 이력서, 탈락) 로깅
- [x] 전체 해제 기능

---

## Iteration 4: 가상화 & Optimistic Update 인프라

### 목표

12개 전형 × 1,000명 규모의 대규모 데이터를 가상화로 처리하고, API 도입을 대비한 optimistic update 패턴을 구축한다.

### 기능 명세

#### 4-1. 대규모 더미 데이터 생성

- 12개 전형: 서류심사, 코딩테스트, 1차 면접, 과제전형, 2차 면접, 임원면접, 레퍼런스체크, 처우협상, 건강검진, 최종합격, 입사대기, 입사완료
- 각 전형 1,000명 (총 12,000명)
- 한국 이름 풀(성 20 × 이름 20) + 스킬 태그를 deterministic하게 조합

#### 4-2. Optimistic Update 인프라

- `useBoardMutation` 훅: snapshot → optimistic apply → (optional) API → rollback on failure
- 순수 함수로 상태 변환 로직 분리
- `apiFn` 없으면 동기 동작 (기존 동작과 동일)
- API 통합 시 `apiFn`만 추가하면 optimistic update 완성

#### 4-3. 컬럼 가상화

- `@tanstack/react-virtual`의 `useVirtualizer`로 컬럼 내 카드 가상화
- Radix ScrollArea → plain div + `overflow-y: auto`
- `autoScrollForElements`로 드래그 중 세로 자동 스크롤
- absolute positioning으로 가상 아이템 렌더링

#### 4-4. 보드 레이아웃 최적화

- `monitorForElements` deps에서 `boardState` 제거 → `boardStateRef` 사용
- 보드 가로 스크롤 영역에 `autoScrollForElements` 등록

### UI/UX 명세

- 12개 컬럼이 가로 스크롤로 표시됨
- 각 컬럼 내 1,000개 카드가 가상화되어 부드러운 스크롤
- 드래그 중 세로(컬럼 내) + 가로(보드) 자동 스크롤
- 기존 체크박스 선택, 벌크 드래그, 로그 패널 모두 유지

### 마일스톤 기준

- [x] 12개 컬럼 × 1,000명 렌더링 확인
- [x] 스크롤 시 부드러운 가상화 동작
- [x] 가상화 리스트에서 단건 드래그앤드롭 동작
- [x] 가상화 리스트에서 벌크 드래그앤드롭 동작
- [x] 드래그 중 세로 자동 스크롤 동작
- [x] 드래그 중 가로 자동 스크롤 동작
- [x] 체크박스 선택/벌크 툴바 기존 기능 유지
- [x] Dev Log에 이벤트 정상 기록
- [x] `vp check` 통과

### 제약 사항

- 카드 높이는 고정 estimateSize(72px) 사용 (가변 높이는 필요 시 추후 도입)
- Radix ScrollArea 제거 후 CSS `scrollbar-*` 속성으로 스크롤바 스타일 보완
- 화면 밖 선택 카드는 DOM에 없지만 zustand store에 상태 유지
