# 소개 체험 교체와 전체 점검 — 2026-09-22

## 결론

소개 히어로의 달·우주선 삽화를 실제 CHEESE 컴포넌트로 만든 업무 생성 체험으로
교체했다. 제목·담당자를 바꿔 생성하고, 결과를 확인한 뒤 다시 체험할 수 있다.
예제 데이터는 페이지 메모리에만 존재한다. 기존 CHEESE 아이콘·파비콘·Pretendard·
Gold 팔레트를 유지했다.

업무 화면에 필요한 기본 입력·날짜·선택·표·검색·업로드·레이어는 이미 있다.
이번 점검에서는 새 컴포넌트 수를 늘리는 대신, 기존 폼의 값·오류·초기화·포커스와
문서 예제의 실제 동작을 보완했다. 다음 우선순위는 **조회와 등록·수정 흐름을 끝까지
연결하는 업무 패턴**이다. 이전 [업무 화면 도입 점검](WORKPLACE-AUDIT-2026-09-22.md)의
React/Vue 지원 차이와 후속 5개 과제는 여전히 유효하다.

## 확인 범위와 한계

- React 구현 17개 파일과 Vue 구현 38개 파일의 공개 API·폼·상태 관리·주요 경합 경로를 읽고 대조했다.
- 카탈로그 69개 실행 예제, React/Vue 통합 예제, 소개·시작하기·원칙·패턴·도입 안내를 검토했다.
- README, docs 9개, 자산 출처, 토큰·공통 CSS 관련 계약, 빌드·카탈로그·소비자 검사와 Pages 배포 설정을 확인했다.
- 69개 기본 데스크톱 화면을 캡처·검토했다. 이 기본 화면 검토에서 누락·뚜렷한 잘림·가로 넘침·JavaScript 오류는 없었다.
- 새 히어로는 1440/900/390/320px에서 초기·빈 값 오류·선택 목록·다른 담당자 선택·완료·다시 시작의 6개 상태를 확인했다.
- 자동검사는 아래 명시된 시나리오를 대상으로 한다. 모든 내부 상태 조합, 실제 회사 API,
  대규모 데이터, VoiceOver/NVDA, 모바일 실기기, OS 자동완성·실제 한글 IME까지 검증한 것은 아니다.

## 이번에 수정한 문제

| 영역 | 재현된 문제와 수정 | 회귀 근거 |
| --- | --- | --- |
| 소개 | 삽화를 입력·선택·생성·다시 시작 흐름으로 교체. 빈 제목 검증, 완료와 재시작 포커스, 긴 제목 줄바꿈, 모션 감소 처리 | `docs-site.spec.ts`, `HeroTaskDemo.tsx` |
| Select 첫 진입 | 새로고침 직후 마우스로 열 때만 선택 항목에 키보드 포커스 선이 나타남 → 진입 방식을 구분하고 마우스 표시는 일관되게, 키보드 포커스는 유지 | `select-focus.spec.ts` |
| DatePicker | 필수 날짜가 여러 개면 마지막 필드가 첫 오류 포커스를 빼앗음 → 첫 invalid 입력만 포커스 이동 | `forms.spec.ts` |
| 제어형 날짜·시간·수량 | 부모가 입력값을 거절했는데 DOM/FormData 또는 customValidity는 거절한 값으로 남음 → 실제 부모 값에 맞춤 | `date-number-fields.spec.ts`, `time-controls.spec.ts` |
| TimeField | 부모가 유효한 값으로 보정해도 native validation 오류 문구가 남음 → 값·제약 변경 시 내부 오류 갱신 | `time-controls.spec.ts` |
| Vue Select | `name` 없는 필수 Select는 제출을 막지 못함 → 이름과 무관하게 필수 검증과 포커스 유지 | `forms.spec.ts` |
| 검색 선택 | 부모가 유효값을 복원해도 필수 오류가 남음 → 내부 오류 해제. 명시적 서버 `error`는 보존 | `search-validation.spec.ts` |
| React Combobox | 필수 제출은 막지만 오류 문구·`aria-invalid`는 갱신하지 않음 → 연결된 오류 표시와 초기화·외부 복원 처리 | `search-validation.spec.ts` |
| Vue Field | 슬롯 앞의 주석·Fragment를 입력으로 취급하여 실제 입력이 사라짐 → 실제 단일 입력을 찾아 label·오류·required 연결 | `vue-field.spec.ts` |
| Editable·Rating | 일부 기본·이름 없는 필수 상태가 제출을 통과함 → 저장된 값 검증과 첫 오류 포커스 보완 | `field-contracts.spec.ts` |
| TagsInput·Editable | reset 후 초안이 남아 다시 추가·저장 가능 → 초안·오류를 함께 초기화. 취소된 reset은 보존 | `field-contracts.spec.ts` |
| MonthPicker·YearPicker | 다른 기간을 탐색하면 선택된 radio가 사라져 React FormData 값도 누락 → 탐색과 제출값을 분리 | `field-contracts.spec.ts` |
| React 래퍼 | 12개 래퍼가 소비자 `className`을 덮어씀 → 기본 클래스와 병합 | `contracts.test.mjs` |
| 업로드 | 성공 후 소비자 콜백 예외를 전송 실패로 오인해 재업로드 허용 → 성공 상태·서버 결과 보존, 콜백 예외는 호출자에게 전달 | `upload-queue.test.mjs` |
| 업무 패턴 | 이름 외 필드 변경 뒤에도 저장 완료 표시가 남음 → 조직·마감일·알림·권한 변경 시 해제 | `patterns-state.spec.ts` |
| 제출 버튼과 blur | WebKit이 버튼 클릭 중 포커스를 MAIN으로 옮길 때 오류 문구가 먼저 생겨 버튼이 이동하고 클릭이 누락됨 → 같은 form의 제출/초기화 pointerdown을 확인해 blur 검증을 지연 | `patterns-state.spec.ts`, React/Vue `useFieldBlur` |
| 실행 예제 | 부분 선택 Checkbox가 고정, OTP 수정 후 성공 문구 잔존, readonly 날짜의 설명과 제출 불일치 → 실제 조작·제출 상태와 일치 | `example-state.spec.ts` |
| 재시도 예제 | 전역 실패 이력 때문에 초기화·다른 예제가 첫 실패를 건너뜀 → loader 인스턴스별 상태 분리 | `demo-retry.spec.ts` |
| 안내·도구 | React 시작 예제를 실제 form으로 수정, 공통 예제 코드 링크 제공, 카탈로그 파일 누락 검사, main 외 Pages 배포 차단, 과도한 검증 설명 정정 | 시작 코드·검사 스크립트·workflow·문서 대조 |

