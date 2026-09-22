# CHEESE — 조용한 면, 명확한 상태

## 판단

기존 UI는 입력·컨테이너·테이블·선택 상태에 둘레선을 반복했고,
같은 Input도 문서 사이트 검색에서는 별도 border 색을 사용했다.
입력창은 흰색 바탕과 은은한 1px 전체 경계로 입력 위치를 표시한다.
테두리를 일괄 제거하지 않으며 하단선·그림자·바깥 링을 중복해서 쌓지 않는다.
라벨·안내 문구·충분한 간격으로 의미를 설명하고, 포커스와 오류는 별도로 표시한다.
React/Vue가 사용하는 패키지 자체에 적용하며 사이트만 다르게 꾸미지 않는다.

Apple의 깊이·계층 원칙과 Radix의 배경/경계/텍스트 역할 구분을 참고한
CHEESE의 자체 디자인이다. Apple 디자인의 복제나 공식 인증을 의미하지 않는다.
유리 질감이나 블러를 업무 화면 전반에 추가하지 않는다.

## 토큰 계약

| 역할 | 토큰 | 적용 |
| --- | --- | --- |
| 평면/약한 채움 | surface / muted / surfaceHover | 콘텐츠 바탕, 버튼, hover |
| 장식 구분 | borderSubtle | 표의 가로선, 목록, 메뉴 내부 |
| 입력 표면 | controlBg / controlBorder / controlHoverBorder | 흰색, 기본 #CECECE / hover #BBBBBB 1px 경계 |
| 입력 깊이 | shadowControl | none, 별도 하단선 없음 |
| 상태 식별 | controlEdge | 비선택 Checkbox/Radio, thumb 등 작은 조작 요소 |
| 낮은 면 | shadowCard | 카드, 독립 캘린더, 목록 선택 영역 |
| 떠 있는 면 | shadow / shadowDialog | 메뉴·팝오버와 모달의 깊이를 분리 |
| 선택 형태 | selectionIndicator | 골드 외에 체크, 날짜 밑줄, 글자 굵기, 이동한 thumb로 표시 |
| 키보드 포커스 | focus / focusContrast | 골드 링과 중립색 대비선을 함께 사용 |

radius: item 8 / control 10 / card 16 / overlay 20. 기존 token API는 보존한다.
공통 token JSON → 생성 CSS → 공통 컴포넌트 CSS → React/Vue 순서로 사용한다.
문서 사이트는 배치만 조절하며 패키지 Input의 border/height/font를 따로 덮지 않는다.

## 상태와 접근성

- 기본/hover 입력: 흰색 바탕과 1px 전체 경계. hover에서 색만 바뀌며 폭·높이는 변하지 않는다. 기본 입력은 그림자·하단선 없음.
- Input/Textarea/Select/검색/날짜/Tags에 같은 토큰을 적용한다. 읽기 전용과 비활성도 회색으로 채우지 않는다.
- 기본 경계 #CECECE는 흰색 대비 3:1에 미달한다. 고대비 설정은 지원하지만 이것이 기본 테마의 WCAG 비텍스트 대비 준수를 대신하지 않는다. 실제 제품에서 경계가 유일한 식별 단서라면 `controlBorder`를 `controlEdge` 수준 이상으로 강화하고 검증한다.
- 의미 없는 컨테이너 선은 낮은 대비여도 되지만, 비선택 Checkbox/Radio의 식별 경계는 유지한다.
- 체크/라디오 선택: 진한 둘레선 대신 골드와 검은 체크/점을 사용한다.
- Switch: 기본 둘레선과 thumb의 그림자 없음. 꺼짐은 중립색 트랙(#E5E5EA), 켜짐은 골드. thumb 위치로도 상태를 구분한다. 고대비 설정에서 식별 경계를 강화한다.
- Toggle/ToggleGroup/Toolbar: 선택 하단선 없음. 골드 배경, 글자 굵기와 ARIA 상태를 사용한다. 키보드 포커스는 별도 표시한다.
- 날짜/기간 선택: 진한 둘레선 대신 골드와 숫자 밑줄. 색만으로 상태를 전달하지 않는다.
- 포커스: 골드 단독은 흰색에서 대비가 부족하다. 입력은 중립색 border에 골드 2px outline을 간격 없이 붙인다. box-shadow 없음. Tags는 바깥 컨테이너 하나에 포커스를 표시한다. 나머지 조작 요소의 키보드 포커스는 기존 대비 보조선을 유지한다.
- 오류: 안내 문구/ARIA 유지. 입력은 중립색 전체 경계로 위치를 표시하고 포커스와도 겹친 하단선을 만들지 않는다. 알림은 시작 방향 표시선을 유지한다.
- 읽기 전용: 값은 읽고 복사할 수 있으며 조작 가능한 입력과 구분한다. Tab 포커스는 유지한다.
- 읽기 전용·비활성 경계는 한 단계 옅게 표시한다. 흰 바탕과 보조 텍스트 색, 조작 불가 커서, native disabled를 유지한다.
- prefers-contrast: more: 토큰을 바꿔 강한 경계로 전환한다.
- forced-colors: active: 사라지는 shadow 대신 시스템 border/outline을 사용한다.
- 동작 감소 설정을 유지한다. 화면 전환이나 장식용 animation을 추가하지 않는다.

이 문서는 WCAG 준수 인증이 아니다. 자동 검사 외에 NVDA/VoiceOver, 실제 기기,
200% 확대와 실제 업무 폼 시나리오 검증은 운영 도입 전에 별도로 필요하다.

## 회귀 방지

- `tests/surfaces.spec.ts`: 사이트/컴포넌트 Input 일치, 상태, 토큰 재정의,
  무테 Table, 선택 표시, overlay, forced colors, React/Vue 공유 스타일,
  NativeSelect 화살표, hover/focus 크기 고정, Tags 단일 포커스, 모션 감소.
- `tests/contracts.test.mjs`: 기본 입력의 흰색·무그림자 계약, 선택 표시·포커스 보조선의 대비 수치,
  사이트 검색의 시각 override 재도입 방지.
- 기존 전 카탈로그 접근성/상호작용 테스트 유지.
- `tests/browser.spec.ts`: 전체 카탈로그의 표시된 입력·버튼·탭·트리 등의 Pretendard 적용도 검사한다.
- 캡처 증거는 `artifacts/`. 캡처 생성 자체를 픽셀 회귀 승인으로 보지 않는다.

## 참고

- [Radix — Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale): 배경, 비대화형 경계, 대화형 경계와 텍스트의 역할 분리.
- [Radix Themes TextField](https://www.radix-ui.com/themes/docs/components/text-field): surface / soft 변형 구분. 모든 입력을 무테로 만드는 규칙이 아님.
- [SEED Text Input](https://seed-design.io/components/text-input): 약한 기본 경계와 명확한 상호작용 상태 구분.
- [Apple — Materials](https://developer.apple.com/design/human-interface-guidelines/materials): 깊이와 전경/배경 계층의 구분.
- [W3C — Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): 모든 장식선이 아닌 식별에 필요한 정보의 대비.
