# 업무 화면 도입 점검 — 2026-09-22

## 범위와 현재 상태

이 문서는 공개 API, 업무 흐름의 빈틈, 이번 시각·동작 점검을 구분해 기록한다. 운영 도입 승인이나 접근성 적합성 인증 문서는 아니다.

- **69개는 React 실행 예제 수**이며 React/Vue 각각의 독립 컴포넌트 export 수가 아니다. [카탈로그](../site/catalog.ts), [실행 예제](../site/examples/), [import 계약 검사](../scripts/verify-catalog.mjs)가 근거다.
- Drawer·BottomSheet는 Dialog 배치, Select Form은 Select 폼 연결, Date Range Picker는 Popover와 Calendar의 조합이다. Range Calendar도 React `Calendar mode="range"` 예제이며 별도 `RangeCalendar` export가 아니다.
- Toast·OTP 시각 수정 후 69개 카탈로그 예제의 기본 렌더링을 다시 확인했다. 로컬 검토 자료는 `artifacts/detail-sheet-1.png`부터 `detail-sheet-4.png`까지이며 Git에는 포함하지 않는다. 다른 PC에서는 [브라우저 검사](../tests/browser.spec.ts)와 아래 회귀 검사를 다시 실행한다.
- 기본 화면 확인은 팝업·완료·실패·오류 포커스 등 모든 내부 상태의 통과를 의미하지 않는다. 자동검사 범위와 시각 검토, 회사에서만 가능한 통합 검증을 구분한다.

## React / Vue 지원 차이

공개 export는 [React 진입점](../packages/react/src/index.tsx), [Vue 진입점](../packages/vue/src/index.ts), [Vue 공통 래퍼](../packages/vue/src/styled.ts)를 비교했다.

| 항목                            | 확인한 범위와 대안                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stepper                         | React는 순서 목록·현재 단계·완료 표식을 제공한다. Vue에 대응하는 공개 Stepper가 없다. 이동 버튼은 React에서도 소비자가 별도로 구성한다.                                                                                                                                                                                                                                                                                                                                     |
| DatePicker / Calendar 기간 선택 | [React Calendar](../packages/react/src/Calendar.tsx)는 DatePicker와 `mode="range"`를 제공한다. [Vue Calendar](../packages/vue/src/Calendar.vue)는 단일 `DateValue`와 `CalendarRoot` 구성으로 동일한 기간 선택 계약이 없다. Vue DatePicker export도 없다. [Vue DateField](../packages/vue/src/DateField.vue)는 날짜 입력·달력 팝업·폼 제출 대안이고, [DateRangeField](../packages/vue/src/DateRangeField.vue)는 시작·종료 입력 조합이다. 기간 달력 선택과 같은 API는 아니다. |
| Alert                           | React는 `tone`에 따라 `role="status"` 또는 `role="alert"`를 제공한다. Vue에 동일한 공개 컴포넌트가 없다. AlertDialog는 확인 대화상자이므로 별개다.                                                                                                                                                                                                                                                                                                                          |
| Breadcrumb                      | React는 경로 목록과 마지막 항목의 `aria-current="page"`를 제공한다. Vue에 대응 공개 컴포넌트가 없다.                                                                                                                                                                                                                                                                                                                                                                        |
| 기본 Table                      | React의 `caption/headers/rows` Table은 Vue에 없다. Vue [DataTable](../packages/vue/src/DataTable.vue)은 검색·정렬·페이지·행 선택을 갖춘 대안이지만 같은 단순 Table API는 아니다.                                                                                                                                                                                                                                                                                            |

Skeleton·EmptyState·List·Timeline도 Vue에 동일 이름의 고수준 export가 없다. AspectRatio는 Vue에서 `Primitives`를 통한 기반 컴포넌트 사용이 가능하므로 기능 전체 누락으로 세지 않는다.

Checkbox·Switch·RadioGroup·Slider·Accordion·Tooltip·Progress·Avatar·Toast·ToggleGroup는 Vue의 Root/Indicator 등 조합 API를 확인했다. 이름이 다른 고수준 래퍼를 기능 누락으로 세지 않는다. AsyncCombobox·MultiSelect·DataTable·FileUpload와 DateField·TimeField·NumberField는 양쪽에 공개되어 있다. 이는 모든 prop·동작의 완전한 동등성을 인증하는 목록은 아니다.

