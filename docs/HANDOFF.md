# CHEESE 작업 인수인계

최종 업데이트: 2026-09-22. 회사 PC → 집 PC에서 이어가기 위한 시작 문서입니다.

## 먼저 확인할 상태

- 최신 작업은 **업무 흐름과 SearchInput·ErrorSummary·AttachmentList 추가**입니다.
  사용자는 전체 점검의 다음 우선순위를 진행하고 검색 전용 입력도 추가하도록 요청했습니다.
- 최신 계약·범위·남은 과제·검증 결과는 [업무 흐름 패턴](WORKFLOW-PATTERNS.md),
  추가 전 점검 근거는 [전체 점검 기록](FULL-AUDIT-2026-09-22.md)을 확인하세요.
- 로컬 검증과 원격 배포는 별개입니다. `git log -1`의 커밋에 해당하는
  [GitHub Actions 실행](https://github.com/dhyun0226/cheese-design-system/actions/workflows/pages.yml)에서
  `verify`와 `deploy`를 각각 확인하세요. 예전 커밋의 초록 체크는 새 배포의 증거가 아닙니다.
- 로컬 `artifacts/`, `test-results/`, `node_modules/`는 Git에 포함하지 않습니다.
  집 PC에는 자동으로 옮겨지지 않으며, 검증 자료는 CI artifact로도 확인합니다.

## 최신 요청 — 업무 흐름과 검색 입력

- 카탈로그는 **72개 React 실행 예제**입니다. 공개 export 수나 React/Vue 완전 동등성을 뜻하지 않습니다.
- SearchInput: 자유 검색어, 돋보기·지우기, Enter 검색, 한글 조합 처리,
  설명·오류·form 연결. 선택형 Combobox와 용도를 분리합니다.
- ErrorSummary: 오류 항목을 모으고 해당 보이는 입력으로 이동합니다.
  제출 실패 뒤 소비자가 요약에 포커스하며 입력 도중 갱신은 포커스를 빼앗지 않습니다.
- AttachmentList: 실제 다운로드 링크, 비동기 삭제·중복 방지·실패·재시도·취소.
  성공 뒤 부모가 items를 갱신합니다. FileUpload 큐 삭제와 서버 첨부 삭제는 구분합니다.
- DataTable: React query/onQueryChange, Vue v-model:query와 defaultQuery를 제공합니다.
  부모가 검색·페이지·정렬 상태를 저장하고 복원할 수 있습니다.
- `#/workflows`와 `workflow-vue.html`: URL 목록 조건 복원 → 수정 → 오류 요약 →
  필드/전체 저장 실패 → 입력 보존·재시도 → 같은 조건의 목록으로 복귀.
  데이터는 메모리 예제이며 실제 서버를 제공하지 않습니다.
- React 18/19·Vue의 독립 소비자 타입·SSR·번들 계약도 신규 API를 포함합니다.
  최종 통합 결과는 [업무 흐름 검증 기록](WORKFLOW-PATTERNS.md#검증-기록)에 기록합니다.

## 이전 요청 — 대화형 소개와 전체 점검

- `site/HeroTaskDemo.tsx`: 업무 이름 입력 → 담당자 선택 → 생성된 카드 → 다시 체험.
  실제 패키지의 Field·Input·Select·Button·Avatar·Badge를 사용합니다.
  빈 값 오류, 완료/재시작 포커스, 긴 제목, 모바일, 모션 감소를 처리했습니다.
- `OriginIllustration.tsx`와 관련 CSS는 제거했습니다. 자산은 출처 기록용으로
  보관하며 현재 페이지에 그리지 않습니다. 기존 CHEESE 아이콘은 유지합니다.
- React 17개·Vue 38개 구현 파일과 69개 예제, 문서·검사·배포 설정을 대조했습니다.
  첫 오류 포커스, 부모가 거절한 입력, 검색 오류 해제, 필수값 검증, 초안 reset,
  월/연도 제출값, Vue 슬롯 입력, 소비자 클래스, 업로드 완료 콜백을 보완했습니다.
- 새로고침 직후 담당자 Select를 마우스로 열 때 나타나던 키보드 포커스 선을
  수정했습니다. React/Vue 모두 입력 방식을 구분하며 키보드 포커스는 유지합니다.
  WebKit에서 blur 오류 표시 때문에 제출 버튼이 이동하여 클릭이 누락되던 문제도 수정했습니다.
- 예제의 저장/성공 표시와 초기화·재시도 동작을 실제 상태에 맞췄습니다.
  Mac의 기존 12개 실패는 기본 HTML 컨트롤과 대조하여 플랫폼에 맞는 검사로 수정했습니다.
- 새 컴포넌트의 무조건적인 추가는 하지 않았습니다. ErrorSummary·저장 복구·
  외부 query·기존 첨부 관리·React/Vue 격차를 실제 업무 화면의 후속 과제로 정리했습니다.
- 최종 테스트 수와 통과 여부는 [전체 점검의 검증 기록](FULL-AUDIT-2026-09-22.md#검증-기록)에 있습니다.

## 이전 작업 범위

1. 소개 그림에서 STARSHIP 글자는 숨기고 원본의 A 모양 우주선만 크게 표시.
   짧게 한 번 상승 후 정지, 동작 줄이기에서는 정지 화면.
2. Stepper 숫자 굵기·아이콘 선 굵기를 공통 스타일에 맞춤.
3. Toast 본문과 닫기 버튼 배치, 여러 알림 간격, 긴 문장·모바일 화면 보강.
4. Pin OTP Input을 숫자별 6칸으로 표시하되 실제 입력은 하나로 유지.
   붙여넣기·선택·키보드·폼 제출·초기화·접근성 보존.
5. 전수 점검에서 발견한 검색 선택 필드의 첫 필수값 오류 포커스 보정.
6. 전체 카탈로그와 테스트를 확인하고 커밋·푸시.

**바꾸지 않을 것:** 기존 CHEESE 아이콘·파비콘, Cheese Gold 중심 팔레트,
Pretendard, 단순한 업무 UI. 달/C 모양의 새 CHEESE 아이콘 시안은 사용자가
거절했으므로 적용하지 않습니다. STARSHIP PNG 원본 파일도 변경하지 않습니다.

### 이전 소개 개선 — 삽화는 후속 요청으로 교체됨

- 사용자는 기존 CHEESE 아이콘을 유지하면서 소개 개선안을 구현하고
  커밋·푸시하도록 요청했습니다. 다른 문서와 컴포넌트의 시각 체계는 유지합니다.
- 원본 PNG는 보존하고 A 영역의 외곽과 내부 공간을 추적한
  `site/assets/starship-rocket.svg`를 사용합니다. `<use>`로 경로를 직접
  참조하여 확대·회전에도 선명하게 그립니다. 공식 벡터 원본은 아닙니다.
- `A SMALL DISCOVERY`는 치즈빛 달을 중심으로 다시 구성했습니다.
  별도 치즈 조각을 제거하고, 원본 A 우주선의 크기·각도·이동 경로를
  달을 향하도록 조절했습니다. 한 번 상승 후 정지하며 동작 줄이기에서는
  처음부터 같은 최종 장면을 보여줍니다. 그림의 색은 기존 토큰을 사용합니다.
- 소개 순서: 제품 설명 → 제공 범위 → 실제 평가 화면 → 대표 컴포넌트 →
  문서 시작점 → 짧은 이름 이야기 → 도입 안내. 69개는 React 실행 예제
  수로 표기하며 React/Vue API의 완전한 동등성을 주장하지 않습니다.
- 대표 컴포넌트는 실제 패키지의 Button·Field·Date Field·Combobox입니다.
  미리보기는 장식으로 처리하고 카드의 링크 하나로 상세 페이지에 접근합니다.
  모바일 문서 시작점은 짧은 목록으로 표시합니다.
- `site/Home.tsx`, `site/OriginIllustration.tsx`, `site/Logo.tsx`로 소개와
  그림·기존 아이콘을 분리했습니다. 평가 예제는 기존 업무 화면과 공유합니다.
  문서 사이드바와 공통 컴포넌트 스타일은 그대로 사용합니다.
- 자산 출처는 `site/assets/README.md`, 원본 보존·벡터 로딩·화면 경계·
  모션 감소·문서 진입·평가 제출 검사는 `tests/docs-site.spec.ts`에 있습니다.
- 소개의 1440/900/390/320px 화면과 원본/벡터 확대 비교는 로컬
  `artifacts/intro-*.png`, `artifacts/hero-rocket-comparison.png`에 있습니다.
  이 파일들은 Git에 포함되지 않습니다.

#### 소개 개선 검증 (macOS)

- `npm run check`의 빌드·타입·69개 카탈로그·21개 단위 검사와
  React 18/19·Vue 독립 패키지 소비자 검증은 통과했습니다.
- 소개와 문서 탐색 검사는 Chromium·Firefox·WebKit에서 18/18 통과했습니다.
  원본 PNG 보존, SVG 참조 로딩, 320–1440px 화면, 한 번 상승하는 모션과
  동작 줄이기, 문서 진입과 평가 제출 후 상태 변경을 확인했습니다.
- 소개의 axe 접근성 위반은 0건입니다. 모바일·데스크톱 화면과
  대표 컴포넌트 카드의 미리보기 영역 클릭도 직접 확인했습니다.
- 전체 브라우저 검사는 762건 중 750건 통과, 12건 실패했습니다.
  실패는 Firefox의 OTP 선택 2건, WebKit의 Select 숨김 판정 2건,
  Pagination 키보드 2건, OTP 키보드·선택 4건, 가로 스크롤 2건입니다.
  소개 변경 검사는 모두 통과했으며, 전체 검사 통과로 기록하지 않습니다.
- 수정 전 `ec7ee4a`를 별도 worktree에서 검사하여 같은 12건의 실패와
  오류 메시지를 모두 재현했습니다. 따라서 이번 소개 변경의 회귀와 구분합니다.
  기존 테스트나 패키지 코드는 수정하지 않았습니다. 기준 커밋의 Ubuntu CI는
  [성공 기록](https://github.com/dhyun0226/cheese-design-system/actions/runs/35711638530)이
  있으며, 이번 커밋의 CI 결과는 별도로 확인해야 합니다.

## 다음 작업과 우선순위

오류 요약·목록 조건 복원·저장 실패 복구·기존 첨부 관리는 이번에 구현했습니다.
다음 과제는 [업무 흐름 패턴](WORKFLOW-PATTERNS.md#더-필요한-구성요소를-고르는-기준)을
기준으로 고르세요. 기존 [사내 시스템 점검](WORKPLACE-AUDIT-2026-09-22.md)은 구현 전 근거입니다.

1. 사용할 프레임워크와 실제 첫 업무 화면을 정하고 필요한 공개 API 격차부터 보완합니다.
2. 실제 API의 권한·필드 오류·전체 오류·버전 충돌·중복 요청 계약을 연결합니다.
3. 계층 선택 규칙이 필요한 경우 TreeSelect, 금액 계산이 있으면 통화·정밀도 입력을 검토합니다.
4. 주소 제공자와 결재 규칙을 확인한 뒤 기존 입력·Timeline·Stepper를 조합합니다.
5. 영속 임시저장·라우터 이탈 확인, 대용량 가상화는 실제 작성 시간과 데이터 규모로 우선순위를 정합니다.

## 이전 Toast·OTP 작업의 검증 기록

- `npm run build`, `npm run typecheck`, `npm run verify:catalog`: 통과.
- `npm run test:unit`: 21개 통과, 실패·건너뜀 없음.
- `npm run test:consumer`: React 18/19 + Vue 독립 tarball 설치·타입·SSR·번들 통과.
  OTP paste 이벤트 보강을 포함한 `b17da60`도 GitHub CI에서 이 검사를 통과했습니다.
- Toast/OTP 변경 후 69개 카탈로그 기본 렌더와 네 장의 검토 시트 확인.
  페이지·리소스 오류 없음. OTP 입력/제출/초기화·320px 화면, Stepper 완료 아이콘,
  두 개 Toast의 쌓임·개별 닫기도 직접 확인했습니다.
- 브라우저 회귀 최종 결과: 아래 점검 문서에 기록합니다.
- 전체 브라우저 회귀와 Pages 배포는 이 커밋의 GitHub Actions 결과가 기준입니다.
  `verify`가 실패하면 새 코드가 사이트에 배포되지 않습니다.
- 첫 전체 CI(`b17da60`)는 756개 통과, 기존 Toast 버튼 검색의 부분 일치 충돌로
  3개 실패했습니다. `tests/extended.spec.ts`에 `exact: true`를 적용하여 일반 알림과
  긴 알림 버튼을 구분했습니다. 상세 재검증 기록은 점검 문서를 참고하세요.

개별 테스트를 실행할 때도 먼저 `npm run build:packages`를 실행하세요.
문서와 테스트는 `packages/*/dist`를 소비하므로 소스만 수정하고 테스트하면
이전 빌드를 잘못 검사할 수 있습니다. 전체 `npm run check`는 이 순서를 포함합니다.

## 집 PC에서 재개

기존 clone이 있으면 해당 폴더에서 `git status`로 내 수정 여부를 먼저 확인하고
`git pull --ff-only`를 실행합니다. 로컬 변경을 강제로 덮어쓰거나 reset하지 마세요.
clone이 없다면 저장소를 새 폴더에 clone하세요.

```sh
git clone https://github.com/dhyun0226/cheese-design-system.git
cd cheese-design-system
npm ci
npx playwright install chromium firefox webkit
npm run check
```

브라우저 시스템 의존성이 없는 Linux 환경에서는 CI와 동일하게
`npx playwright install --with-deps chromium firefox webkit`를 사용합니다.
미리보기는 `npm run dev`입니다. 테스트는 48176/48179 포트를 사용하므로
동시에 여러 테스트 서버를 시작하지 마세요.

새 Codex에 전달할 문구:

> docs/HANDOFF.md와 docs/WORKFLOW-PATTERNS.md부터 읽어줘.
> 현재 git 상태와 최신 GitHub Actions 결과를 확인하고, 완료한 작업은 반복하지 마.
> 검증되지 않은 부분을 먼저 확인한 뒤 다음 우선순위 과제부터 이어가자.
> 기존 CHEESE 아이콘·파비콘과 Pretendard·Cheese Gold는 유지해줘.

진행 중인 Codex 세션·하위 에이전트·회사 PC의 로컬 서버는 집 PC로 이어지지 않습니다.
**인수인계 기준은 Git에 커밋된 코드, 이 문서, 실제 CI 결과입니다.**
