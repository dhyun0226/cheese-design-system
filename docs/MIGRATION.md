# 0.1 → 0.2 전환

## NavigationMenu 기본 동작

React/Vue `NavigationMenuRoot`의 기본 `delayDuration`은 `0`입니다. 포인터로 연 메뉴를 키보드 Escape로 닫은 뒤 지연된 hover 이벤트가 다시 여는 현상을 피하고, 클릭·키보드·포인터 전환을 일관되게 처리합니다. 직접 `delayDuration`을 지정하면 Radix/Reka의 해당 지연 동작을 사용하므로 제품에서 혼합 입력 동작도 확인하세요. 상단 메뉴의 링크와 트리거는 모두 36px이며, 팝업 안의 설명이 긴 링크는 내용에 맞게 높이가 늘어납니다.

## 최신 변경 — NativeSelect 제거 / 업무 입력

`NativeSelect` export와 컴포넌트는 제거했습니다. `<option>` 자식 대신 `Select`의 `options`에 `{ value, label, disabled? }`를 전달하세요. React는 `value/onValueChange`, Vue는 `v-model`을 사용합니다. `label`, `name`, `required`, `disabled`, `form`을 지원합니다. 기존 문서의 `#/components/native-select` 링크는 Select Form 예제로 연결됩니다.

`DateField`, `TimeField`, `NumberField`는 이제 독립 패키지 API입니다. React는 `label`, `value/defaultValue`, `onValueChange`를 사용하고 Vue는 `label`, `v-model/default-value`를 사용합니다. DateField 값은 `YYYY-MM-DD`, TimeField는 `HH:mm` 또는 초 단위 step일 때 `HH:mm:ss`, NumberField 변경 값은 빈 입력과 편집 상태를 보존하는 문자열입니다. 서버에 보내기 전 제품 스키마에서도 검증하세요. 네이티브 `onChange` 이벤트 대신 `onValueChange`로 직접 입력과 팝업 선택을 함께 처리합니다.

날짜 step은 일, 시간 step은 초입니다. 자정을 넘는 기간은 TimeRangeField가 아니라 날짜와 시간대를 포함한 제품 모델로 처리합니다. DateRangeField/TimeRangeField는 동일 입력을 조합하며 `name.start`, `name.end`로 제출합니다.

일반 Field/Input은 제품의 폼 검증 라이브러리와 조합하는 기본 입력입니다. 브라우저 검증 풍선 대신 인라인 오류를 사용하려면 폼을 `noValidate`로 두고 오류를 Field에 전달하세요. `noValidate`만 넣고 검증을 생략하면 안 됩니다.

ScrollArea는 `orientation="vertical" | "horizontal" | "both"`, `label`, `height`, `viewportProps`를 제공합니다. 일반 overflow 스킨은 `.cheese-root` 안에 적용되며 문서 스크롤은 `html.cheese-scroll-root`로 opt-in합니다. 운영체제 파일 선택창·모바일 키보드·강제 색상 모드는 대체하지 않습니다.

아래 내용은 초기 구조 전환의 기록이며, 최신 API는 위 내용과 실행 예제를 우선합니다.

이 릴리스는 실험용 HTML 데모를 실제 라이브러리 소비 구조로 바꾸는 사전 릴리스입니다.

- root app.js/components.css/docs.css/extras.css/tokens.css를 제거했습니다. git 이력에서 복구할 수 있습니다.
- CSS는 `@cheese/css` 한 번만 import하세요. root CSS 파일 경로는 더 이상 사용하지 않습니다.
- `export * from radix-ui/reka-ui` 대신 명시적인 CHEESE export 또는 `Primitives` namespace를 사용하세요.
- React 아이콘 Calendar는 CalendarIcon으로 이름을 분리했습니다.
- Vue는 3.5 이상 필요합니다(useId 기반 SSR-safe field IDs).
- Field는 단일 입력 자식을 요구합니다. React는 input/select/textarea 컴포넌트를 직접 자식으로 넣으세요.
- Vue Textarea에도 v-model을 지원합니다.
- Dialog는 제목과 설명을 넣으세요. 이미 서버가 내려준 권한은 UI뿐 아니라 서버에서도 검사해야 합니다.
- Tree는 한 개의 Tab 진입점과 방향키 탐색을 제공합니다. 노드 id는 고유하고 안정적이어야 합니다.
- Tree의 행 클릭은 선택만, caret 클릭/방향키는 펼침을 담당합니다.
- 초기 Number/Date/Time 예제는 Input 조합이었으나 현재는 독립 컴포넌트로 대체되었습니다.

React의 고수준 Checkbox/Switch와 Vue의 Root/Indicator 조합 API는 다릅니다.
별도 Vue 통합 예제를 실제 사용 코드로 참고하세요.
