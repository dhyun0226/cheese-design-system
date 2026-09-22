# 업무 컴포넌트와 실제 API 연결

React는 `@cheese/react`, Vue는 `@cheese/vue`에서 검색·선택·목록·업로드·오류 요약·기존 첨부 관리와 전송 helper/type을 제공합니다. 스타일은 `@cheese/css`입니다. 사이트 예제는 가상 직원과 메모리 내 응답/전송 시뮬레이션입니다. 업로드는 외부로 전송하지 않으며 AttachmentList의 안내 파일은 실제 정적 파일을 내려받습니다.

## 검색어 입력

`SearchInput`은 자유롭게 입력한 문자열로 검색합니다. 돋보기, 값 지우기, 레이블, 설명·오류 연결을 포함합니다. 항목을 골라 ID를 저장하려면 `Combobox`, 서버에서 선택지를 받아야 하면 `AsyncCombobox`를 사용하세요.

```tsx
<SearchInput
  label="평가 업무 검색"
  name="q"
  value={search}
  onValueChange={setSearch}
  onSearch={runSearch}
/>
```

Vue는 `v-model="search"`, `@search="runSearch"`입니다. `onSearch`/`@search`를 지정하면 Enter는 검색 콜백을 실행하고 상위 form의 암묵적 제출을 막습니다. 콜백이 없으면 일반 검색 input의 form 제출을 유지합니다. 한글 조합 중 Enter는 검색하지 않습니다. 값이 있는 편집 가능한 입력에서 Escape 또는 지우기 버튼을 누르면 값만 지우고 입력에 포커스를 유지합니다. 지우기 자체가 검색 요청을 실행하지는 않습니다.

자동 검색의 debounce·서버 요청 취소·로딩·결과 표시는 소비자가 담당합니다. `DataTable`은 검색 지연과 조회 상태를 자체 제공하며 내부 검색창도 SearchInput을 사용합니다. 제어 모드의 form reset은 부모가 값을 복원합니다. 비제어 모드는 `defaultValue`로 돌아갑니다.

## 서버 검색 / 다중 선택

`AsyncCombobox`는 한 개의 `ChoiceOption | null`, `MultiSelect`는 `ChoiceOption[]`을 사용합니다. 객체는 `{value, label, description?, disabled?}`입니다. React는 `value/defaultValue/onValueChange`, Vue는 `v-model/defaultValue`입니다. 이름은 표시용, `value`는 안정적인 서버 ID로 사용하세요.

```tsx
import { AsyncCombobox, MultiSelect, createOptionsLoader } from '@cheese/react';

// 컴포넌트 밖에서 선언하거나 useCallback으로 함수 참조를 유지합니다.
const loadEmployees = createOptionsLoader('/api/employees');
// GET /api/employees?q=... -> [{ value: '42', label: '가상 직원' }]

<AsyncCombobox label="담당자" loadOptions={loadEmployees} name="ownerId" required />
<MultiSelect label="평가자" loadOptions={loadEmployees} name="reviewerIds" max={10} />
```

응답 구조가 다르면 `loadOptions(query, {signal})` 함수를 직접 작성합니다. `fetch`에 signal을 전달하세요. 컴포넌트는 기본 250ms debounce, 요청 취소, 취소를 무시하는 어댑터의 늦은 응답 차단, 로딩·빈 결과·실패·재시도·IME를 처리합니다. 서버는 결과 수를 제한해야 합니다. 무한 스크롤/가상화는 제공하지 않습니다.

다중 선택은 방향키+Enter, 태그 삭제 버튼, 빈 입력에서 Backspace를 지원합니다. 이름이 있는 선택은 반복된 hidden input으로 제출되므로 `FormData.getAll('reviewerIds')`를 사용하세요. disabled는 제출에서 제외됩니다. 폼 reset은 defaultValue로 복원하며 제어 모드에서는 콜백/v-model 변경을 부모가 반영해야 합니다.

## Data Table

`rows`는 로컬 검색/정렬/페이지 처리, `loadRows(query, {signal})`는 서버 모드입니다. 동시에 지정하면 서버 모드가 우선입니다.

