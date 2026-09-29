export const compositionCategories = [
  {
    id: "layout",
    name: "레이아웃·탐색",
    description: "화면의 읽는 순서와 이동 경로를 구성합니다.",
  },
  {
    id: "data",
    name: "데이터·목록",
    description: "정보를 요약하고, 찾고, 선택해 작업합니다.",
  },
  {
    id: "forms",
    name: "폼",
    description: "입력 항목과 제출 동작을 하나의 흐름으로 연결합니다.",
  },
  {
    id: "selection",
    name: "선택·권한",
    description: "대상과 범위를 고르고 허용된 동작을 편집합니다.",
  },
  {
    id: "collaboration",
    name: "협업",
    description: "사람, 의견, 알림과 진행 이력을 함께 표시합니다.",
  },
  {
    id: "files",
    name: "파일",
    description: "첨부 자료를 확인하고 데이터를 가져오거나 내보냅니다.",
  },
  {
    id: "states",
    name: "상태",
    description: "처리 결과와 다음에 할 수 있는 행동을 안내합니다.",
  },
] as const;

export type CompositionCategory = (typeof compositionCategories)[number]["id"];
export type CompositionDependency = {
  name: string;
  href?: string;
  type: "primitive" | "composite" | "structure";
};
export type CompositeEntry = {
  id: string;
  name: string;
  component: string;
  description: string;
  category: CompositionCategory;
  dependencies: CompositionDependency[];
  owns: string;
  connect: string;
  kind: "existing" | "new";
};

export type CompositionLevel = "pattern" | "template";

const templateIds = new Set([
  "app-shell",
  "list-page",
  "detail-page",
  "master-detail-layout",
  "form-page",
]);

export function compositionLevel(
  entry: Pick<CompositeEntry, "id">,
): CompositionLevel {
  return templateIds.has(entry.id) ? "template" : "pattern";
}

const primitive = (name: string, id: string): CompositionDependency => ({
  name,
  href: `#/components/${id}`,
  type: "primitive",
});
const composite = (name: string, id: string): CompositionDependency => ({
  name,
  href: `#/business-patterns/${id}`,
  type: "composite",
});
const structure = (name: string): CompositionDependency => ({
  name,
  type: "structure",
});
const button = primitive("Button", "button");
const dialog = primitive("Dialog", "dialog");
const search = primitive("SearchInput", "search-input");
const select = primitive("Select", "select");
const checkbox = primitive("Checkbox", "checkbox");
const empty = primitive("EmptyState", "empty-state");
const pageHeader = structure("PageHeader");