[README](../README.md), [마이그레이션 안내](MIGRATION.md), [기술 점검](REVIEW.md)은 전체 고수준 API가 같지 않다고 명시한다. 그러나 개별 미지원 import 목록은 없으므로 도입 시 위 차이를 함께 안내해야 한다.

## 업무 도입을 위한 다음 5개 과제

다음은 아직 완료되지 않은 후속 과제다. 새 컴포넌트 수를 늘리기 전에 실제 업무 흐름과 공통 계약을 보강한다.

1. **ErrorSummary와 입력 포커스 계약.** [Field](../packages/react/src/index.tsx)는 개별 label·설명·오류를 연결하고, [업무 폼 검사](../tests/workplace.spec.ts)는 일부 입력의 첫 오류 포커스를 다룬다. 폼 전체 오류 요약, 오류 항목에서 실제 입력으로 이동, 복합 컨트롤의 포커스 대상 계약은 별도로 정리해야 한다. 첫 오류 이동·서버 필드 오류·숨겨진 입력 proxy·폼 밖 연결 입력을 React/Vue에서 같은 시나리오로 확인한다.
2. **Filter 패턴과 DataTable의 외부 query 제어.** [React DataTable](../packages/react/src/DataTable.tsx), [Vue DataTable](../packages/vue/src/DataTable.vue)은 내부 `{ page, pageSize, search, sort }`를 관리하고 변경을 알리지만 외부 `query`/`v-model:query` 입력은 없다. 필터와 표의 상태 공유, URL에서 복원, 전체 초기화, 조건 변경 시 1페이지 복귀를 제어 계약으로 추가한다. 현재 행 선택의 외부 제어와 query 제어를 혼동하지 않는다.
3. **저장 실패 복구 예제.** [Field 예제](../site/examples/field.tsx), [Vue 통합 예제](../site/VueDemo.vue)는 입력 검증 중심이다. 검색·업로드 재시도와 업무 폼 저장 복구는 별개다. 서버 저장 실패 후 작성값 보존, 중복 제출 방지, 필드/전체 오류 분리, 재시도 성공 후 상태 전환을 재현하는 예제를 만든다. 이탈 경고와 충돌 처리의 필요 범위는 제품 API와 합의한다. 기존 과제 근거: [운영 준비의 업무 폼 패턴](PRODUCTION-READINESS.md).
4. **AttachmentList 패턴.** [FileUpload](../packages/react/src/FileUpload.tsx)와 [업무 컴포넌트 안내](BUSINESS-COMPONENTS.md)는 새 파일의 큐·전송·취소·재시도를 제공한다. 기존 저장 첨부의 ID·파일명·크기 표시, 다운로드, 삭제 중/실패/복구는 별도 패턴으로 구성한다. 업로드 성공 항목의 현재 삭제 버튼은 로컬 큐에서만 제거하며 서버 파일 삭제나 업무 저장 취소를 수행하지 않는다.
5. **TreeSelect는 요구 확정 후.** [React Tree](../packages/react/src/Tree.tsx), [Vue Tree](../packages/vue/src/Tree.ts)는 계층 탐색·펼침·단일 선택을 제공한다. 팝업 선택 입력, 검색, 폼 제출, 다중 선택·부모/자식 연동 계약은 별도다. 조직 선택의 단일/다중 여부, 부모 선택 의미, 비활성 노드, 지연 로딩·검색 범위를 확정한 뒤 Tree와 Select 패턴의 조합 또는 독립 컴포넌트를 결정한다.

## 이번 수정 — 로컬 검증 완료

| 항목                  | 수정 범위와 확인할 계약                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stepper               | 숫자 굵기와 완료 아이콘 처리를 공통 스타일에 맞춘다. [공통 CSS](../packages/css/src/components.css), [React Stepper](../packages/react/src/index.tsx), [타이포그래피 검사](../tests/typography.spec.ts). 폰트 자체는 기존에도 Pretendard였다.                                                                                                          |
| Toast                 | 제목·설명·닫기 영역의 배치와 좁은 화면을 확인한다. [React 구현](../packages/react/src/index.tsx), [Vue 래퍼](../packages/vue/src/styled.ts), [실행 예제](../site/examples/toast.tsx).                                                                                                                                                                  |
| OTP                   | 기본 6칸의 시각 표현과 실제 입력 요소 1개를 함께 유지한다. 붙여넣기·선택·폼 값·오류 포커스는 [PIN 검사](../tests/pin-input.spec.ts)로 확인한다. `autocomplete="one-time-code"` 속성은 유지하지만 실제 OS SMS 자동완성은 별도 실기기 검증 대상이다. [React Fields](../packages/react/src/Fields.tsx), [Vue PinInput](../packages/vue/src/PinInput.vue). |
| 검색 선택 오류 포커스 | 여러 필수 검색 선택 입력에서 첫 오류 입력으로 포커스를 이동시키는 계약을 검증한다. [React SearchSelect](../packages/react/src/SearchSelect.tsx), [Vue SearchSelect](../packages/vue/src/SearchSelect.vue), [검색 선택 폼 검사](../tests/search-validation.spec.ts).                                                                                    |

