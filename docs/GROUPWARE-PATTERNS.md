# 그룹웨어 업무 패턴

이 문서는 CHEESE 유지보수자와 제품 개발자를 위한 설계·적용 기준입니다.
공통 패턴은 인사평가, 직원 관리, 오디션 지원자 관리처럼 서로 다른 업무에서
반복되는 화면 구조와 상호작용을 묶습니다.

## 구성 계층

`토큰 → 기본 컴포넌트 → 업무 패턴 → 제품 화면`

| 계층          | 책임                                              | 예시                                        |
| ------------- | ------------------------------------------------- | ------------------------------------------- |
| 토큰          | 색상, 글꼴, 간격, 크기의 공통 기준                | 의미별 색상과 여백                          |
| 기본 컴포넌트 | 개별 입력·표시·탐색 동작                          | Button, SearchInput, MultiSelect, DataTable |
| 업무 패턴     | 여러 기본 컴포넌트로 만드는 반복 가능한 업무 구조 | AppShell, PeoplePicker, FilterBar           |
| 제품 화면     | 업무 규칙, 데이터, 권한, 저장·이동 정책           | 평가 작성, 직원 목록, 지원자 심사           |

공유 스타일은 `@cheese/css`와 토큰을 사용합니다. 특정 제품 이름, 조직 구조,
API 주소나 권한 규칙을 공통 패턴 안에 고정하지 않습니다. 제품 예제는 패키지의
공개 컴포넌트를 조합하고, 제품에서만 필요한 판단은 해당 화면에 둡니다.

## 공개 패턴 7종

AppShell의 페이지 제목과 주요 동작은 보조 컴포넌트 PageHeader로 구성합니다.
PageHeader는 별도 업무 패턴으로 집계하지 않습니다.

| 패턴                  | 공통 책임                                          | 제품이 연결할 내용                                | React 데모 경로                         |
| --------------------- | -------------------------------------------------- | ------------------------------------------------- | --------------------------------------- |
| AppShell + PageHeader | 앱 탐색·본문 영역, 페이지 제목·설명·주요 동작 배치 | 메뉴 구성, 현재 경로, 사용자 정보, 이동 처리      | `#/business-patterns/app-shell`         |
| PeoplePicker          | 사람을 찾고 선택하는 입력 구조                     | 후보 데이터, 검색 범위, 식별자, 선택 가능 여부    | `#/business-patterns/people-picker`     |
| FilterBar             | 검색·조건 입력과 초기화 동작 배치                  | 필터 값, 조회 실행, URL 복원, 페이지 초기화       | `#/business-patterns/filter-bar`        |
| BulkActionBar         | 선택한 항목 수와 일괄 동작 표시                    | 선택 상태, 권한, 확인 절차, 실제 일괄 처리        | `#/business-patterns/bulk-action-bar`   |
| DescriptionList       | 항목명과 값을 의미에 맞게 표시                     | 항목 구성, 빈 값 문구, 날짜·숫자 형식             | `#/business-patterns/description-list`  |
| ActivityTimeline      | 활동의 순서·내용·수행자·시각 표시                  | 이력 데이터, 정렬, 상태 의미, 공개 범위           | `#/business-patterns/activity-timeline` |
| SaveStatus            | 저장 상태 표시와 재시도 요청                       | 변경 감지, 저장 실행, 성공·실패 판단, 재시도 처리 | `#/business-patterns/save-status`       |

전체 React 갤러리는 `#/business-patterns`, Vue 통합 예제는
`vue.html?demo=patterns`에서 확인합니다. 위 경로는 문서 사이트 기준입니다.

## React·Vue 대응 기준

두 프레임워크에서 같은 패턴 이름과 업무 책임을 유지합니다. 값 변경은 React의
prop·callback, Vue의 prop·event 또는 `v-model`처럼 각 프레임워크의 관례로
연결합니다. 콘텐츠를 전달할 때도 React의 children·prop과 Vue의 slot을 사용합니다.
실제 지원하는 prop과 event는 각 패키지의 공개 API에서 확인합니다.

동등성 검토는 이름뿐 아니라 표시 상태, 선택·해제, 비활성화, 키보드 조작,
접근 가능한 이름, 좁은 화면에서의 배치를 함께 비교합니다. 한쪽에 새 동작이나
상태를 추가하면 다른 쪽의 계약과 데모에도 반영합니다. 이 문서는 전체 컴포넌트
카탈로그의 React·Vue API가 모두 동일하다는 의미는 아닙니다.

공개 진입점: [React](../packages/react/src/index.tsx),
[Vue](../packages/vue/src/index.ts).
구현 예시: [Vue PageHeader](../packages/vue/src/patterns/PageHeader.vue),
[DescriptionList](../packages/vue/src/patterns/DescriptionList.vue),
[ActivityTimeline](../packages/vue/src/patterns/ActivityTimeline.vue),
[SaveStatus](../packages/vue/src/patterns/SaveStatus.vue).

## 저장 상태와 제품 정책

SaveStatus는 소비 화면이 전달한 `idle`, `dirty`, `saving`, `saved`, `error`
상태를 보여줍니다. 실패 상태의 재시도 동작은 소비 화면에 요청을 전달합니다.
화면은 실제 저장 결과에 따라 상태를 다시 갱신해야 합니다.

자동 저장, 영속 임시저장, 변경 여부 감지, 저장 요청 중복 방지, 버전 충돌 해결,
미저장 변경의 페이지 이탈 확인은 소비 제품의 책임입니다. `dirty` 표시가
이동을 막거나 입력값을 보존하지는 않습니다. 저장·오류·이탈 확인을 연결하는
구체적인 예제와 제한은 [업무 흐름 패턴](WORKFLOW-PATTERNS.md)을 참고합니다.

## 서비스 적용 원칙

이 저장소는 특정 회사의 업무 절차를 가정한 완성 제품 화면을 제공하지 않습니다.
새 요구는 먼저 기본 컴포넌트와 기존 패턴으로 구성하고, 실제 데이터 원천과 권한,
저장·오류 복구·감사·보존 정책은 도입하는 서비스에서 연결합니다. 여러 서비스에서
같은 책임이 반복된다는 근거가 생긴 뒤에만 공통 패턴의 계약을 확장합니다.

## 회귀 검사

- `tests/groupware-patterns.spec.ts`: React/Vue 선택 적용·취소, 필터 초기화,
  일괄 처리 재시도, 저장 상태, 문서 탐색, 열린 선택기의 접근성·반응형 검사.
- `tests/groupware-products.spec.ts`: 직원 검색·수정·일괄 상태 변경,
  지원서 자료 보완·부분 실패·재시도, 상세 화면 및 320px 레이아웃 검사.
- `tests/evaluation-product-demo.spec.ts`: 기존 평가 흐름과 임시저장·복원·초기화 검사.
- `tests/consumer/`: workspace 밖에서 설치한 React/Vue 패키지의 공개 패턴 소비 검사.

자동 검사는 실사용 권한 정책, 실제 API 장애, 보조 기술·현업 사용자 검증을 대체하지 않습니다.
