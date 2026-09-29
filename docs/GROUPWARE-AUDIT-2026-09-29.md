# 업무 홈 수정 및 전체 점검 — 2026-09-29

## 후속 수정 — 같은 날 추가 요청

아래의 최초 점검 기록에서 발견했던 기능·접근성 결함을 후속 요청에 따라 수정했다. 최초 재현 결과는 비교 근거로 보존한다.

| 대상 | 후속 수정 |
| --- | --- |
| 평가 제출 | 초안/제출 상태·실제 제출 시각을 함께 저장. 재진입·새로고침 후 제출 내용은 읽기 전용으로 유지 |
| 업무 홈 | 평가 시작 전/작성 중/제출 완료와 할 일 수를 실제 예제 상태에서 계산 |
| 알림 | 읽음 상태·홈 숫자를 공통 세션으로 연결. 제목에 실제 업무 목적지 연결. 미저장 이탈 보호 유지 |
| 평가 키보드 | 작성·검토·제출 단계의 제목 및 첫 오류 필드로 포커스 이동 |
| SavedViews | React/Vue 모두 한글 조합 중 Enter를 저장으로 처리하지 않음 |
| CommentThread | 편집/답글 도중 권한이나 콜백이 없어져도 입력 내용을 유지하고 취소 가능. 권한 없는 제출은 차단 |
| Vue 조직 검색 | 검색 중 데이터가 바뀌면 새 일치 항목의 부모를 펼침. 일반 탐색의 펼침 상태는 보존 |
| Vue 내보내기 | 내용이 같은 새 props는 진행 중 요청 유지. 실제 설정 변경은 취소하고 늦게 도착한 결과는 무시 |
| 비활성 컨트롤 | TagsInput 저장된 값의 읽기 대비 복구. Vue Listbox의 비활성 의미·키보드·native button 동작 보강 |

`site/groupware-session.ts`는 예제용 탭 세션 어댑터다. 저장 실패 시 성공 상태를 표시하지 않으며, 이전 형식의 초안과 잘못된 저장 데이터도 처리한다.
이것은 서버 영구저장·인증·권한 검증의 대체물이 아니다.

추가 회귀 검사: `groupware-session.spec.ts`, `comment-permissions.spec.ts`, `data-refresh-regressions.spec.ts`, `disabled-semantics.spec.ts`.
모바일 확인 방법은 [모바일 미리보기](MOBILE-PREVIEW.md)에 정리했다.

### 후속 검증 결과

- 프로덕션 패키지/사이트 빌드와 전체 타입 검사 통과. 500kB 초과 번들 경고는 기존 성능 보강 과제로 남아 있다.
- 카탈로그 72개와 실행 예제 72개 연결 확인.
- 첫 수정 검사는 68개 중 62개 통과/6개 실패. 실제 추가 원인 2개(5개 테스트에 영향을 준 Vue 내보내기의 오래된 접근성 이름, 1개 테스트의 비활성 Listbox tabindex)를 수정했다. 테스트 기대값을 완화하지 않았다.
- 외부 tarball 소비자 검사: 일반 설치와 캐시 전용 설치 모두 `npm install` 단계에서 240초 제한에 걸려 종료됐다. 소비자 타입·SSR·번들 단계까지 도달하지 못했으므로 통과로 간주하지 않는다. 임시 증거는 `cheese-consumer-qPpC1R`, `cheese-consumer-eL2Sxw`에 보존됐다.
- 최종 단위 검사 33개 통과.
- 전체 Chromium **562개 모두 통과** (28.9분, workers=2, 재시도 없음). 이전 점검의 4개 접근성 실패와 당시 별도 재시도가 필요했던 3개 대기 실패도 이번 전체 실행에서 통과했다. 근거: `artifacts/groupware-final-chromium.json`.
- Firefox/WebKit 수정 관련 검사 136개: 최초 완료 실행은 **135개 통과/Firefox 1개 전체 시간 제한 초과** (14.1분). 해당 댓글 시나리오는 trace에서 21개 assertion이 모두 통과했으나 브라우저·페이지 준비와 첫 화면 로딩에 약 29.4초가 소요되어 45초 총 제한을 넘었다. assertion 제한은 그대로 두고 전체 제한 90초·단독 실행으로 재확인해 **1개 통과** (32.8초). 모든 대상 시나리오의 통과를 확인했으나 최초 실행이 무실패였다는 뜻은 아니다.
- 위 교차 브라우저 검사는 전체 Chromium 완료 후 별도로 실행했다. 이전 병행 시도는 Firefox 1개 타임아웃 후 중단한 실행으로, 완료 검사 수에 포함하지 않았다.
- 홈 반응형은 Chromium/Firefox/WebKit 각각 1440/1280/1024/768/390/320px를 확인했다. 320px에서 메뉴 → 빈 값 오류 → 작성 → 제출 → 알림 창을 터치 이벤트로 조작한 검사도 세 엔진 모두 통과했다. 실제 휴대폰 및 OS 한국어 IME·보조기술 수동 검증과는 구분한다.
- 소스·타입·회귀 테스트·문서만 커밋 대상으로 선택했다. 생성된 `dist/`, 브라우저 증거 및 임시 fixture 실행물은 포함하지 않는다. 게시 전 정적 점검에서 151개 변경 파일의 경로 대소문자·참조·비밀값·산출물 유입에 새 차단 문제는 발견하지 않았다.

