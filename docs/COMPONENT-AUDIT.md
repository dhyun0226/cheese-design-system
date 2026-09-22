# 전체 카탈로그 점검 — 2026-09-22

대상: CHEESE의 69개 실행 예제, 공통 CSS/토큰, React/Vue 소비자, 문서 사이트.
화면 수는 패키지 export 수가 아니다. Drawer/BottomSheet 등의 조합 예제도 포함한다.

## 시각적 결정과 수정

- 입력은 흰색 + #CECECE 1px 전체 경계. hover #BBBBBB. 하단선·그림자·회색 채움 없음.
- focus는 중립색 안쪽 경계와 붙어 있는 골드 outline. Tags의 실제 입력과 바깥 컨테이너에 링을 중복 표시하지 않음.
- 읽기 전용/비활성 경계는 더 약하게 유지. 클릭·키보드·오류/설명 연결을 시각과 별도로 검사.
- Switch는 검은 둘레선 없이 꺼짐 트랙만 #E5E5EA로 식별. 켜짐 골드와 손잡이 위치 유지.
- NativeSelect: background shorthand로 포커스/비활성 시 화살표가 지워지는 문제 수정.
- NavigationMenu: hover가 바탕과 같아 보이던 문제 수정.
- 소비자가 사용자 class를 먼저 넣어도 reduced-motion이 적용되도록 선택자 보강.
- 320px 문서에서 NavigationMenu/Toolbar의 긴 API 이름 때문에 생긴 가로 넘침 수정. 컴포넌트 외형 override가 아닌 문서 줄바꿈/그리드 최소 폭 수정.

## 전수 점검 범위

모든 예제: 페이지 로드/런타임 오류, 표시된 컨트롤의 Pretendard, axe 자동 접근성 검사,
320px/390px 문서 가로 넘침 검사. 1440px 화면 캡처 후 69개 미리보기를 시각 검토했다.
팝업은 아래 시나리오로 별도 열어서 확인한다. 기본 화면 캡처를 모든 내부 상태의 검증으로 취급하지 않는다.

| 카탈로그 | 추가 동작/상태 점검 |
| --- | --- |
| Button, Input, Textarea, Field | 기본/hover/focus/readonly/disabled, 오류 연결, 크기 고정, 중복 제출 방지 계약 |
| Select, NativeSelect | 키보드·옵션 선택, disabled 옵션, required/reset/제출, 네이티브 화살표 유지 |
| NumberField, DateField, TimeField | native type/min/max/step 전달, 정상·범위 밖 값, 브라우저 text fallback 구분 |
| Checkbox, RadioGroup, Switch | 체크/부분 선택/비활성, 방향키·Space, 선택 표시, 스위치 손잡이/고대비 |
| Toggle, ToggleGroup, Slider | 선택 상태·키보드, 선택 하단선 없음, 슬라이더 값 변경 |
| Pin/OTP Input, TagsInput, Editable | 입력 필터/길이·초기화, 중복/IME/삭제, 편집 저장/취소 |
| Combobox, AsyncCombobox, MultiSelect, Listbox | 검색/빈 결과/선택, IME, 다중 선택 제한·폼 값·reset, 요청 취소·응답 순서·재시도 |
| ColorPicker, Rating | 라벨 있는 선택·키보드, 읽기 전용 상태 |
| Calendar, RangeCalendar, DatePicker, DateRangePicker | 날짜/범위/금지 날짜, 팝업, 폼 validation/reset/readonly/ref |
| DateRangeField, TimeRangeField, MonthPicker, YearPicker | 역전 범위·제출·reset, 월/연도 경계 내 이동 |
| Dialog, AlertDialog, Drawer, BottomSheet | 열기/닫기, 포커스 이동·복원, 취소 우선, 작은 화면 경계, 열린 상태 axe |
| Popover, DropdownMenu, ContextMenu, HoverCard, Tooltip, Toast | 열기/닫기·Escape, 메뉴 선택, 키보드/포인터, 알림 표시 |
| NavigationMenu, Menubar, Toolbar | 메뉴 이동/선택, 링크 Tab 이동, 서식 toggle, hover 구분 |
| Tabs, Pagination, Stepper, Tree | 탭/페이지/단계 변경, 양 끝 제한, 단일 Tab 진입과 트리 방향키·선택 |
| Card, EmptyState, Carousel | 카드 팝업, 필터 초기화, 이전/다음 경계·지표 |
| DataTable, FileUpload | 서버 정렬/페이지/선택/열 표시, stale 응답 방지, 전송/검증/실패/취소/재시도/큐 제한 |
| Accordion, Collapsible, Splitter | 확장/접기, 키보드, 패널 드래그·크기 제한 |
| Progress | 표시 값·ARIA 동기화, 범위 clamp 계약 |
| Alert, AspectRatio, Avatar, Badge, Breadcrumb, List, ScrollArea, Separator, Skeleton, Table, Timeline | 내용·구조·레이아웃·타이포그래피·자동 접근성, 테이블 구분선/hover |