Mac에서 기존에 실패한 12건은 실제 제품 동작과 기본 HTML 컨트롤을 대조했다.
Home 키 의미, WebKit의 Option+Tab, native 스크롤의 키 누름 시간과 축 전환,
완전히 잘린 Select의 intrinsic 크기가 원인이었다. 테스트를 건너뛰거나 기대를
삭제하지 않고 실제 플랫폼 동작을 사용하는 방식으로 수정했다. 시스템 설정은 바꾸지 않았다.

## 실제 업무 화면에서 더 필요한 것

| 우선순위 | 과제 | 현재 있는 것 / 남은 일 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | 등록·수정 폼 패턴 | Field와 개별 검증은 있음. 폼 전체 ErrorSummary·서버 필드 오류·저장 중·실패·재시도·작성값 보존 연결이 필요 | 오류 요약에서 실제 입력으로 이동, 중복 제출 방지, 실패 후 값 유지와 재시도 성공을 하나의 예제로 검증 |
| 1 | 조회 화면과 필터 상태 | DataTable의 검색·정렬·페이지·행 선택은 있음. query를 외부에서 전달하는 계약은 없음 | 필터/표 상태 공유, URL 복원, 조건 초기화, 조건 변경 시 1페이지 복귀, 저장 후 같은 조건 재조회 |
| 1 | 실제 사용할 프레임워크의 API 범위 확정 | React/Vue 고수준 API는 같지 않음. Vue Stepper·Alert·Breadcrumb·단순 Table·기간 달력 등 격차 있음 | 첫 업무 화면에 쓰는 API 목록으로 부족한 래퍼만 보완하고 동일한 사용자 시나리오 검증 |
| 2 | 기존 첨부파일 관리 | FileUpload는 새 파일의 큐·전송·취소·재시도. 저장된 첨부의 조회·다운로드·삭제는 별개 | AttachmentList에서 삭제 중·실패·복구, 업로드 결과와 업무 저장의 연결을 명시 |
| 2 | 조직·담당자 선택 계약 | 검색·다중 선택·Tree는 있음. 외부 form/ref, 오류 요약 포커스 연결, 조직 계층 선택 규칙이 부족 | 단일/다중·부모/자식 선택·비활성 노드·검색/지연 로딩 요구를 정한 뒤 TreeSelect 또는 조합 패턴 결정 |
| 3 | 업무별 날짜·숫자 표현 | 기본 날짜 범위와 수량 검증은 있음. 영업일·휴일·기간 바로 선택, 통화·단위·지역별 표시가 없음 | 실제 필요한 규칙과 저장 형식을 정한 뒤 날짜 입력·달력·표시값의 일관성 검증 |
| 요구 발생 시 | 큰 목록과 편집 표 | 서버 목록·페이지는 있음. 가상화·무한 검색·셀 편집·대량 업로드는 미지원 | 실제 데이터량·응답시간 목표를 측정한 뒤 추가 |