## 최종 검증 기록

- 카탈로그: `npm run verify:catalog`의 69개 실제 패키지 예제 계약 통과. 변경 후 69개 기본 렌더 확인, 페이지·리소스 오류 0. 네 장의 검토 시트와 OTP·Stepper·Toast의 별도 상태 캡처를 검토했다.
- `npm run build`, `npm run typecheck`, 토큰 생성 결과 검사, `git diff --check`: 통과.
- `npm run test:unit`: 21개 통과, 실패·건너뜀 0.
- `npm run test:consumer`: React 18/19 + Vue 독립 tarball의 설치·타입·SSR·제품 번들 통과. OTP paste 이벤트 보강을 포함한 `b17da60`은 GitHub CI에서도 빌드·타입·21개 단위·카탈로그·소비자 검사를 통과했다.
- 대상 브라우저 검사: `docs-site`, `typography`, `toast-layout`, `search-validation`, `pin-input`, `workplace`의 **180개 시나리오(3개 엔진 합계)**. 통합 실행에서 178개 통과, WebKit readonly 키 입력 테스트 2개는 아래 테스트 전제 문제로 실패했다. 수정한 readonly 시나리오를 React/Vue × Chromium/Firefox/WebKit **6개 모두 재실행해 통과**했다. 최종 미해결 실패·건너뜀 없음. 한 번의 실행에서 180개가 전부 통과했다는 기록은 아니다.
- WebKit은 readonly 입력의 Backspace를 브라우저 뒤로 가기로 처리했다. 입력값 불변 테스트는 Delete와 숫자 키로 수정했다. 편집 가능한 입력의 Backspace 삭제 검사는 유지하며 제품에 브라우저 내비게이션 차단을 추가하지 않았다.
- Firefox는 synthetic ClipboardEvent 생성 시 전달한 clipboard 데이터를 제거했다. 테스트 helper에서 실제 시험용 DataTransfer를 연결하고 payload가 없으면 즉시 실패하도록 했다. 이는 붙여넣기 핸들러 검사이며 실제 OS clipboard/SMS 자동완성 검증을 대체하지 않는다.
- [첫 전체 CI](https://github.com/dhyun0226/cheese-design-system/actions/runs/35709795454)는 756개 통과, 3개 실패였다. 기존 `extended.spec.ts`에서 버튼 이름 `알림 표시`를 부분 일치로 검색해 새 `긴 알림 표시`까지 동시에 찾은 실패다. `exact: true`로 대상 버튼을 명시한 후 `npx playwright test tests/extended.spec.ts -g 'other interactions'`를 실행해 **3개 엔진 모두 통과**했다. 첫 CI는 배포하지 않았으며 후속 커밋의 전체 결과를 확인해야 한다.
- 최종 커밋의 **전체** 회귀·독립 설치·Pages 배포는 [GitHub Actions](https://github.com/dhyun0226/cheese-design-system/actions/workflows/pages.yml)에서 해당 커밋의 `verify`/`deploy` 결과를 확인한다. 로컬 대상 검사와 전체 CI를 혼동하지 않는다.
- 현재 저장소의 스크린샷은 검토 증거이며 자동 픽셀 회귀 기준으로 간주하지 않는다.

실제 API 권한·저장·첨부 보존/삭제·대용량 데이터와 NVDA/VoiceOver·실기기·한글 IME의 운영 검증은 별도다. 도입 판단은 [도입 체크리스트](ADOPTION.md)와 [운영 준비 과제](PRODUCTION-READINESS.md)의 기준 프레임워크·배포·호환성 계약까지 포함한다.