```tsx
import { DataTable, type RowsLoader } from "@cheese/react";
const loadRows: RowsLoader = async (query, { signal }) => {
  const response = await fetch("/api/evaluations/search", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!response.ok) throw new Error("목록 조회 실패");
  return response.json(); // { rows: [{id:'42',name:'가상 직원'}], total: 120 }
};
<DataTable
  label="평가 대상자"
  columns={[{ key: "name", label: "이름" }]}
  loadRows={loadRows}
  getRowId={(row) => String(row.id)}
/>;
```

query는 `{page, pageSize, search, sort: null | {key, direction:'asc'|'desc'}}`이며 page는 1부터 시작합니다. 서버는 열 이름을 허용 목록으로 검증하고 사용자 권한 범위에서 필터링한 total을 반환해야 합니다. 클라이언트가 보낸 sort key를 SQL에 직접 넣지 마세요. 정렬 버튼은 오름차순→내림차순→기본 순으로 순환합니다.

- React `query/onQueryChange`, Vue `v-model:query`로 검색·정렬·페이지·페이지 크기를 함께 제어합니다. 이벤트는 변경 제안이며 부모가 반영한 query가 실제 표시와 요청의 기준입니다.
- 비제어 모드는 `defaultQuery`로 초기 조건을 지정합니다. `defaultQuery`가 없으면 `defaultPageSize`와 빈 검색·첫 페이지로 시작합니다. `defaultQuery`의 나중 변경은 현재 상태를 덮어쓰지 않습니다.
- URL 저장·파싱·허용값 검증·뒤로 가기 복원은 앱이 담당합니다. 조직/상태 같은 별도 업무 필터도 앱 상태로 관리하고 바뀌면 query의 page를 1로 되돌립니다. [연결된 예제](WORKFLOW-PATTERNS.md)에서 React/Vue 구현을 확인하세요.

- 안정적이고 고유한 `getRowId`가 필수입니다. 배열 인덱스는 사용하지 마세요.
- 행 선택은 페이지를 넘어 유지됩니다. 헤더 체크박스는 **현재 페이지의 선택 가능한 행**만 처리합니다. 모든 검색 결과에 대한 일괄 선택이 아닙니다.
- React `selected/onSelectedChange`, Vue `v-model:selected`로 서버 ID를 전달받습니다. UI 선택이 작업 권한을 보장하지 않습니다.
- `isRowSelectable`로 선택 불가 행을 지정할 수 있습니다.
- 열 표시, 고정 헤더, 가로 스크롤, 로딩/실패/빈 상태, 페이지 크기를 제공합니다.
- React `renderCell(row,column)`, Vue `#cell="{row,column}"`로 Badge/Button 등 실제 CHEESE 컴포넌트를 조합합니다. 문자열은 기본적으로 안전하게 렌더링됩니다.
- 셀 편집·열 크기 조절·다중 열 정렬·트리 그리드·가상화는 제공하지 않습니다. 서버 페이지 이동으로 범위를 제한하고 실제 데이터 규모를 측정한 뒤 필요 기능을 추가하세요.

## File Upload

```tsx
import { FileUpload, createXHRUpload } from "@cheese/react";
const upload = createXHRUpload("/api/files", { fieldName: "file" });
<FileUpload
  label="첨부자료"
  upload={upload}
  accept=".pdf,image/*"
  maxSize={10 * 1024 * 1024}
  maxFiles={5}
  onComplete={(item) => console.log(item.result)}
/>;
```

`createXHRUpload`는 multipart POST를 전송하고 2xx 응답만 성공으로 처리합니다. Content-Type boundary는 브라우저가 만듭니다. 응답은 `responseText`로 반환합니다. API 키를 브라우저에 하드코딩하지 마세요. 쿠키 인증의 CSRF, 교차 출처 CORS/credentials 정책은 서버와 합의해야 합니다.

다른 프로토콜은 `upload(file, {signal,onProgress}) => Promise<unknown>`로 연결합니다. 사전 서명 URL, S3 multipart/재개, 악성 파일 검사, 영속 첨부 ID 저장은 해당 서버의 계약이 필요하며 이 저장소가 서버를 제공하지는 않습니다.

