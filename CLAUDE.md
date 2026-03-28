<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

# PRD Kanban - AI 기반 PRD 이터레이션 POC

AI를 통해 개발을 진행하는 POC 프로젝트로, PRD 이터레이션을 반복하여 마일스톤을 달성하고 최종적으로 시나리오 테스트를 도입한다.

## 프로젝트 구조

```
prd-kanban/
├── apps/
│   ├── website/        # React Router 7 (framework mode) 프론트엔드
│   └── backend/        # 백엔드 서버
├── packages/
│   ├── ui/             # shadcn/ui 기반 디자인 시스템
│   └── utils/          # 공통 유틸리티
└── docs/
    └── PRD.md          # PRD 문서
```

## 개발 프로세스

이 프로젝트는 **PRD 이터레이션 사이클**을 반복하며 점진적으로 제품을 완성한다. 각 이터레이션은 하나의 마일스톤에 대응한다.

### Phase 1: PRD 작성

사용자가 구현할 기능의 요구사항을 전달하면, `docs/PRD.md`에 해당 이터레이션의 PRD를 작성한다.

PRD에는 다음 항목을 포함한다:

- **목표**: 이번 이터레이션에서 달성할 것
- **기능 명세**: 구현할 기능의 구체적인 동작 정의
- **UI/UX 명세**: 화면 구성, 사용자 흐름, 인터랙션 정의
- **마일스톤 기준**: 이터레이션 완료를 판단할 수 있는 명확한 체크리스트
- **제약 사항**: 기술적 제한, 스코프 경계

PRD는 누적으로 관리한다. 이전 이터레이션의 PRD 위에 새로운 이터레이션을 추가하여 전체 히스토리를 유지한다.

### Phase 2: PRD 기반 개발

PRD가 확정되면 기능 구현에 착수한다.

- PRD의 기능 명세를 기준으로 `apps/website`에 페이지와 컴포넌트를 구현한다.
- 공통 UI 컴포넌트는 `packages/ui`에, 공통 로직은 `packages/utils`에 배치한다.
- 구현 중 PRD와 불일치가 발생하면 사용자에게 확인 후 PRD를 수정한다.
- 각 구현 단계마다 `vp check`로 코드 품질을 검증한다.

### Phase 3: 마일스톤 확인

구현이 완료되면 PRD의 마일스톤 기준 체크리스트를 하나씩 검증한다.

- 모든 체크리스트 항목을 통과하면 해당 이터레이션을 완료로 표시한다.
- 미충족 항목이 있으면 해당 부분을 수정하고 다시 검증한다.
- 마일스톤 달성 후 다음 이터레이션의 PRD 작성으로 넘어간다.

### 이터레이션 반복

위 3단계를 반복하며 제품을 점진적으로 완성한다:

```
PRD 작성 → 개발 → 마일스톤 확인 → PRD 작성 → 개발 → 마일스톤 확인 → ...
```

## 시나리오 테스트 전략

마일스톤이 충분히 쌓여 제품이 형태를 갖추면, 시나리오 테스트를 도입한다. 테스트와 제품이 상호작용하며 완성도를 끌어올리는 것이 최종 목표다.

### 시나리오 테스트란

단위 테스트나 통합 테스트가 아닌, **사용자 관점의 시나리오**를 테스트한다. 실제 사용자가 제품을 사용하는 흐름 전체를 재현하고 검증한다.

### 도입 시점

- 핵심 기능이 2~3개 이상의 이터레이션을 거쳐 안정화된 후 도입한다.
- 초기 이터레이션에서는 PRD 마일스톤 체크리스트로 검증하고, 시나리오 테스트는 나중에 추가한다.

### 테스트 작성 방식

- `vp test`(Vitest)를 사용하여 시나리오 테스트를 작성한다.
- 테스트 파일은 각 앱/패키지의 `tests/` 디렉토리에 배치한다.
- 시나리오 테스트는 PRD의 사용자 흐름을 기반으로 작성한다.

### 테스트-제품 상호작용 사이클

시나리오 테스트 도입 후에는 이터레이션 사이클이 확장된다:

```
PRD 작성 → 개발 → 시나리오 테스트 작성 → 테스트 실행/수정 → 마일스톤 확인
```

1. **PRD에서 시나리오 도출**: PRD의 사용자 흐름에서 테스트 시나리오를 추출한다.
2. **시나리오 테스트 작성**: 도출된 시나리오를 테스트 코드로 작성한다.
3. **테스트 실패 → 제품 수정**: 테스트가 실패하면 제품 코드를 수정한다.
4. **제품 수정 → 테스트 재실행**: 수정 후 테스트를 다시 실행하여 통과를 확인한다.
5. **회귀 방지**: 이전 이터레이션의 시나리오 테스트도 함께 실행하여 기존 기능이 깨지지 않았는지 확인한다.

이 사이클을 통해 테스트가 제품의 품질 게이트 역할을 하고, 제품 변경이 테스트를 보강하는 선순환 구조를 만든다.
