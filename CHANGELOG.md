# 변경 이력

## Unreleased — 운영 도입 전 보강

### 업무 입력·스크롤·문서

- **Breaking:** NativeSelect 패키지 API 제거. Select와 Select Form 예제로 전환.
- React/Vue DateField·TimeField·NumberField와 양방향 ScrollArea 제공. 직접 입력, 디자인된 선택창, min/max/step, 인라인 오류, disabled/readOnly, form/reset 계약 추가.
- 기간 입력에서 공통 필드 재사용, DataTable 표시 열 Popover, OTP 인라인 오류, 취소된 파일 업로드 reset 보존.
- 공통 overflow 스크롤 스킨과 강제 색상·동작 감소 지원. OS 파일 선택창·키보드는 유지.
- SEED를 참고한 문서 구조·페이지네이션, 내비게이션 공통 높이, CHEESE의 치즈 달 콘셉트 소개.

### 시각 체계 — 면과 상태 중심

- Switch의 기본 둘레선·손잡이 그림자, Toggle/ToggleGroup/Toolbar의 선택 하단선 제거. 골드·손잡이 위치·텍스트 굵기로 상태 구분, 키보드 포커스와 고대비 모드는 유지.
- 입력·장식 구분선·카드·팝업·포커스 토큰 분리. 카드/표/툴바의 반복 외곽선을 줄이고 깊이와 간격으로 영역 구분.
- Input/Select/Tags는 흰색 + 은은한 1px 전체 경계(#CECECE), hover는 #BBBBBB. 하단선·회색 채움·겹친 그림자 없음. 포커스는 중립색 경계에 골드 외곽선을 붙이며 사이트 검색도 같은 패키지 스타일 사용.
- NativeSelect의 포커스/비활성 상태에서 배경 화살표 보존. NavigationMenu의 hover 구분, 꺼진 Switch의 중립색 트랙, 사용자 class 순서에 독립적인 reduced-motion 적용.
- 전체 69개 카탈로그에 컨트롤 Pretendard 검사 추가. 입력 경계/크기/Tags 포커스 및 React/Vue 네이티브 선택창 상태를 회귀 검사.
- 업로드 취소 회귀 검사를 요청/응답 게이트로 동기화하여 실행 속도에 따른 타이머 경쟁 제거.
- 단일 행 control leading을 normal로 통일하고 고정/최소 높이와 flex 중앙 정렬 사용. 본문 1.5/제목 1.25 분리, 굵기 토큰 400/500/600/700 추가. `lineHeight.control`을 숫자가 아닌 CSS 값으로 사용해야 함.
- 주요 API를 실제 Badge로 표시하고 문서의 제목·섹션·본문·보조 정보 크기/굵기 계층 보강. 단일 행 정렬·React/Vue 소비자·API 배지 회귀 검사 추가.
- 체크박스·캘린더·기간 선택의 진한 둘레선을 제거하고 체크/밑줄로 상태 보완. 골드와 Pretendard 유지.
- 대비 강화/강제 색상 지원, 포커스 보조선, 읽기 전용·비활성·오류 상태 보강. 상세 계약: `docs/VISUAL-FOUNDATION.md`.

### 카탈로그 · 골드 팔레트 · 아이콘

- 업무 확장 4종: AsyncCombobox, MultiSelect, DataTable, FileUpload. React/Vue 대응 API, 서버 검색·표 요청 취소/응답 순서 보호, 업로드 진행·취소·재시도와 multipart XHR 어댑터. 총 69개 실행 예제.
- 실제 HTTP 전송 계약·폼 값·다중 선택·서버/로컬 표·취소 후 늦은 응답과 업로드 큐 검증 추가. 공개 예제는 명시적으로 가상 데이터/전송 시뮬레이션 사용.

- 기존 미구현 17개를 React/Vue 패키지에 추가하고 커스텀 Select도 제공. React 카탈로그 65개 전체 실행 예제와 Vue 통합 예제 연결.
- 골드 포커스, 공통 Select 팝업, 체크박스의 둥근 형태·부분 선택 표시. 갈색·빨강·초록 하드코딩을 제거하고 상태 의미는 텍스트/ARIA로 유지.
- 트리의 문자 화살표를 Lucide SVG로 바꾸고 폴더/문서 아이콘 추가. 달력 화살표·체크 표시도 같은 아이콘 체계 적용.
- 기존 CHEESE 마크와 동일한 SVG 파비콘을 React/Vue 문서에 적용.
- 선택·검색·IME·폼 제출/초기화·기간 검증·메뉴·패널·캐러셀·모바일 회귀 테스트와 새 API 소비자 타입 검사 추가.
- Color Picker는 브랜드 스와치, Listbox/Combobox는 단일 선택, 시간 범위는 같은 날, Carousel은 수동 이동으로 제공 범위를 명시.

### 수정

- Vue 배포 타입의 내부 제네릭 누출을 줄이고 기반 컴포넌트 타입을 명시. 소비자 검사에 필요한 누락 의존성 포함.
- React DatePicker의 비활성 제출 제외, 필수값·범위 검증, 오류 연결·포커스, 읽기 전용, uncontrolled 초기화 및 외부 form 지원.
- React의 패키지 진입점에 client boundary를 명시. 전체 Next/Nuxt 호환성을 인증하는 변경은 아님.
- CSS tarball에 Pretendard 원문 라이선스 포함.
- React/Vue ContextMenu의 Shift+F10 처리 보강. React Card ref와 Vue 스타일 래퍼의 ref 전달 수정.

### 검증/문서

- 실제 tarball을 저장소 외부에 설치해 React 18/19 + Vue 타입·SSR·제품 번들 검사.
- Chromium, Firefox, WebKit 회귀 검사와 브라우저별 스크린샷 증거 분리.
- 운영 도입의 우선순위, 책임 범위, 완료 기준을 문서 사이트와 별도 체크리스트에 명시.

### 도입 시 확인

- `DatePicker value={null}`은 제어된 빈 값이고, `value` 생략은 비제어 모드입니다.
- 제어 모드의 reset은 폼 `onReset`에서 부모 상태를 복원하세요.
- disabled 날짜는 FormData에서 제외됩니다. 기존에 제출되던 동작은 수정 대상 버그입니다.
- 브라우저 기본 검증을 사용하지 않을 경우 폼에 `noValidate`를 지정하고 `error`를 직접 전달하세요. 서버 검증은 별도로 필요합니다.
- 전체 지원/호환성 확대가 완료되기 전까지 0.x 도입 범위를 제한하고, 정확한 버전 또는 커밋을 고정하세요.

## 0.2.0 — 패키지 기반 문서

- 문서 사이트를 실제 패키지 기반으로 전환. React 47개 실행 예제와 Vue 통합 페이지, 토큰·CSS 단일화, Calendar와 Tree, 접근성 검사, 빌드 결과만 Pages 배포.
