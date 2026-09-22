# 0.1 → 0.2 전환

이 릴리스는 실험용 HTML 데모를 실제 라이브러리 소비 구조로 바꾸는 사전 릴리스입니다.

- root app.js/components.css/docs.css/extras.css/tokens.css를 제거했습니다. git 이력에서 복구할 수 있습니다.
- CSS는 `@cheese/css` 한 번만 import하세요. root CSS 파일 경로는 더 이상 사용하지 않습니다.
- `export * from radix-ui/reka-ui` 대신 명시적인 CHEESE export 또는 `Primitives` namespace를 사용하세요.
- React 아이콘 Calendar는 CalendarIcon으로 이름을 분리했습니다.
- Vue는 3.5 이상 필요합니다(useId 기반 SSR-safe field IDs).
- Field는 단일 입력 자식을 요구합니다. React는 input/select/textarea 컴포넌트를 직접 자식으로 넣으세요.
- Vue Textarea/NativeSelect에도 v-model을 지원합니다.
- Dialog는 제목과 설명을 넣으세요. 이미 서버가 내려준 권한은 UI뿐 아니라 서버에서도 검사해야 합니다.
- Tree는 한 개의 Tab 진입점과 방향키 탐색을 제공합니다. 노드 id는 고유하고 안정적이어야 합니다.
- Tree의 행 클릭은 선택만, caret 클릭/방향키는 펼침을 담당합니다.
- Number/Date/Time Field는 Input을 조합한 네이티브 입력 패턴입니다. 자체 캘린더 위젯이 아닙니다.

React의 고수준 Checkbox/Switch와 Vue의 Root/Indicator 조합 API는 다릅니다.
별도 Vue 통합 예제를 실제 사용 코드로 참고하세요.