---

## 최초 점검 기록

## 수정한 사항

`site/groupware-shell.css`에서 존재하지 않는 `--cheese-space-5`를 참조하고 있었다.
실제 브라우저에서 업무 카드의 padding은 `0px`, 카드와 일정의 gap은 `normal`로 계산됐다.
카드 안쪽 콘텐츠가 테두리에 붙고 일정 구분선 다음 행이 붙어 보이는 원인이었다.

- 이미 정의된 간격 토큰으로 카드 padding, 화살표 간격, 일정 행 간격을 복구했다.
- 1100px 이하에서 업무 목록과 일정을 세로로 배치하여 사이드바 옆의 좁은 두 열을 피했다.
- 모바일 카드 padding, 일정 날짜 열, 화살표 크기와 제목 굵기를 정리했다.
- 업무 링크의 키보드 포커스를 CHEESE Gold로 표시하고 기존 모션 토큰을 사용했다.
- `tests/groupware-home-layout.spec.ts`에 실제 카드 안쪽 여백과 일정 간격, 가로 넘침을 확인하는 회귀 검사를 추가했다.

## 확인된 추가 과제

최초 점검 시점에는 아래 기능을 수정하지 않고 보고했다. 이후 수정 상태는 문서 상단을 확인한다.

### 우선: 평가 제출 상태 보존

- 증거: `site/EvaluationProductDemo.tsx:81`, `:120`, `:209`.
- 재현: 자기평가 작성 → 검토 → 제출 → 새로고침 또는 다른 메뉴를 거쳐 재진입.
- 결과: 입력한 내용은 남지만 제출 여부가 초기화되어 다시 작성·제출할 수 있다.
- 대응: 초안/제출 상태와 제출 시간을 같은 세션 데이터 모델에 저장하고 홈과 상세가 같은 상태를 읽게 한다.
- 확인 수준: 실제 Chromium에서 재현. `artifacts/home-flow-audit.json`.

### 우선: 알림과 홈 상태 연결

- 증거: `site/GroupwareShell.tsx:50`, `:84`, `:142`; `site/ProductExamples.tsx:59`, `:64`.
- 재현 1: 알림함에서 모두 읽음 → 상단 배지는 사라지지만 홈은 계속 `2건`.
- 재현 2: 알림 제목 클릭 → 창만 닫히고 해당 업무로 이동하지 않음.
- 소스에서도 읽음 상태의 메뉴별 초기화와 실제 초안 존재 여부에 관계없는 홈의 `작성 중` 고정값을 확인했다.
- 대응: 알림 읽음 및 목적지와 홈의 요약 수치를 공통 세션 상태로 연결한다. 메뉴 이동은 기존 미저장 이탈 보호를 유지해야 한다.
- 확인 수준: 실제 Chromium에서 재현. `artifacts/home-flow-audit.json`.

### 우선: 한글 조합 중 Enter 처리

- 증거: `packages/react/src/data-actions.tsx:157`; `packages/vue/src/data-actions/SavedViews.vue:163`.
- SavedViews의 보기 이름 입력에서 Enter가 조합 중인지 확인하지 않고 저장을 실행한다.
- React/Vue에서 `compositionstart` 후 `isComposing: true`, `keyCode: 229`인 Enter를 보내면 보기 저장 및 입력 초기화가 실행되는 것을 확인했다.
- 대응: 조합 중인 Enter를 제외하고 조합 종료 후 Enter 또는 저장 버튼에만 저장을 연결한다.
- 확인 수준: 양쪽 프레임워크의 브라우저 이벤트 재현 + 소스 검토. 실제 OS IME 검증과는 구분한다.

### 접근성: 평가 내부 단계의 포커스

- 증거: `site/EvaluationProductDemo.tsx:167`, `:190`; `site/GroupwareShell.tsx:89`.
- 작성/검토 화면으로 넘어가면 이전 버튼이 제거되지만 새 화면 제목으로 포커스를 옮기지 않아 `document.activeElement`가 BODY가 된다.
- 대응: 단계 이동 시 제목으로 포커스를 넘기고 필수값 누락 시 첫 오류 필드로 이동한다.
- 확인 수준: 실제 Chromium에서 재현. `artifacts/home-flow-audit.json`.

## 컴포넌트 경계 조건 — 실제 재현 완료

