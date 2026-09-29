# 그룹웨어 공통 구성 22종

기존 업무 패턴 8개 공개 컴포넌트에 화면 골격, 업무 폼, 조직·권한, 협업,
파일, 공통 상태, 데이터 작업의 구성요소 22종을 추가합니다.
모두 `@cheese/react` 또는 `@cheese/vue`의 공개 진입점에서 가져오며,
스타일은 `@cheese/css`를 사용합니다. 사이트의 데모 전용 코드를 제품에서
가져오거나 공통 컴포넌트 안에 특정 서비스의 API·업무 규칙을 넣지 않습니다.

기존 패턴의 범위와 제품 예제는 [GROUPWARE-PATTERNS.md](GROUPWARE-PATTERNS.md)를 참고합니다.

## 범위와 책임

표의 문서 ID는 React 문서 사이트의 `#/business-patterns/<id>`에 대응합니다.
Vue 실행 예제는 `vue.html?demo=foundation`에 있습니다.

| 공개 컴포넌트          | 문서 ID                    | 공통 책임                                 | 사용하는 제품의 책임                  |
| ---------------------- | -------------------------- | ----------------------------------------- | ------------------------------------- |
| ListPage               | `list-page`                | 제목·요약·필터·목록·페이지 이동 영역 배치 | 조회, 정렬, 페이지 상태               |
| DetailPage             | `detail-page`              | 상세 본문·탭·보조 정보 배치               | 대상 조회, 탭 상태, 수정 권한         |
| FormPage               | `form-page`                | 네이티브 폼과 제출·처리 중 상태 연결      | 검증, 저장, 중복 요청 정책            |
| MasterDetailLayout     | `master-detail-layout`     | 목록과 상세 영역의 반응형 배치            | 선택 항목과 라우팅                    |
| FormSection            | `form-section`             | 제목·설명·비활성화가 있는 입력 묶음       | 입력 항목과 업무 조건                 |
| FormGrid               | `form-grid`                | 1~3열 입력 배치와 좁은 화면 대응          | 항목 순서와 그룹 구성                 |
| FormActions            | `form-actions`             | 제출·취소·저장 상태 배치                  | 저장 결과, 취소·이탈 정책             |
| ReadOnlyField          | `read-only-field`          | 항목명·값·빈 값 표시                      | 날짜·숫자 형식과 표시 권한            |
| OrganizationTreeSelect | `organization-tree-select` | 조직 검색·계층 탐색·임시 선택·적용        | 조직 데이터와 선택 가능 범위          |
| PermissionMatrix       | `permission-matrix`        | 대상별 권한 초안 편집                     | 실제 권한 판정·서버 검증·저장         |
| SortableList           | `sortable-list`            | 버튼·키보드 순서 편집, 고정 항목 처리     | 순서 저장과 업무상 이동 제약          |
| NotificationCenter     | `notification-center`      | 읽음·미읽음 목록, 읽음 요청, 오류 표시    | 알림 생성·실시간 전달·읽음 저장·이동  |
| CommentComposer        | `comment-composer`         | 일반 텍스트 작성·전송 상태·실패 초안 유지 | 의견 저장과 공개 범위                 |
| CommentThread          | `comment-thread`           | 댓글·한 단계 답글·수정·삭제 확인          | 작성자 권한, 삭제 정책, 내용 저장     |
| FilePreview            | `file-preview`             | 이미지·PDF·영상과 미지원·만료·실패 상태   | 접근 가능한 URL, 갱신, 다운로드       |
| AttachmentGallery      | `attachment-gallery`       | 첨부 목록과 선택한 파일 미리보기 연결     | 파일 목록·메타데이터·접근 권한        |
| AccessDenied           | `access-denied`            | 접근 불가 사유와 후속 동작 표시           | 인증·인가 판정과 복구 경로            |
| SessionExpired         | `session-expired`          | 인증 만료 안내와 재인증 요청              | 세션 관리, 재로그인, 미저장 작업 보존 |
| PageError              | `page-error`               | 화면 오류와 재시도 표시                   | 요청 재실행과 오류 분류               |
| SavedViews             | `saved-views`              | 보기 이름·선택·저장·삭제 동작             | 필터 직렬화, 영속 저장, 공유 권한     |
| ImportWizard           | `import-wizard`            | 파일 선택·열 연결·검증·등록 결과 단계     | 파일 파싱, 데이터 검증, 실제 등록     |
| ExportDialog           | `export-dialog`            | 범위·열·형식 선택과 실행 상태             | 데이터 조회, 파일 생성·다운로드       |

이 범위에는 결재 엔진, 예약 충돌·반복 일정 엔진, 문서 변환 서버, 리치 텍스트
편집기를 포함하지 않습니다. 화면 구성요소를 조합해 제품 기능을 만들고,
반복되는 책임이 확인되면 공개 계약을 확장합니다.

## 데이터 어댑터 연결