- 파일 선택·드래그 추가. 형식/크기/개수/동일 이름·크기·수정시간 중복 검사.
- **명시적 업로드 버튼**으로 시작. 대기→전송→성공/실패/취소 상태, 진행률, 실패/취소 후 재시도.
- 취소/삭제/언마운트 시 abort. 이를 무시한 어댑터의 늦은 진행률/응답도 무시합니다.
- 성공은 요청 완료 이후입니다. 전송 바이트가 100%여도 서버 응답 전에는 99% 이하로 표시합니다.
- `onChange`/Vue `change`로 큐, `onComplete`/Vue `complete`로 파일별 결과를 받습니다.
- 성공 파일의 **삭제 버튼은 목록에서만 제거**합니다. 서버 삭제나 업로드 후 저장 취소가 아닙니다.
- form reset은 큐를 비우고 진행 중 전송을 취소합니다. 파일 자체를 hidden input으로 폼에 제출하지 않습니다. 성공한 첨부 ID를 업무 API에 따로 저장하세요.
- 파일 형식은 확장자/MIME 힌트에 불과합니다. 서버에서 권한·실제 파일 내용·크기·악성 코드·보존/삭제 정책을 검증해야 합니다.

## 오류 요약과 저장된 첨부

`ErrorSummary`는 `errors: {id, message, targetId?}[]`를 받습니다. 제출 실패 뒤 React의 DOM ref 또는 Vue의 노출된 `focus()`로 요약에 포커스합니다. `targetId`가 있는 항목은 해당 입력 또는 그 컨테이너의 보이는 조작 요소로 이동하고, 없는 항목은 전체 저장 오류처럼 문구로 표시합니다. 숨겨진 form proxy는 건너뜁니다. React `onNavigate(item,event)` / Vue `@navigate`에서 `event.preventDefault()`를 호출하면 사용자 정의 복합 입력의 이동을 직접 처리할 수 있습니다. 컴포넌트는 입력값이나 서버 검증을 대신하지 않습니다.

`AttachmentList`는 업로드가 끝나 저장된 `{id, name, size, href?}` 배열을 보여줍니다. `size`는 바이트, `id`는 안정적이고 고유한 파일 ID입니다. 실제 `href`가 있을 때 다운로드 링크를 렌더링합니다. React `onRemove(item,{signal})`, Vue `:remove="removeFile"`은 Promise를 반환하는 삭제 함수입니다. 성공 뒤 부모가 `items`에서 항목을 제거해야 하며 콜백이 없으면 삭제 버튼도 없습니다.

삭제 중에는 같은 파일에 중복 요청을 보내지 않고 실패 메시지와 재시도를 제공합니다. 항목 제거·삭제 기능 해제·언마운트 시 signal을 취소합니다. 콜백은 signal을 전송하고 완료 후에도 취소 여부를 확인해야 합니다. 서버 삭제 권한, 확인 Dialog, 보존 정책, 인증된 다운로드 URL의 발급·갱신은 앱에서 연결합니다. FileUpload 큐의 UI 삭제와 서버의 기존 첨부 삭제는 서로 다른 계약입니다.

전체 React/Vue 흐름과 통합 예시는 [업무 흐름 패턴](WORKFLOW-PATTERNS.md)을 참고하세요.

## 검증

`tests/business.spec.ts`는 React/Vue 각각의 늦은 응답 차단·폼 제출/초기화·표 동작·XHR/FormData 계약·실패/취소/재시도를 검증합니다. 파일 바이트는 loopback 전용 `tests/upload-server.mjs`가 실제로 수신해 확인합니다. 취소 시나리오는 테스트 라우트로 격리합니다. 테스트 서버/화면은 공개 dist에 포함되지 않습니다. `tests/contracts.test.mjs`는 두 패키지의 큐/로컬 쿼리 로직을 검증합니다. 이는 회사 API의 가용성·보안·데이터 정확성 검증을 대신하지 않습니다.
