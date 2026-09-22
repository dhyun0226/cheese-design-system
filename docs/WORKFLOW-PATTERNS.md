# 업무 목록에서 저장과 복구까지

2026-09-22의 [전체 점검](FULL-AUDIT-2026-09-22.md) 후속 구현입니다.
카탈로그는 69개에서 **72개의 React 실행 예제**로 늘었습니다. 이 숫자는
독립적인 공개 export 수나 React/Vue 지원 동등성을 뜻하지 않습니다.

이번에는 SearchInput·ErrorSummary·AttachmentList를 양쪽 패키지에 추가하고,
DataTable을 외부 query로 제어하도록 확장했습니다. 이를 실제로 연결한
[React 업무 흐름](https://dhyun0226.github.io/cheese-design-system/#/workflows)과
[Vue 업무 흐름](https://dhyun0226.github.io/cheese-design-system/workflow-vue.html)을 제공합니다.
로컬에서도 `#/workflows`, `workflow-vue.html`로 확인합니다.

## 연결한 흐름

1. 검색·정렬·페이지·페이지 크기·상태 필터를 URL에 반영하고 새로고침 시 복원합니다.
2. 목록에서 업무를 열면 현재 값으로 수정 폼을 구성하고 첫 입력으로 이동합니다.
3. 필수값·날짜 오류가 있으면 ErrorSummary에 포커스하고 오류 링크로 해당 입력에 이동합니다.
4. 서버의 필드 오류와 전체 저장 실패를 구분합니다. 입력값을 보존하고 저장 중 중복 실행을 막습니다.
5. 첫 저장 실패 뒤 다시 저장할 수 있습니다. 성공 뒤에만 목록의 레코드를 바꾸고 완료 제목에 포커스합니다.
6. 목록으로 돌아가면 검색 조건을 유지합니다. 바뀐 데이터가 조건에서 벗어나면 현재 필터 결과에서 제외될 수 있습니다.

업무명을 `중복 평가`로 입력하면 서버 필드 오류를 재현합니다. 체험 안내의
저장 응답을 바꾸면 첫 실패 후 재시도와 정상 저장을 비교할 수 있습니다.
수정 취소 시 미저장 변경이 있으면 확인 Dialog를 거칩니다. React 문서 안에서
다른 메뉴로 이동하거나 브라우저 뒤로 가기를 해도 이동 확인 Dialog가 열립니다.
React·Vue 모두 수정 중 새로고침·탭 닫기·다른 문서 이동에는 브라우저 기본
이탈 확인을 사용합니다. 저장을 완료하거나 변경값을 원래대로 돌리면 확인이
나오지 않습니다.

예제는 메모리 안에서 동작합니다. URL에는 목록 조건만 저장하며 새로고침하면
수정 내용과 첨부 삭제는 초기 상태로 돌아갑니다. 이탈 확인은 입력 유실을
경고할 뿐 영속 임시저장을 제공하지 않으며, 브라우저 기본 확인창의 문구는
브라우저가 정합니다. 실제 앱 라우터에서는 같은 정책을 라우터 guard에도
연결해야 합니다.
실제 서버의 인증·중복 저장 방지 키·충돌 버전 처리도 별도 연결 대상입니다.

구현 위치:

- React: [`site/WorkflowDemo.tsx`](../site/WorkflowDemo.tsx)
- Vue: [`site/VueWorkflowDemo.vue`](../site/VueWorkflowDemo.vue)
- 가상 데이터·검증·URL 변환·응답: [`site/workflow-demo.ts`](../site/workflow-demo.ts)

## 검색 입력과 선택 입력의 구분

| 목적                                  | 사용할 구성요소 | 값                     |
| ------------------------------------- | --------------- | ---------------------- |
| 제목·이름 같은 검색어를 자유롭게 입력 | SearchInput     | 문자열                 |
| 준비된 항목을 검색하여 하나 선택      | Combobox        | 선택한 항목의 value    |
| 서버에서 항목을 검색하여 하나 선택    | AsyncCombobox   | ChoiceOption 또는 null |
| 담당자·평가자를 여러 명 선택          | MultiSelect     | ChoiceOption 배열      |

SearchInput은 돋보기, 지우기, Enter 검색, 설명·오류 연결과 한글 조합 처리를
제공합니다. 검색 콜백이 없으면 일반 form 제출이 유지됩니다. 콜백이 있으면
Enter 검색이 form 제출을 대신합니다. 지우기는 값 변경만 알리며 자동 조회 여부는
사용하는 화면이 정합니다. debounce·서버 결과·로딩·실패 UI는 검색 입력의 책임에
포함하지 않습니다. DataTable은 이 입력을 사용하면서 조회와 지연 처리를 담당합니다.

```tsx
// React: 자유 검색어와 실제 검색 실행을 분리합니다.
const [search, setSearch] = useState("");
<SearchInput
  label="업무 검색"
  value={search}
  onValueChange={setSearch}
  onSearch={(value) =>
    setQuery((previous) => ({ ...previous, page: 1, search: value }))
  }
/>;
```

```vue
<!-- Vue: search와 query는 부모의 ref 상태입니다. -->
<SearchInput
  v-model="search"
  label="업무 검색"
  @search="(value) => (query = { ...query, page: 1, search: value })"
/>
```

## 목록 조건의 소유권

`TableQuery`는 `{page, pageSize, search, sort}`이며 sort는
`null | {key, direction: 'asc' | 'desc'}`입니다. 페이지는 1부터 시작합니다.
React는 `query/onQueryChange`, Vue는 `v-model:query`를 사용합니다.

```tsx
const [query, setQuery] = useState<TableQuery>(restoredQuery);
<DataTable
  label="평가 업무"
  rows={records}
  columns={columns}
  getRowId={(row) => row.id}
  query={query}
  onQueryChange={setQuery}
/>;
```

```vue
<DataTable
  v-model:query="query"
  label="평가 업무"
  :rows="records"
  :columns="columns"
  :get-row-id="(row) => String(row.id)"
/>
```

제어 모드에서는 부모가 반영한 query가 기준입니다. 값 변경 제안을 거절하거나
정규화할 수 있습니다. 비제어 모드는 `defaultQuery`로 최초 조건을 지정하며
이후 prop 변경으로 현재 조건을 덮어쓰지 않습니다. 기존 `defaultPageSize`도 유지합니다.
둘 다 지정하면 `defaultQuery`가 우선합니다. 부모는 React state 또는 Vue ref로
query 객체를 보관하세요. 새 query 객체를 전달하면 입력 중인 검색어도 해당 값으로
동기화하며, 이를 조건 초기화에 사용합니다. 매 렌더마다 inline 객체를 새로 만들면
입력 중인 검색어를 의도치 않게 초기화할 수 있습니다. 같은 의미의 query는 중복
조회나 변경 알림을 발생시키지 않습니다. 제어 모드의 외부 변경은 재통지하지 않고,
비제어 모드의 최초 값 알림은 기존 계약대로 유지합니다.

DataTable이 URL을 직접 수정하지는 않습니다. 예제의 앱이 `work-page`,
`work-size`, `work-search`, `work-sort`, `work-order`, `work-status`를 읽고 쓰며,
허용된 정렬 열과 상태, 양의 정수를 검증합니다. 다른 URL 매개변수는 보존합니다.
업무별 상태 필터는 DataTable 밖에서 관리합니다. 서버 모드라면 검증된 query와
별도 필터를 실제 `loadRows(query, {signal})`에 연결해야 합니다.

## 오류 요약의 포커스 계약

오류 항목은 `{id, message, targetId?}`입니다. `id`는 안정적인 항목 키,
`targetId`는 보이는 입력·트리거 또는 이를 포함한 컨테이너의 DOM id입니다.
연결 대상을 지정하지 않은 전체 저장 오류는 클릭할 수 없는 문구로 표시합니다.

```tsx
const summary = useRef<HTMLDivElement>(null);
<ErrorSummary ref={summary} errors={errors} />;
// 실패 상태가 렌더링된 뒤에만 호출합니다.
summary.current?.focus();
```

```vue
<script setup lang="ts">
import { nextTick, ref } from "vue";
import { ErrorSummary, type ErrorSummaryItem } from "@cheese/vue";
const summary = ref<{ focus: () => void }>();
const errors = ref<ErrorSummaryItem[]>([]);
async function showErrors(next: ErrorSummaryItem[]) {
  errors.value = next;
  await nextTick();
  summary.value?.focus();
}
</script>
<template><ErrorSummary ref="summary" :errors="errors" /></template>
```

오류 갱신만으로 포커스를 옮기지 않습니다. 실패한 제출이라는 맥락은 폼이 알고
있으므로 호출 시점도 폼에서 정합니다. 링크는 숨겨진 제출용 proxy를 건너뛰고
보이는 컨트롤에 포커스합니다. 사용자 정의 복합 입력은 React `onNavigate` /
Vue `@navigate`의 취소 가능한 이벤트에 `preventDefault()`를 호출한 뒤 직접
포커스할 수 있습니다. 인라인 오류와 오류 요약은 같은 검증 결과에서 구성합니다.

## 저장된 첨부파일의 소유권

FileUpload는 새 파일의 전송 큐입니다. AttachmentList는 이미 저장된 파일의
`{id, name, size, href?}`를 표시하며 `size`는 바이트입니다. 실제 `href`가 있을
때만 다운로드 링크를 제공합니다. 예제의 `./sample-evaluation.txt`는 실제
정적 파일이고, 삭제는 메모리 상태로 재현합니다.

React의 `onRemove`와 Vue의 `remove`는 같은 Promise 기반 계약입니다.
콜백이 없으면 삭제 버튼도 표시하지 않습니다.

```tsx
const removeFile: AttachmentRemoveHandler = async (item, { signal }) => {
  const response = await fetch(`/api/files/${encodeURIComponent(item.id)}`, {
    method: "DELETE",
    signal,
  });
  if (!response.ok) throw new Error("파일을 삭제하지 못했습니다.");
  if (!signal.aborted)
    setItems((previous) => previous.filter((file) => file.id !== item.id));
};
<AttachmentList label="첨부자료" items={items} onRemove={removeFile} />;
```

```vue
<!-- 같은 비동기 함수에서 성공 후 items.value를 갱신합니다. -->
<AttachmentList label="첨부자료" :items="items" :remove="removeFile" />
```

컴포넌트는 같은 파일의 중복 삭제 요청을 막고 오류·재시도를 표시합니다. 항목이
제거되거나 삭제 기능이 해제되거나 언마운트되면 AbortSignal을 취소합니다.
소비자는 이를 요청에 전달하고 취소된 작업의 늦은 완료가 다른 레코드를 바꾸지
않게 해야 합니다. 삭제 버튼에 있던 포커스는 부모가 해당 항목을 제거하면
다음 파일의 동작 또는 목록 제목으로 이동합니다.

권한 확인, 삭제 전 확인 Dialog, 서버의 영속 삭제·보존 정책, 다운로드 URL의
발급과 만료는 사용하는 업무 화면의 책임입니다. 콜백 성공만으로 items를 임의로
제거하지 않으므로 서버 결과와 화면 데이터가 일치하도록 부모가 갱신해야 합니다.

## 더 필요한 구성요소를 고르는 기준

72개가 모든 업무를 충족한다는 의미는 아닙니다. 다음 화면에서 실제로 필요한
계약과 이미 있는 컴포넌트를 구분해 순서를 정합니다.

| 과제                           | 현재 있는 기반                           | 추가할 조건과 범위                                                    |
| ------------------------------ | ---------------------------------------- | --------------------------------------------------------------------- |
| 사용하는 프레임워크의 API 차이 | React·Vue 기본 입력과 이번 3종           | Vue를 채택하면 Stepper·Alert 등 실제 사용할 고수준 API 격차부터 확인  |
| 조직·직급 계층 선택            | Tree, Combobox, MultiSelect              | 하위 조직 포함·다중 선택·부분 선택 규칙이 필요할 때 TreeSelect        |
| 금액·통화·비율 입력            | NumberField                              | 통화 단위·소수 정밀도·표시 포맷·반올림 규칙을 합의한 뒤 전용 입력     |
| 주소 검색·입력                 | SearchInput, AsyncCombobox, Input        | 주소 제공자·우편번호·상세주소·국가별 형식 계약을 연결                 |
| 결재선·승인 이력               | Stepper, Timeline, Avatar, Dialog, Table | 순차·병렬 승인·대결·반려·권한을 정한 업무 패턴으로 구성               |
| 대용량 목록                    | DataTable 서버 검색·페이지 처리          | 실제 행 수·렌더 비용을 측정한 뒤 가상화·열 고정·크기 조절을 각각 결정 |
| 장시간 작성·여러 사용자 수정   | 이번 저장 실패 복구와 취소 확인          | 영속 임시저장·라우터 이탈 확인·버전 충돌·서버 멱등성 연결             |

일반 빈 상태, 로딩, 알림을 위해 이름만 다른 컴포넌트를 추가할 필요는 없습니다.
EmptyState·Skeleton·Progress·Alert·Toast와 기존 레이아웃을 조합하고 해당
프레임워크의 export 지원 여부를 먼저 확인합니다.

## 검증 기록

- 최종 `npm run check`: **통과**, exit code 0.
- 패키지·문서 빌드, React/Vue와 사이트 타입 검사, 카탈로그 **72/72** 통과.
- 단위 검사 **29/29** 통과. 실패·취소·건너뜀 없음.
- 독립 tarball 소비자: React **18/19**와 Vue **3.5.43**의 설치·타입·SSR·제품 번들 통과.
  새 컴포넌트 API·ref·이벤트 및 DataTable의 초기 제어 query도 소비자 검사에 포함했다.
- Chromium·Firefox·WebKit 브라우저 검사 **1,122/1,122** 통과, 7.8분.
  SearchInput 60건, ErrorSummary 30건, AttachmentList 42건,
  DataTable query 54건, 연결된 업무 흐름 42건 및 기존 회귀를 포함한다.
- 토큰 생성 결과 검사와 `git diff --check` 통과.
- 1440/390/320px에서 React 9개·Vue 10개 상태와 신규 카탈로그 3개 페이지를 확인했다.
  JavaScript 오류와 문서 가로 넘침이 없으며 오류 요약·삭제 후 포커스 복원을 확인했다.
  실제 모바일 기기·보조 기술·회사 API·대용량 데이터 검증을 대신하지는 않는다.

초기 대상 검사에서 발견한 Vue 첨부 삭제 포커스 결함을 수정했다. Firefox의
한글 fill 이벤트, WebKit 다운로드 파일명의 유니코드 정규화, 같은 hash로 재이동할 때의
문서 재사용, Dialog 진입 애니메이션 중 대비 측정은 실제 브라우저 동작을 확인하고
테스트 전제를 보정했다. 관련 기대 동작과 다운로드 본문 검사는 유지했다.
위 수치는 이 수정들을 모두 포함한 최종 전체 실행 결과다.

로컬 자료는 Git에 포함하지 않는다:

- `artifacts/workflow-final-check.log`: 최종 통합 검사 로그
- `artifacts/workflow-visual-review.md`: 시각 검토 범위와 결과
- `artifacts/workflow-react-*.png`, `artifacts/workflow-vue-*.png`: 상태별 캡처
- `artifacts/workflow-catalog-new-components/`: 새 3개 예제·포커스 캡처

원격 검증·배포는 해당 커밋의 [GitHub Actions](https://github.com/dhyun0226/cheese-design-system/actions/workflows/pages.yml)를 확인한다.