추천 다음 작업은 **조회 목록 → 상세/수정 → 저장 성공·실패 → 목록 복귀**까지
연결되는 작은 업무 화면 하나다. 이 흐름을 만들면서 오류 요약과 query 제어를
공통화하면 실제 수요 없이 컴포넌트만 추가하는 일을 줄일 수 있다.

## 별도로 남긴 검토 항목

- Tree가 Dialog의 마지막 Tab 지점인 조합, 동적으로 노드를 교체하거나 외부에서 접었을 때의 포커스 복원.
- 긴 메뉴·Popover가 낮은 화면 높이에서 모든 항목에 접근 가능한지.
- Editable의 현재 저장값을 접근성 설명에 연결하는 보완.
- 일부 예제의 reset 후 출력은 이전 제출 결과를 유지한다. 현재 입력 결과로 오해하지 않도록 “마지막 제출값” 표현을 통일할 수 있다.

위 조합 항목은 이번 점검에서 확정된 제품 버그로 세지 않았다. 새 업무 화면에서
해당 조합을 사용하기 전에 별도 시나리오로 검증한다.

## 카탈로그 전체 인벤토리

| 분류 | 수 | 예제 ID |
| --- | ---: | --- |
| 입력 | 21 | button, input, textarea, select, select-form, field, checkbox, radio-group, switch, slider, number-field, pin-otp-input, tags-input, combobox, async-combobox, multi-select, file-upload, listbox, editable, color-picker, rating |
| 날짜·시간 | 10 | calendar, date-field, date-picker, date-range-field, date-range-picker, range-calendar, time-field, time-range-field, month-picker, year-picker |
| 탐색 | 12 | accordion, breadcrumb, collapsible, navigation-menu, menubar, pagination, stepper, tabs, tree, toolbar, toggle, toggle-group |
| 피드백·레이어 | 13 | dialog, alert-dialog, popover, tooltip, hover-card, dropdown-menu, context-menu, toast, progress, scroll-area, drawer, bottom-sheet, alert |
| 데이터·표현 | 13 | data-table, badge, card, avatar, table, list, separator, aspect-ratio, splitter, skeleton, empty-state, timeline, carousel |

69는 React 실행 예제 수이며 Vue의 독립 컴포넌트 수나 API 동등성 수치가 아니다.

## 검증 기록

- 최종 `npm run check`: **통과**, exit code 0.
- 패키지·문서 빌드, React/Vue·사이트 타입 검사, 카탈로그 **69/69** 통과.
- 단위 검사 **29/29** 통과. 실패·취소·건너뜀 없음.
- 독립 tarball 소비자: React **18/19**와 Vue **3.5.43**의 설치·타입·SSR·제품 번들 통과.
- Chromium·Firefox·WebKit 브라우저 검사 **885/885** 통과, 6.7분.
  소개·문서 21건, Select 첫 클릭/입력 방식 전환 15건, 필드 폼 계약 36건,
  Vue Field 9건과 기존 카탈로그·업무·접근성 회귀를 포함한다.
- `node scripts/generate-tokens.mjs --check`, 수정 코드 포맷·`git diff --check` 통과.
- 초기 실행에서 발생한 Vue Field 테스트의 ESM 수집 오류와 날짜 버튼의 부분 일치
  locator 충돌을 수정했다. 마지막 남은 WebKit 제출 클릭 누락은 실제 제품 결함을
  수정한 뒤 재검사했다. 위 수치는 모든 수정이 반영된 최종 전체 실행 결과다.
- 별도 읽기 전용 코드 검토와 소개 4개 너비·69개 기본 데스크톱 화면 검토에서
  차단할 결함을 발견하지 않았다. 시각·자동검사 범위 밖 항목은 위 한계에 남겼다.

로컬 자료는 Git에 포함하지 않는다:

- `artifacts/final-audit-check.log`: 최종 통합 검사 로그
- `artifacts/interactive-hero-review.md`, `interactive-hero-*.png`: 소개 4개 너비 × 6개 상태
- `artifacts/select-focus-pointer.png`, `select-focus-keyboard.png`: 첫 마우스 클릭과 키보드 포커스 표시
- `artifacts/catalog-visual-20260922/`: 69개 기본 화면, manifest와 6개 검토 시트
- `artifacts/mac-*-diagnostics.json`: Mac 기본 컨트롤과 컴포넌트 동작 대조

원격 검증·배포는 해당 커밋의 [GitHub Actions](https://github.com/dhyun0226/cheese-design-system/actions/workflows/pages.yml)를 확인한다.