export const compositeEntries: CompositeEntry[] = [
  {
    id: "app-shell",
    name: "App shell",
    component: "AppShell",
    category: "layout",
    kind: "existing",
    description: "공통 내비게이션, 사용자 영역과 본문을 연결하는 앱의 틀.",
    dependencies: [
      composite("NavigationList", "navigation-list"),
      button,
      dialog,
    ],
    owns: "탐색 영역의 배치와 모바일 메뉴의 열기·닫기, 포커스 이동을 담당합니다.",
    connect:
      "메뉴 데이터, activeId와 onNavigate를 라우터에 연결하고 사용자·본문 슬롯을 전달합니다.",
  },
  {
    id: "navigation-list",
    name: "Navigation list",
    component: "NavigationList",
    category: "layout",
    kind: "new",
    description: "그룹, 아이콘과 현재 위치가 있는 재사용 가능한 탐색 목록.",
    dependencies: [structure("nav · ul · a / button")],
    owns: "그룹과 활성 항목, 비활성 항목의 표현을 제공합니다.",
    connect:
      "items와 activeId를 전달합니다. href 또는 onNavigate로 실제 이동을 연결합니다.",
  },
  {
    id: "section-header",
    name: "Section header",
    component: "SectionHeader",
    category: "layout",
    kind: "new",
    description: "제목, 설명과 관련 동작을 같은 기준선에 배치합니다.",
    dependencies: [structure("header · heading · actions slot")],
    owns: "제목·설명·동작의 간격과 좁은 화면에서의 배치를 담당합니다.",
    connect:
      "문서 구조에 맞는 headingLevel과 제목, 필요한 동작 컴포넌트를 전달합니다.",
  },
  {
    id: "list-page",
    name: "List page",
    component: "ListPage",
    category: "layout",
    kind: "existing",
    description: "제목, 필터, 도구, 목록과 페이지 이동을 담는 화면 구조.",
    dependencies: [
      pageHeader,
      structure("filters · toolbar · pagination slots"),
    ],
    owns: "영역의 순서와 간격을 일관되게 배치합니다.",
    connect:
      "검색 조건, 목록 데이터, 페이지 상태를 가진 컴포넌트를 각 슬롯에 전달합니다.",
  },
  {
    id: "detail-page",
    name: "Detail page",
    component: "DetailPage",
    category: "layout",
    kind: "existing",
    description: "본문, 요약과 보조 패널을 구분하는 상세 화면 구조.",
    dependencies: [pageHeader, structure("summary · tabs · aside slots")],
    owns: "본문과 보조 정보의 반응형 배치를 담당합니다.",
    connect: "조회한 데이터, 선택한 탭과 편집 동작을 제품에서 연결합니다.",
  },
  {
    id: "master-detail-layout",
    name: "Master detail layout",
    component: "MasterDetailLayout",
    category: "layout",
    kind: "existing",
    description: "탐색 목록과 선택한 항목의 상세를 나란히 배치합니다.",
    dependencies: [structure("list · detail regions"), structure("CSS Grid")],
    owns: "이름이 있는 두 영역과 반응형 배치를 제공합니다.",
    connect: "목록·상세 슬롯과 선택한 ID, URL 동기화는 제품에서 관리합니다.",
  },
  {
    id: "record-collection",
    name: "Record collection",
    component: "RecordCollection",
    category: "data",
    kind: "new",
    description: "검색, 필터, 선택, 일괄 작업과 표를 연결한 목록 컴포넌트.",
    dependencies: [
      composite("FilterBar", "filter-bar"),
      composite("BulkActionBar", "bulk-action-bar"),
      primitive("DataTable", "data-table"),
    ],
    owns: "검색과 표의 query를 연결하고 조건 변경 시 첫 페이지로 돌아갑니다. 선택 수와 일괄 작업을 연결합니다.",
    connect:
      "query·selected 상태, rows 또는 loadRows, 필터 적용과 실제 일괄 처리 콜백을 전달합니다.",
  },
  {
    id: "filter-bar",
    name: "Filter bar",
    component: "FilterBar",
    category: "data",
    kind: "existing",
    description: "검색어, 선택 조건, 결과 수와 초기화 동작을 묶습니다.",
    dependencies: [search, select, button],
    owns: "검색·필터 컨트롤과 결과 수, 초기화 버튼을 배치합니다.",
    connect:
      "검색어와 필터 값, 결과 수를 전달하고 변경·초기화 콜백에서 데이터를 갱신합니다.",
  },
  {
    id: "bulk-action-bar",
    name: "Bulk action bar",
    component: "BulkActionBar",
    category: "data",
    kind: "existing",
    description: "선택한 항목의 작업과 처리 결과, 재시도를 표시합니다.",
    dependencies: [button],
    owns: "선택 수, 작업 버튼, 진행 상태와 부분 실패 안내를 제공합니다.",
    connect:
      "선택 ID와 처리 요청은 제품이 관리합니다. 성공한 ID를 제외하고 실패한 ID만 재시도합니다.",
  },
  {
    id: "stat-card",
    name: "Stat card",
    component: "StatCard",
    category: "data",
    kind: "new",
    description: "지표의 이름, 값과 보조 설명을 하나의 카드로 표시합니다.",
    dependencies: [primitive("Card", "card")],
    owns: "이름과 값의 위계, 보조 설명의 배치를 담당합니다.",
    connect:
      "계산한 값과 표시 형식을 전달합니다. 집계와 갱신 주기는 제품에서 결정합니다.",
  },
  {
    id: "stat-group",
    name: "Stat group",
    component: "StatGroup",
    category: "data",
    kind: "new",
    description: "여러 요약 지표를 화면 너비에 맞게 배열합니다.",
    dependencies: [structure("children slot"), structure("CSS Grid")],
    owns: "columns에 따른 최대 열 수와 반응형 줄바꿈을 제공합니다.",
    connect:
      "StatCard 등 표시할 자식을 전달합니다. 지표 데이터와 순서는 제품에서 관리합니다.",
  },
  {
    id: "description-list",
    name: "Description list",
    component: "DescriptionList",
    category: "data",
    kind: "existing",
    description: "이름과 값으로 이루어진 정보를 읽기 쉽게 정렬합니다.",
    dependencies: [structure("dl · dt · dd")],
    owns: "이름·값의 의미 구조와 긴 값의 줄바꿈을 제공합니다.",
    connect:
      "items의 label과 value를 전달합니다. 포맷, 마스킹과 표시 여부는 제품에서 처리합니다.",
  },
  {
    id: "saved-views",
    name: "Saved views",
    component: "SavedViews",
    category: "data",
    kind: "existing",
    description: "목록 조건에 이름을 붙여 저장하고 다시 선택합니다.",
    dependencies: [select, primitive("Input", "input"), button],
    owns: "보기 선택·이름 입력·저장·삭제와 비동기 처리 상태를 제공합니다.",
    connect:
      "views와 선택 ID를 전달하고 onSave·onSelect·onDelete에서 조건 스냅샷을 보관·적용합니다.",
  },
  {
    id: "sortable-list",
    name: "Sortable list",
    component: "SortableList",
    category: "data",
    kind: "existing",
    description: "이동 버튼과 키보드로 항목의 순서를 변경합니다.",
    dependencies: [button, structure("ol · li")],
    owns: "이동 가능한 범위, 키보드 조작과 순서 변경 안내를 제공합니다.",
    connect:
      "items와 onItemsChange를 연결합니다. 변경 순서 저장과 동시 수정 처리는 제품 책임입니다.",
  },
  {
    id: "form-page",
    name: "Form page",
    component: "FormPage",
    category: "forms",
    kind: "existing",
    description: "제목, 입력과 제출 영역을 담는 작성 화면 구조.",
    dependencies: [pageHeader, structure("form · fieldset")],
    owns: "폼 제출 이벤트와 pending·disabled 상태의 입력 잠금을 제공합니다.",
    connect: "필드와 footer를 전달하고 onSubmit에서 검증과 저장을 수행합니다.",
  },
  {
    id: "form-section",
    name: "Form section",
    component: "FormSection",
    category: "forms",
    kind: "existing",
    description: "서로 관련된 필드를 제목과 설명이 있는 영역으로 묶습니다.",
    dependencies: [structure("fieldset · legend")],
    owns: "필드 그룹의 의미 구조와 그룹 단위 비활성 상태를 제공합니다.",
    connect: "Field 등 입력 컴포넌트와 그룹 제목, 설명을 전달합니다.",
  },
  {
    id: "form-grid",
    name: "Form grid",
    component: "FormGrid",
    category: "forms",
    kind: "existing",
    description: "폼 필드를 읽기 편한 반응형 열로 배열합니다.",
    dependencies: [structure("children slot"), structure("CSS Grid")],
    owns: "화면 너비와 columns에 따른 필드 배치를 담당합니다.",
    connect: "필드 값과 검증은 각 입력 컴포넌트에서 관리합니다.",
  },
  {
    id: "form-actions",
    name: "Form actions",
    component: "FormActions",
    category: "forms",
    kind: "existing",
    description: "제출, 취소와 저장 상태를 같은 작업 영역에 놓습니다.",
    dependencies: [button, structure("status slot")],
    owns: "제출·취소 버튼과 처리 중 비활성 상태를 제공합니다.",
    connect:
      "폼의 onSubmit, onCancel과 pending을 연결하고 필요하면 SaveStatus를 전달합니다.",
  },
  {
    id: "read-only-field",
    name: "Read only field",
    component: "ReadOnlyField",
    category: "forms",
    kind: "existing",
    description: "편집할 수 없는 값과 빈 값 안내를 필드 형태로 표시합니다.",
    dependencies: [structure("dl · dt · dd")],
    owns: "값의 유무에 맞는 표시를 제공합니다. 0과 false는 빈 값으로 취급하지 않습니다.",
    connect:
      "label·value와 필요하면 emptyText를 전달합니다. 값의 형식과 노출 정책은 제품이 결정합니다.",
  },
  {
    id: "people-picker",
    name: "People picker",
    component: "PeoplePicker",
    category: "selection",
    kind: "existing",
    description: "사람을 검색하고 선택 내용을 확인한 뒤 적용합니다.",
    dependencies: [
      dialog,
      primitive("Tree", "tree"),
      search,
      checkbox,
      structure("Radix RadioGroup"),
      button,
      empty,
    ],
    owns: "검색·조직 탐색·임시 선택과 적용·취소를 연결합니다.",
    connect:
      "people·organizations와 선택 ID를 전달합니다. onValueChange에서 확정된 선택을 반영합니다.",
  },
  {
    id: "organization-tree-select",
    name: "Organization tree select",
    component: "OrganizationTreeSelect",
    category: "selection",
    kind: "existing",
    description: "조직의 계층을 탐색하고 선택 범위를 확정합니다.",
    dependencies: [dialog, search, button, structure("ARIA tree")],
    owns: "계층 탐색·검색과 임시 선택, 적용·취소를 제공합니다.",
    connect:
      "nodes·선택 ID와 onValueChange를 연결합니다. 하위 조직 포함 규칙과 조회 권한은 제품이 결정합니다.",
  },
  {
    id: "permission-matrix",
    name: "Permission matrix",
    component: "PermissionMatrix",
    category: "selection",
    kind: "existing",
    description: "대상별 동작 권한을 행과 열로 비교하고 선택합니다.",
    dependencies: [checkbox, structure("table")],
    owns: "권한 선택 UI와 읽기 전용·사용 불가 상태를 제공합니다.",
    connect:
      "resources·actions·value와 변경 콜백을 전달합니다. 실제 접근 권한은 서버에서 검사합니다.",
  },
  {
    id: "user-identity",
    name: "User identity",
    component: "UserIdentity",
    category: "collaboration",
    kind: "new",
    description: "아바타, 이름과 보조 정보를 함께 표시합니다.",
    dependencies: [primitive("Avatar", "avatar")],
    owns: "아바타와 텍스트의 정렬, 이미지가 없을 때 대체 표시를 제공합니다.",
    connect:
      "name·description·src를 전달합니다. 프로필 조회와 사용자 동작은 제품에서 연결합니다.",
  },
  {
    id: "activity-timeline",
    name: "Activity timeline",
    component: "ActivityTimeline",
    category: "collaboration",
    kind: "existing",
    description: "담당자, 시간과 진행 상태가 있는 이력을 표시합니다.",
    dependencies: [structure("ol · li"), structure("Lucide icons")],
    owns: "순서가 있는 기록과 현재·완료·대기·오류 상태를 구분합니다.",
    connect:
      "정렬한 items에 title·actor·time·status를 전달합니다. 이력 조회와 업무 단계 전이는 제품이 관리합니다.",
  },
  {
    id: "notification-center",
    name: "Notification center",
    component: "NotificationCenter",
    category: "collaboration",
    kind: "existing",
    description: "알림 목록과 읽음 상태, 대상 화면 이동을 연결합니다.",
    dependencies: [button, structure("알림 목록 · status")],
    owns: "알림의 읽음 표시, 개별·전체 읽기와 로딩·오류 안내를 제공합니다.",
    connect:
      "items와 읽기·이동 콜백을 전달합니다. 알림 수신과 상태 저장은 제품에서 처리합니다.",
  },
  {
    id: "comment-composer",
    name: "Comment composer",
    component: "CommentComposer",
    category: "collaboration",
    kind: "existing",
    description: "의견을 작성하고 전송 상태와 오류를 확인합니다.",
    dependencies: [primitive("Textarea", "textarea"), button],
    owns: "초안, 공백·길이 검사와 제출 중 잠금, 실패 시 초안 보존을 제공합니다.",
    connect:
      "onSubmit에 Promise를 반환하는 저장 함수를 전달합니다. 작성자와 저장 데이터는 제품이 관리합니다.",
  },
  {
    id: "comment-thread",
    name: "Comment thread",
    component: "CommentThread",
    category: "collaboration",
    kind: "existing",
    description: "의견과 답글을 읽고 허용된 항목을 수정·삭제합니다.",
    dependencies: [
      composite("CommentComposer", "comment-composer"),
      button,
      primitive("AlertDialog", "alert-dialog"),
    ],
    owns: "댓글·답글 표시, 수정·삭제 확인과 비동기 처리 상태를 제공합니다.",
    connect:
      "items·권한 표시와 onEdit·onDelete·onReply를 연결합니다. 서버에서도 작업 권한을 검사합니다.",
  },
  {
    id: "file-preview",
    name: "File preview",
    component: "FilePreview",
    category: "files",
    kind: "existing",
    description: "파일 유형에 맞는 미리보기와 다운로드 동작을 제공합니다.",
    dependencies: [dialog, button],
    owns: "파일 유형별 표시, 로딩·오류·만료 안내와 대화상자 포커스를 담당합니다.",
    connect:
      "파일 메타데이터·URL·open 상태와 다운로드·재시도를 전달합니다. URL 발급과 접근 권한은 제품이 관리합니다.",
  },
  {
    id: "attachment-gallery",
    name: "Attachment gallery",
    component: "AttachmentGallery",
    category: "files",
    kind: "existing",
    description: "첨부 목록을 탐색하고 선택한 파일을 미리 봅니다.",
    dependencies: [composite("FilePreview", "file-preview"), button],
    owns: "첨부 항목과 미리보기 대화상자의 연결을 제공합니다.",
    connect:
      "items·previewId와 변경·다운로드 콜백을 전달합니다. 파일 조회와 업로드는 제품에서 연결합니다.",
  },
  {
    id: "import-wizard",
    name: "Import wizard",
    component: "ImportWizard",
    category: "files",
    kind: "existing",
    description: "파일 선택, 열 연결, 검증과 등록 결과를 단계별로 안내합니다.",
    dependencies: [select, checkbox, button, structure("file input")],
    owns: "단계 전환, 매핑·검증 결과와 부분 실패 재시도 상태를 제공합니다.",
    connect:
      "fields와 parse·validate·importRows를 전달합니다. 파일 해석과 실제 등록, 중복 방지는 제품에서 구현합니다.",
  },
  {
    id: "export-dialog",
    name: "Export dialog",
    component: "ExportDialog",
    category: "files",
    kind: "existing",
    description: "내보낼 범위, 열과 형식을 고른 뒤 작업을 실행합니다.",
    dependencies: [dialog, select, checkbox, button],
    owns: "옵션 선택과 비동기 내보내기의 진행·실패·취소 상태를 제공합니다.",
    connect:
      "columns·scopes·formats와 onExport를 전달합니다. 파일 생성과 다운로드, 권한 검사는 제품에서 처리합니다.",
  },
  {
    id: "save-status",
    name: "Save status",
    component: "SaveStatus",
    category: "states",
    kind: "existing",
    description: "변경, 저장 중, 완료와 실패 상태를 간결하게 전달합니다.",
    dependencies: [button, structure("status live region")],
    owns: "저장 상태의 표시·안내와 재시도 동작을 제공합니다.",
    connect:
      "status와 onRetry를 저장 요청에 연결합니다. 자동 저장 주기와 데이터 보관은 제품이 담당합니다.",
  },
  {
    id: "access-denied",
    name: "Access denied",
    component: "AccessDenied",
    category: "states",
    kind: "existing",
    description: "접근 제한의 이유와 가능한 다음 행동을 안내합니다.",
    dependencies: [button, structure("StatePage (내부 레이아웃)")],
    owns: "권한이 없는 상태의 제목·설명·복구 동작을 표시합니다.",
    connect:
      "권한 확인 결과에 따라 표시하고 onAction에 접근 요청 또는 이동 경로를 연결합니다.",
  },
  {
    id: "session-expired",
    name: "Session expired",
    component: "SessionExpired",
    category: "states",
    kind: "existing",
    description: "인증 만료와 다시 로그인하는 동작을 안내합니다.",
    dependencies: [button, structure("StatePage (내부 레이아웃)")],
    owns: "만료 안내와 재인증 버튼의 진행 상태를 표시합니다.",
    connect:
      "onReauthenticate와 busy를 인증 흐름에 연결합니다. 로그인 후 복귀와 초안 보관은 제품에서 관리합니다.",
  },
  {
    id: "page-error",
    name: "Page error",
    component: "PageError",
    category: "states",
    kind: "existing",
    description: "화면을 불러오지 못한 이유와 재시도 동작을 표시합니다.",
    dependencies: [button, structure("StatePage (내부 레이아웃)")],
    owns: "오류 안내와 재시도 중 중복 실행 방지를 제공합니다.",
    connect:
      "onRetry·busy를 데이터 요청에 연결합니다. 오류 수집과 상태 복구, React 오류 경계는 제품이 관리합니다.",
  },
];

export function getCompositeEntry(id: string) {
  return compositeEntries.find((entry) => entry.id === id);
}

/** Include every public component used in a documentation snippet. */
export function compositionImport(component: string, code: string) {
  const publicNames = new Set([
    ...compositeEntries.map((entry) => entry.component),
    "PageHeader",
    "Field",
    "Input",
    "Badge",
    "Pagination",
    "DataTable",
    "Button",
    "Card",
    "Checkbox",
    "Textarea",
  ]);
  const names = new Set(component.split(",").map((name) => name.trim()));
  for (const match of code.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    if (publicNames.has(match[1])) names.add(match[1]);
  }
  return `import { ${[...names].join(", ")} } from "@cheese/react";\n\n${code}`;
}