## 재현 가능한 검사

- `npm run build`, `npm run typecheck`, `npm run verify:catalog`, `npm run test:unit`.
- `npm run test:consumer`: workspace 링크 없이 tarball 설치, React 18/19 + Vue 3.5 소비자 타입/SSR/제품 빌드.
- `npm test`: Chromium/Firefox/WebKit. 전체 통과 여부는 이 변경을 포함한 커밋의 CI 결과를 확인한다.
- `tests/browser.spec.ts`: 69개 실제 카탈로그의 렌더링/axe/컨트롤 폰트.
- `tests/surfaces.spec.ts`, `toggle-surfaces.spec.ts`: 공통 시각 계약, 작은 화면, focus/고대비, React/Vue 동일 스타일.
- `tests/catalog-behavior.spec.ts`: Drawer/BottomSheet/Popover, Collapsible/Stepper, Radio/Progress, native 필드.
- 기존 `catalog-completion`, `business`, `forms`, `compositions`, `extended` 시나리오도 유지.
- 캡처/트레이스는 `artifacts/`, `test-results/`, CI `browser-evidence` artifact. 캡처 생성만으로 픽셀 회귀 테스트를 통과했다고 주장하지 않는다.

## 남은 운영 검증 / 알려진 한계

1. **기본 경계의 대비:** #CECECE는 흰색 대비 3:1에 미달한다. 고대비 모드 지원이 기본 테마의 WCAG 준수 인증은 아니다. 제품의 요구에 따라 controlBorder를 강화하고 실제 사용자에게 입력 위치가 식별되는지 검증한다.
2. **실제 접근성:** NVDA/VoiceOver, 실기기 Safari/iPhone, OS 확대 200%, 실제 한글 IME 입력·긴 업무 데이터 수동 검증은 별도다. 자동 IME 이벤트/뷰포트 검사는 이를 완전히 대체하지 않는다.
3. **Native Date/Time:** 브라우저가 text로 대체하면 native 범위 검증이 없다. 엄격한 날짜/시간 정책은 DatePicker/RangeField 및 서버 검증을 사용한다. 테스트는 이 차이를 명시적으로 기록한다.
4. **색이 아닌 오류 안내:** 중립색 오류 표현이므로 설명·아이콘·ARIA를 생략하지 않는다. 폼 색만 바꿔 오류를 전달하지 않는다.
5. **제품 연동:** 실제 API 권한/SSO·파일 내용 검증·대용량/가상화·저장 실패 복구는 UI 예제의 성공과 별개다.
6. **성능/릴리스:** 문서 앱 메인 JS의 500KB 경고가 남아 있다. 실제 제품의 번들 예산, 시각 기준 이미지 승인, 패키지 버전/배포 정책은 별도 필요하다.

상세 운영 도입 조건은 [PRODUCTION-READINESS](PRODUCTION-READINESS.md),
공통 시각 규칙과 출처는 [VISUAL-FOUNDATION](VISUAL-FOUNDATION.md)을 따른다.