컴포넌트는 실제 서버나 데이터베이스를 제공하지 않습니다. 제품은 콜백이나
어댑터를 연결하고, 성공한 결과를 자신의 상태에 반영합니다. 데모의 가상 데이터와
메모리 상태는 사용 예시이며 실제 등록·권한 부여·알림 발송의 증거가 아닙니다.

- `OrganizationTreeSelect`는 선택한 조직 ID만 적용합니다. 상위 조직을 선택해도
  하위 조직이나 구성원이 자동으로 포함되지 않습니다.
- `PermissionMatrix`의 선택값과 댓글의 `canEdit`·`canDelete`는 화면 설정입니다.
  서버는 각 읽기·쓰기 요청에서 실제 권한을 별도로 확인해야 합니다.
- 알림·댓글의 비동기 작업은 요청이 실패하면 오류를 표시합니다. 저장 어댑터는
  실패를 성공으로 처리하지 말고 거부된 Promise로 전달해야 합니다.
- `FormPage`는 네이티브 폼 제출을 전달하고 `FormActions`는 `form` ID로 외부 폼에도
  연결할 수 있습니다. 자동 저장·이탈 차단·데이터 보존은 제품에서 연결합니다.

`FormPage`의 `pending`·`disabled`와 `FormSection`의 `disabled`는 네이티브
`fieldset`으로 입력을 잠급니다. `FormActions`, `OrganizationTreeSelect`,
`PermissionMatrix`, `SortableList`는 상위 폼의 잠금 상태도 전달받아 동작을 차단합니다. 이 동작이
임의의 사용자 정의 컨트롤이나 모든 포털 콘텐츠에 자동 적용되는 것은 아닙니다.
다른 사용자 정의·포털 컨트롤에는 제품이 해당 잠금 상태를 `disabled`로 명시적으로
전달해야 합니다.

`ImportWizard`는 CSV/XLSX 파서를 내장하지 않습니다. 호출자가
`parse(file, { signal })`에서 형식을 읽고 `{ columns, rows }`를 반환합니다.
열 연결 후에는 `validate(rows, { signal })`로 업무 규칙을 검증하고,
`importRows(rows, { signal })`에서 실제 등록 결과를 반환합니다.
`ImportRow.row`는 헤더를 제외한 1부터 시작하는 데이터 행 번호입니다.
반환하는 성공 행과 실패 사유는 이 번호를 기준으로 연결합니다.
부분 실패를 재처리할 때 중복 등록 방지와 이미 처리된 요청의 결과 확인은 서비스가 맡습니다.

`ExportDialog`는 선택한 `columns`, `scope`, `format`을 어댑터에 전달합니다.
CSV의 인코딩·수식 셀 처리, XLSX 생성, 서버 내보내기 작업과 다운로드 완료 기준은
호출자가 정합니다. 파일 형식 선택지가 있다는 이유만으로 해당 형식의 생성기가
컴포넌트에 포함된 것은 아닙니다. 중단 신호는 클라이언트 요청을 취소하는 수단이며,
이미 서버에서 처리한 데이터의 롤백을 보장하지 않습니다.

파일 미리보기는 브라우저의 표시 기능을 사용합니다. PDF 지원은 브라우저에 따라
다르며 Office 파일을 변환하지 않습니다. URL 허용 검사는 파일의 신뢰성이나 권한을
보장하지 않습니다. 제품이 서명 URL 만료·재발급, object URL 해제, 다운로드 권한을 관리합니다.
독립 `FilePreview`를 버튼에서 열 때는 해당 DOM 요소를 `returnFocus`에 전달하면
Safari의 포인터 동작과 무관하게 닫은 뒤 실행 위치로 포커스를 복원할 수 있습니다.
`AttachmentGallery`는 자체 미리보기 버튼을 자동으로 연결합니다.

## React·Vue 소비 계약

두 패키지는 동일한 22개 이름과 화면 책임을 제공하지만 전달 방식은 다릅니다.
React는 JSX 콘텐츠와 `onValueChange` 같은 콜백을, Vue는 슬롯과
`modelValue`·`update:modelValue` 같은 이벤트를 사용합니다. 비동기 성공·실패를
기다려야 하는 Vue 기능은 `parse`, `importRows`, `exportData` 등의 함수 prop을
사용합니다. 반환값을 기다릴 수 없는 일반 이벤트로 임의 대체하지 않습니다.

실제 타입 소비 예제는 [React consumer](../tests/consumer/main.tsx),
[Vue 타입 consumer](../tests/consumer/vue-types.ts),
[Vue 렌더 consumer](../tests/consumer/vue-main.ts)에 있습니다.
이 예제는 패키지의 공개 import를 사용하며 React 18·19 소비 검사에 함께 포함됩니다.

공개 export 검사는 [contracts.test.mjs](../tests/contracts.test.mjs)가 기존 8개와
신규 22개를 함께 확인합니다. 패키지 빌드 후 외부 설치 consumer 검사와 React/Vue
동작·키보드·320px 화면 검사를 수행합니다. 실행 여부와 결과는 해당 변경의 검증
기록으로 남기며, 이 문서는 테스트 통과나 실제 서비스 도입 승인을 선언하지 않습니다.
