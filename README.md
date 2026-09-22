# CHEESE Design System

차분한 화면, 확실한 동작. 사내 제품을 위한 개인 제작 디자인 시스템입니다.
STARSHIP Entertainment 공식 제품이 아니며, 실제 직원·평가 데이터는 포함하지 않습니다.

[문서 사이트](https://dhyun0226.github.io/cheese-design-system/)

변경 근거와 남은 범위: [0.2 기술 점검](docs/REVIEW.md).
운영 투입까지의 우선순위와 완료 기준: [상용화 과제](docs/PRODUCTION-READINESS.md).

## 현재 범위

- React 실행 예제 **72개 / 카탈로그 72개**. 공개 export 개수가 아니라 실행 가능한 컴포넌트·조합 패턴의 수입니다. 모든 예제는 빌드된 `@cheese/react`를 직접 import합니다.
- 미구현 17개와 커스텀 Select를 추가했습니다. 검색·태그·인증코드·평점·기간·메뉴·패널·캐러셀을 각 상세 페이지에서 실행할 수 있습니다.
- 서버 검색, 다중 선택, 서버/로컬 Data Table, 업로드 큐와 HTTP 어댑터를 React/Vue 양쪽에 제공합니다. [업무 컴포넌트 연동](docs/BUSINESS-COMPONENTS.md)을 먼저 읽으세요. 공개 예제는 가상 데이터와 전송 시뮬레이션입니다.
- SearchInput, ErrorSummary, AttachmentList와 DataTable의 외부 query 제어를 추가했습니다. 검색 조건 복원 → 수정 → 오류 이동 → 저장 실패·재시도 → 목록 복귀를 [React 업무 흐름](https://dhyun0226.github.io/cheese-design-system/#/workflows)과 [Vue 업무 흐름](https://dhyun0226.github.io/cheese-design-system/workflow-vue.html)에서 체험합니다. 계약과 남은 과제는 [업무 흐름 패턴](docs/WORKFLOW-PATTERNS.md)에 정리했습니다.
- Vue도 신규 컴포넌트를 공유 CSS + Reka/v-model 기반으로 제공하며 별도 Vue 통합 페이지에서 직접 실행합니다. 기존 전체 카탈로그의 React/Vue 고수준 API가 완전히 동일하다는 의미는 아닙니다.
- 강조색은 Cheese Gold 한 가지이며 나머지는 중립색입니다. 트리·달력·체크·메뉴 아이콘은 Lucide SVG로 통일하고 Pretendard를 적용합니다.
- Calendar/DatePicker는 React DayPicker 9, Vue Calendar는 Reka + internationalized/date 기반입니다. 한국어·날짜 제한·키보드·기간 선택을 실제 예제로 확인합니다.
- 입력, 에러 연결, 포커스 관리, 트리 키보드 탐색, 상태 전환, 접근성 자동검사, 모바일 레이아웃을 테스트합니다.
- DateField/TimeField/NumberField는 React/Vue 공통 업무 입력입니다. 직접 입력과 디자인된 달력·시간 선택·증감 버튼, 인라인 검증, 폼 제출·초기화를 지원합니다. NativeSelect는 제거했으며 Select를 사용합니다.
- ScrollArea와 일반 overflow는 공통 중립색 스크롤 스타일을 사용합니다. 앱 전체 페이지에도 적용하려면 `html`에 `cheese-scroll-root`를 추가합니다. 강제 색상 모드와 터치의 기본 스크롤 동작은 유지합니다.
- 사내 운영 인증이나 모든 브라우저의 접근성 적합성을 보증하는 릴리스는 아닙니다. [도입 체크리스트](docs/ADOPTION.md)를 먼저 확인하세요.

## 실행

Node.js 22.12 이상 / npm 10 이상을 사용합니다.

```sh
npm ci
npm run build
npx playwright install chromium firefox webkit
npm run check
npm run dev
```

기본 개발 주소는 터미널에 출력됩니다. 테스트는 다른 개발 서버를 재사용하지 않고 전용 포트 48176에서 실행합니다.
브라우저 검사는 개발 서버 대신 `artifacts/browser-site/`에 만든 제품 빌드를 사용합니다. 폼 계약용 테스트 화면은 이 경로에만 포함되며 공개 `dist/`에는 들어가지 않습니다.

## 패키지

| 패키지         | 제공 범위                                           |
| -------------- | --------------------------------------------------- |
| @cheese/tokens | JSON + TypeScript 디자인 토큰                       |
| @cheese/css    | 토큰, 의미별 스타일, 공통 컴포넌트, 로컬 Pretendard |
| @cheese/react  | Radix 기반 React 컴포넌트                           |
| @cheese/vue    | Reka 기반 Vue 구성요소, v-model 폼, 트리            |

```tsx
import "@cheese/css";
import { Field, Input, Button } from "@cheese/react";

export function Profile() {
  return (
    <form className="cheese-root">
      <Field label="이름" required>
        <Input name="name" />
      </Field>
      <Button type="submit">저장</Button>
    </form>
  );
}
```

공통 CSS를 앱의 진입점에서 한 번 import합니다. 포털의 모달·메뉴도 같은 토큰과 폰트를 사용합니다.
`packages/tokens/src/tokens.json` 수정 후 `npm run tokens`로 CSS를 생성합니다.
문서 전용 CSS는 레이아웃을 담당하며 컴포넌트 패키지에 의존성을 역으로 만들지 않습니다.

## 아직 npm에 공개하지 않았습니다

`npm install @cheese/react`가 공개 레지스트리에서 된다고 가정하지 마세요.
고정 커밋으로 저장소를 가져와 npm workspace로 통합하거나 다음과 같이 tarball을 생성합니다.

```sh
npm run build:packages
npm pack --workspace @cheese/css --pack-destination artifacts
npm pack --workspace @cheese/react --pack-destination artifacts
npm pack --workspace @cheese/vue --pack-destination artifacts
npm pack --workspace @cheese/tokens --pack-destination artifacts
```

`artifacts` 디렉터리는 먼저 생성하세요. 대상 앱에서 사용할 tarball 및 그 workspace 의존 tarball을 함께 설치합니다.
팀 내 배포는 라이선스·소유권 검토 후 사설 레지스트리와 고정 버전 사용을 권장합니다.
현재 코드를 단순히 공개 저장소에 둔 것이 회사로의 권리 양도나 특정 오픈소스 라이선스 부여를 의미하지는 않습니다.

## 검증 및 배포

작업 재개는 [인수인계](docs/HANDOFF.md), 최신 구현과 검증은
[업무 흐름 패턴](docs/WORKFLOW-PATTERNS.md), 구현 전 근거는
[전체 점검](docs/FULL-AUDIT-2026-09-22.md)을 확인하세요. React/Vue 지원 차이의
상세 근거는 [업무 화면 도입 점검](docs/WORKPLACE-AUDIT-2026-09-22.md)에 있습니다.

`npm run check`: 패키지·문서 빌드 → TypeScript → 카탈로그 import 계약 → SSR 계약 → 독립 tarball 소비자 → 3개 브라우저 테스트.

- 코드 보기에는 실행 예제 파일 자체를 표시합니다.
- `tests/contracts.test.mjs`: SSR, 폼 연결, 공개 export, 토큰·폰트·타입 계약
- `tests/browser.spec.ts`: 각 실행 예제의 접근성 자동검사 + 중요한 사용자 흐름
- `tests/forms.spec.ts`: 날짜 필수값·초기화·취소된 reset·disabled/readOnly·FormData·ref
- `tests/search-input.spec.ts`, `tests/error-summary.spec.ts`, `tests/attachment-list.spec.ts`, `tests/table-query.spec.ts`: 검색 입력·오류 이동·저장된 첨부·외부 목록 상태 계약
- `tests/consumer/`: workspace 밖에서 React 18/19 + Vue 소비자의 타입·SSR·제품 번들 검증 (`npm run test:consumer`)
- `npx playwright test --project=chromium`: 빠른 단일 브라우저 확인. CI는 Chromium/Firefox/WebKit 전체 실행
- `artifacts/`: 데스크톱·모바일 스크린샷
- PR은 검증만, main은 검증 통과 후 `dist/`만 Pages에 배포합니다.

자동 접근성 검사는 필요조건이지 충분조건이 아닙니다. 실제 보조 기술과 현업 시나리오를 추가로 검증하세요.
독립 설치 테스트는 npm 네트워크 연결이 필요합니다. 성공 시 임시 소비자 폴더는 제거하고, 패키지와 요약은 `artifacts/packages/`에 보존합니다. 실패 시 디버깅용 임시 경로를 출력합니다.

## 변경 및 제약

기존의 독립 HTML 데모, 복제 DOM 탐색 로직, 중복 CSS는 실제 패키지 기반 사이트로 대체했습니다.
raw primitive의 wildcard export는 제거했습니다. 직접 기반 컴포넌트가 필요하면 `Primitives` namespace를 사용하세요.
Tree는 클릭 선택과 caret 펼침을 구분합니다. 제어 상태는 React의 `expanded/onExpandedChange`, Vue의 `v-model:expanded`를 사용합니다.
비교 가능한 검증 범위와 API 전환은 [마이그레이션 안내](docs/MIGRATION.md)를 확인하세요.

## 디자인과 출처

Space Black #111111 · Lunar White #FFFFFF · Moon Gray #F4F4F0 · Cheese Gold #FFC928.
공식 STARSHIP CI 색상이라는 의미는 아닙니다. 오류·성공은 문구·아이콘·ARIA로 구별하며 색상은 중립색을 사용합니다.

CHEESE의 이름은 창작한 이야기에서 출발합니다. STARSHIP 로고의 우주선이 달에 착륙하고 문을 열었더니, 그곳은 치즈 달이었습니다. 그 첫 발견처럼 다음 제품의 출발점이 되는 첫 디자인 시스템을 CHEESE라고 이름 지었습니다. 회사의 공식 브랜드 서사나 승인된 제품이라는 뜻은 아닙니다.

[SEED](https://seed-design.io/)의 문서 정보 구조와 [페이지네이션](https://seed-design.io/react/components/pagination)의 탐색 원칙을 참고합니다. CHEESE 토큰·컴포넌트로 구현하며 당근의 소스·이미지·브랜드를 복제하지 않습니다.

[Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility),
[Reka UI](https://reka-ui.com/),
[Pretendard](https://github.com/orioncactus/pretendard),
[Lucide](https://lucide.dev/).
라이선스 및 사용 범위는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 확인하세요.