아래는 실제 패키지를 가져온 임시 소비 화면에서 Chromium으로 재현했다.
React/Vue 비교 8개 시나리오를 실행했으며 페이지 실행 오류는 없었다.
증거: `artifacts/catalog-edge-repro.results.json`, 재현 스크립트 `artifacts/catalog-edge-repro.mjs`.

| 대상 | 확인할 상황 | 근거 |
| --- | --- | --- |
| React/Vue CommentThread | 댓글 편집/답글 작성 중 권한을 제거하면 입력창과 취소 버튼이 사라지면서 다른 버튼이 잠김. 양쪽 프레임워크에서 재현 | React `collaboration.tsx:421`, `:464`, `:498`, `:510`; Vue `CommentEntry.vue:71`, `:97`, `:126`, `:135` |
| Vue OrganizationTreeSelect | 검색어를 유지한 채 nodes가 바뀌면 새 일치 항목이 접힌 부모 안에 숨음. React는 표시 | `OrganizationTreeSelect.vue:70`; `OrganizationSelectionTree.ts:187` |
| Vue ExportDialog | 같은 내용을 가진 새 배열을 props로 전달하면 진행 중 내보내기를 취소하고 설정 변경 오류 표시. React는 정상 완료 | Vue `ExportDialog.vue:92`; React 내용 비교는 `data-actions.tsx:894` |

### 자동 접근성 검사에서 남은 실패

- TagsInput의 비활성 태그 텍스트: 검사에서 계산된 대비 1.85:1.
- Vue ListBox의 비활성 option 텍스트: 검사에서 계산된 대비 1.94:1. DOM에는 `role="option"`과 `disabled`/`data-disabled`가 있지만 `aria-disabled`가 없다.
- 비활성 항목의 의미 전달과 텍스트 표시를 함께 검토해야 한다. 비활성 UI의 대비 예외 여부도 구분해야 하므로 단순히 모든 색상을 진하게 바꾸거나 검사 규칙을 끄는 방식으로 처리하지 않는다.
- 근거: `test-results/browser-catalog-tags-input-chromium/error-context.md`, `test-results/browser-Vue-package-models-cc1a5-switch-tabs-dialog-and-tree-chromium/error-context.md`.

## 점검 범위와 현재 증거

- 패키지/사이트 프로덕션 빌드 및 전체 타입 검사 통과. 기존 500kB 이상 번들 경고는 남아 있다.
- 단위 검사 33개 통과. 기본 카탈로그 72개와 실제 패키지 실행 예제 72개 대응 확인.
- 조합형 문서 35개 이름의 React/Vue 공개 export 존재 확인. 모든 기존 기본 API가 두 프레임워크에서 동일하다는 뜻은 아니다.
- 390px에서 기본 문서 72개 + 조합형 문서 35개를 직접 순회: 페이지 가로 넘침과 실행 오류 0. `artifacts/catalog-layout-audit.json`.
- 홈 회귀 검사: Chromium/Firefox/WebKit 3개 모두 통과. 각 엔진에서 1440/1280/1024/768/390/320px, 총 18개 화면 폭 조합의 실제 여백·가로 넘침·섹션 배치를 검사했다. 각 엔진에서 320px 접근성 자동 검사와 업무 링크 포커스도 통과했다.
- 전체 Chromium 검사 `npx playwright test --project=chromium --reporter=line`: 505개 실행, 498개 통과 / 7개 실패 (19.3분). 업무 홈·평가·직원·오디션 제품 검사 및 전체 카탈로그의 320/390px 레이아웃 검사 통과.
- 최초 실패 중 메뉴 키보드, React Select 표시, Vue TimeField 표시의 대기 시간 초과 3개는 같은 빌드에 대해 단독 재실행하여 모두 통과했다. 최초 전체 실행이 무실패였다는 의미는 아니며, 병렬 검사에서 간헐적 대기 실패가 있었음을 남긴다.
- 미해결 자동 검사 실패는 4개: TagsInput 대비 관련 2개, Vue ListBox 비활성 option 대비 관련 2개. 위 접근성 항목에 근거를 기록했다. 나머지 직접 재현한 기능 과제는 현재 자동 테스트에서 잡지 못하는 추가 시나리오다.
- CSS/사이트 소스의 미정의 CHEESE 변수 참조를 대조했다. 수정 후 남은 `--cheese-pin-length`는 React/Vue PinInput이 inline style로 주입하는 정상 동적 값이다.
- 화면 캡처: `artifacts/home-before-1440.png`, `artifacts/home-after-desktop.png`, `artifacts/home-after-mobile.png`.

직원·오디션 예제의 변경사항은 기존 문서에 명시된 메모리 기반 예제 계약이다. 실제 서비스의 API/인증/영구저장은 이 점검에서 구현하거나 검증한 범위가 아니다.

최초 변경은 업무 홈 CSS, 홈 레이아웃 회귀 검사, 이 점검 문서와 README 연결까지였다. 후속 변경 범위는 상단에 별도 기록했다.
