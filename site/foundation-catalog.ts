export const foundationPatterns = [
  {
    id: "list-page",
    title: "List page",
    group: "화면 골격",
    description: "제목, 검색, 목록, 페이지 이동을 같은 구조에 배치합니다.",
  },
  {
    id: "detail-page",
    title: "Detail page",
    group: "화면 골격",
    description:
      "주요 정보와 보조 정보를 구분해 상세 화면의 읽는 순서를 만듭니다.",
  },
  {
    id: "form-page",
    title: "Form page",
    group: "화면 골격",
    description: "입력과 제출 동작을 연결하는 작성 화면의 기본 틀입니다.",
  },
  {
    id: "master-detail-layout",
    title: "Master detail layout",
    group: "화면 골격",
    description:
      "목록의 맥락을 유지하면서 선택한 항목의 상세 내용을 확인합니다.",
  },
  {
    id: "form-section",
    title: "Form section",
    group: "업무 폼",
    description: "연관된 입력 항목을 제목과 설명이 있는 한 영역으로 묶습니다.",
  },
  {
    id: "form-grid",
    title: "Form grid",
    group: "업무 폼",
    description: "화면 너비에 따라 읽기 편한 열 수로 입력 항목을 배치합니다.",
  },
  {
    id: "form-actions",
    title: "Form actions",
    group: "업무 폼",
    description: "저장, 취소와 상태 안내를 일관된 작업 영역에 배치합니다.",
  },
  {
    id: "read-only-field",
    title: "Read only field",
    group: "업무 폼",
    description: "입력할 수 없는 업무 정보를 명확한 이름과 값으로 표시합니다.",
  },
  {
    id: "organization-tree-select",
    title: "Organization tree select",
    group: "조직·권한",
    description: "조직의 계층을 탐색하고 단일 또는 복수 조직을 선택합니다.",
  },
  {
    id: "permission-matrix",
    title: "Permission matrix",
    group: "조직·권한",
    description: "대상별 기능 권한을 행과 열로 비교하고 설정합니다.",
  },
  {
    id: "sortable-list",
    title: "Sortable list",
    group: "순서 편집",
    description: "키보드와 이동 버튼으로 업무 항목의 순서를 편집합니다.",
  },
  {
    id: "notification-center",
    title: "Notification center",
    group: "협업",
    description: "업무 알림을 다시 찾아보고 읽음 상태를 관리합니다.",
  },
  {
    id: "comment-composer",
    title: "Comment composer",
    group: "협업",
    description: "의견을 작성하고 제출 상태와 오류를 확인합니다.",
  },
  {
    id: "comment-thread",
    title: "Comment thread",
    group: "협업",
    description: "의견과 답글을 함께 읽고 허용된 항목을 수정·삭제합니다.",
  },
  {
    id: "file-preview",
    title: "File preview",
    group: "파일",
    description:
      "파일 유형에 맞는 미리보기와 지원하지 않는 형식의 대안을 제공합니다.",
  },
  {
    id: "attachment-gallery",
    title: "Attachment gallery",
    group: "파일",
    description: "여러 첨부 파일을 탐색하고 선택한 파일을 미리 봅니다.",
  },
  {
    id: "access-denied",
    title: "Access denied",
    group: "공통 상태",
    description:
      "접근할 수 없는 이유와 요청하거나 돌아갈 수 있는 경로를 안내합니다.",
  },
  {
    id: "session-expired",
    title: "Session expired",
    group: "공통 상태",
    description: "인증 만료와 다시 로그인해야 하는 상황을 일관되게 안내합니다.",
  },
  {
    id: "page-error",
    title: "Page error",
    group: "공통 상태",
    description:
      "화면을 불러오지 못했을 때 오류 맥락과 재시도 동작을 표시합니다.",
  },
  {
    id: "saved-views",
    title: "Saved views",
    group: "데이터 작업",
    description: "자주 쓰는 검색 조건에 이름을 붙여 다시 선택합니다.",
  },
  {
    id: "import-wizard",
    title: "Import wizard",
    group: "데이터 작업",
    description:
      "파일 선택부터 열 연결, 검증, 등록 결과까지 단계별로 안내합니다.",
  },
  {
    id: "export-dialog",
    title: "Export dialog",
    group: "데이터 작업",
    description: "내보낼 범위, 열, 파일 형식을 확인한 뒤 실행합니다.",
  },
] as const;
