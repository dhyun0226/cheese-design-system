# 업무 컴포넌트와 실제 API 연결

React는 `@cheese/react`, Vue는 `@cheese/vue`에서 네 컴포넌트와 동일한 전송 helper/type을 제공합니다. 스타일은 `@cheese/css`입니다. 사이트 예제는 가상 직원과 메모리 내 응답/전송 시뮬레이션이며 실제 파일을 전송하지 않습니다.

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

## 검증

`tests/business.spec.ts`는 React/Vue 각각의 늦은 응답 차단·폼 제출/초기화·표 동작·실제 XHR/FormData 계약·실패/취소/재시도를 검증합니다. 네트워크는 테스트 라우트로 격리됩니다. `tests/contracts.test.mjs`는 두 패키지의 큐/로컬 쿼리 로직을 검증합니다. 이는 회사 API의 가용성·보안·데이터 정확성 검증을 대신하지 않습니다.
