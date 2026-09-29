import { h, ref } from "vue";
import {
  Button,
  Input,
  SearchInput,
  ErrorSummary,
  AttachmentList,
  Field,
  Calendar,
  DateField,
  TimeField,
  NumberField,
  ScrollArea,
  Pagination,
  DialogRoot,
  DialogContent,
  DialogTitle,
  TabsTrigger,
  ContextMenuTrigger,
  Select,
  Combobox,
  Listbox,
  PinInput,
  TagsInput,
  Editable,
  Rating,
  ColorPicker,
  DateRangeField,
  TimeRangeField,
  MonthPicker,
  YearPicker,
  Splitter,
  Carousel,
  NavigationMenuRoot,
  MenubarRoot,
  ToolbarRoot,
  AsyncCombobox,
  MultiSelect,
  DataTable,
  FileUpload,
  createOptionsLoader,
  createXHRUpload,
  AppShell,
  NavigationList,
  UserIdentity,
  SectionHeader,
  StatCard,
  StatGroup,
  RecordCollection,
  Users,
  PageHeader,
  PeoplePicker,
  FilterBar,
  BulkActionBar,
  DescriptionList,
  ActivityTimeline,
  SaveStatus,
  ListPage,
  DetailPage,
  FormPage,
  MasterDetailLayout,
  FormSection,
  FormGrid,
  FormActions,
  ReadOnlyField,
  OrganizationTreeSelect,
  PermissionMatrix,
  SortableList,
  SavedViews,
  ExportDialog,
  ImportWizard,
  NotificationCenter,
  CommentComposer,
  CommentThread,
  FilePreview,
  AttachmentGallery,
  AccessDenied,
  SessionExpired,
  PageError,
  safePreviewUrl,
  type OrganizationNode,
  type PermissionAction,
  type PermissionResource,
  type PermissionGrant,
  type SortableListItem,
  type SavedView,
  type ExportColumn,
  type ExportScopeValue,
  type ExportScope,
  type ExportFormat,
  type ExportSelection,
  type ImportContext,
  type ImportField,
  type ImportRow,
  type ImportIssue,
  type ImportResult,
  type ImportParsedData,
  type NotificationItem,
  type NotificationCenterProps,
  type CommentReply,
  type CommentItem,
  type CommentComposerProps,
  type CommentThreadProps,
  type PreviewFile,
  type AppShellItem,
  type NavigationItem,
  type TableColumn,
  type FilterBarFilter,
  type BulkAction,
  type BulkActionResult,
  type PickerPerson,
  type PickerOrganization,
  type TableQuery,
} from "@cheese/vue";
import { CalendarDate } from "@internationalized/date";
const name = ref("");
const search = ref<InstanceType<typeof SearchInput> | null>(null);
const summary = ref<InstanceType<typeof ErrorSummary> | null>(null);
search.value?.focus();
search.value?.input?.select();
summary.value?.focus({ preventScroll: true });
const tableQuery = ref<TableQuery>({
  page: 1,
  pageSize: 5,
  search: "직원",
  sort: { key: "name", direction: "asc" },
});
const navigation: AppShellItem[] = [{ id: "people", label: "구성원" }];
const groupedNavigation: NavigationItem[] = [
  {
    id: "people",
    label: "구성원",
    icon: Users,
    href: "/people",
    group: "인사 업무",
  },
  { id: "reports", label: "보고서", disabled: true, group: "분석" },
];
h(NavigationList, {
  items: groupedNavigation,
  activeId: "people",
  label: "업무 메뉴",
  onNavigate: (id, event) => {
    if (event.button === 0) event.preventDefault();
    name.value = id.toUpperCase();
  },
});
h(UserIdentity, {
  name: "운영자",
  description: "피플팀",
  src: "/operator.png",
  fallback: "운",
  size: "sm",
});
h(
  SectionHeader,
  { title: "검토 현황", description: "이번 주 검토", headingLevel: 3 },
  {
    actions: () => h(Button, {}, () => "검토 추가"),
  },
);
h(
  StatGroup,
  { columns: 4 },
  {
    default: () => [
      h(StatCard, { label: "구성원", value: 12, description: "검토 대상" }),
      h(StatCard, { label: "완료율", value: "75%" }),
      h(StatCard, { label: "선택됨" }, { value: () => h("strong", "3") }),
    ],
  },
);
type ReviewRecord = {
  id: string;
  name: string;
  organizationId: string;
  reviewCount: number;
  active: boolean;
};
const reviewRecords: ReviewRecord[] = [
  {
    id: "member",
    name: "가상 직원",
    organizationId: "people",
    reviewCount: 2,
    active: true,
  },
];
const recordColumns: TableColumn[] = [
  { key: "name", label: "이름", sortable: true },
  { key: "reviewCount", label: "검토 수" },
];
const selectedRecordIds = ref<string[]>(["member"]);
h(
  RecordCollection<ReviewRecord>,
  {
    label: "구성원 검토 목록",
    columns: recordColumns,
    rows: reviewRecords,
    getRowId: (row) => row.id.trim(),
    rowLabel: (row) => `${row.name}: ${row.reviewCount.toFixed(0)}건`,
    isRowSelectable: (row) => row.active && row.organizationId === "people",
    query: tableQuery.value,
    selected: selectedRecordIds.value,
    filters: [],
    resultCount: reviewRecords.length,
    bulkRetryable: true,
    "onUpdate:query": (query) => {
      tableQuery.value = query;
    },
    "onQuery-change": (query) => query.sort?.direction.toUpperCase(),
    "onUpdate:selected": (ids) => {
      selectedRecordIds.value = ids.map((id) => id.trim());
    },
    "onFilter-change": (id, value) => `${id.toUpperCase()}:${value.trim()}`,
    "onReset-filters": () => undefined,
    "onClear-selection": () => {
      selectedRecordIds.value = [];
    },
    "onRetry-bulk-actions": () => undefined,
  },
  {
    toolbar: () => h(Button, {}, () => "검토 추가"),
    "bulk-actions": () =>
      h(Button, {}, () => `선택 ${selectedRecordIds.value.length}명 검토`),
    cell: ({ row, column }: { row: ReviewRecord; column: TableColumn }) =>
      column.key === "reviewCount"
        ? h("strong", row.reviewCount.toFixed(0))
        : row.name,
  },
);
const organizations: PickerOrganization[] = [
  {
    id: "company",
    label: "회사",
    children: [{ id: "people", label: "피플팀" }],
  },
];
const people: PickerPerson[] = [
  {
    id: "member",
    name: "가상 직원",
    organizationId: "people",
    disabled: false,
  },
];
const selectedPeople = ref(["member"]);
const filters: FilterBarFilter[] = [
  {
    id: "organization",
    label: "소속",
    value: "",
    options: [
      { value: "", label: "전체 조직" },
      { value: "people", label: "피플팀" },
    ],
  },
];
const actions: BulkAction[] = [{ id: "review", label: "검토 시작" }];
const bulkResult: BulkActionResult = { succeeded: 0, failed: 1 };
h(
  AppShell,
  {
    items: navigation,
    activeId: "people",
    variant: "application",
    onNavigate: (id, event) => {
      event.preventDefault();
      return id.toUpperCase();
    },
  },
  {
    brand: () => "CHEESE PEOPLE",
    "header-actions": () => h(Button, {}, () => "새 업무"),
    "sidebar-user": () =>
      h(UserIdentity, { name: "운영자", description: "피플팀" }),
    user: () => "운영자",
    footer: () => "소비자 패키지 검증",
    default: () =>
      h(
        PageHeader,
        { title: "업무 패턴", description: "구성원 업무" },
        {
          actions: () => h(Button, {}, () => "새 업무"),
        },
      ),
  },
);
h(PeoplePicker, {
  label: "프로젝트 구성원",
  people,
  organizations,
  modelValue: selectedPeople.value,
  multiple: true,
  "onUpdate:modelValue": (ids) => {
    selectedPeople.value = ids.map((id) => id.trim());
  },
});
h(FilterBar, {
  search: name.value,
  filters,
  resultCount: 1,
  "onUpdate:search": (value) => {
    name.value = value.trim();
  },
  "onFilter-change": (id, value) => `${id.toUpperCase()}:${value.trim()}`,
  onReset: () => {
    name.value = "";
  },
});
h(BulkActionBar, {
  selectedCount: selectedPeople.value.length,
  actions,
  result: bulkResult,
  retryable: true,
  onAction: (id) => id.toUpperCase(),
  onClear: () => {
    selectedPeople.value = [];
  },
  onRetry: () => undefined,
});
h(DescriptionList, { items: [{ label: "소속", value: "피플팀" }] });
h(ActivityTimeline, {
  label: "업무 이력",
  items: [
    {
      id: "review",
      title: "구성원 검토",
      actor: "운영자",
      time: "2026-09-29",
      status: "current",
    },
  ],
});
h(SaveStatus, { status: "error", retryable: true, onRetry: () => undefined });
h(SearchInput, {
  ref: search,
  label: "직원 검색",
  modelValue: name.value,
  name: "employeeSearch",
  description: "이름 또는 부서를 검색하세요.",
  "onUpdate:modelValue": (value) => {
    name.value = value.trim();
  },
  onSearch: (value) => value.toUpperCase(),
});
h(ErrorSummary, {
  ref: summary,
  errors: [
    {
      id: "employee-required",
      message: "이름을 입력해 주세요.",
      targetId: "employee",
    },
  ],
  onNavigate: (item, event) => {
    if (!item.targetId) event.preventDefault();
  },
});
h(AttachmentList, {
  label: "저장된 첨부파일",
  items: [
    {
      id: "guide",
      name: "입사 안내.pdf",
      size: 2048,
      href: "/files/guide.pdf",
    },
  ],
  remove: async (item, { signal }) => {
    await fetch(`/api/files/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      signal,
    });
  },
});
h(AsyncCombobox, {
  label: "검색",
  loadOptions: createOptionsLoader("/api/employees"),
  "onUpdate:modelValue": (item) => item?.value.trim(),
});
h(MultiSelect, {
  label: "선택",
  options: [],
  "onUpdate:modelValue": (items) => items.map((item) => item.value),
});
h(DataTable, {
  label: "목록",
  columns: [{ key: "name", label: "이름" }],
  rows: [{ id: "1", name: "직원" }],
  getRowId: (row) => String(row.id),
  query: tableQuery.value,
  "onUpdate:query": (query) => {
    tableQuery.value = query;
  },
  "onQuery-change": (query) => query.sort?.direction.toUpperCase(),
  "onUpdate:selected": (ids) => ids.join(","),
});
h(DataTable, {
  label: "기본 목록",
  columns: [{ key: "name", label: "이름" }],
  rows: [{ id: "1", name: "직원" }],
  getRowId: (row) => String(row.id),
  defaultQuery: { page: 1, pageSize: 5, search: "", sort: null },
});
h(FileUpload, {
  label: "첨부",
  upload: createXHRUpload("/api/files"),
  onComplete: (item) => item.file.name,
});
h(Button, { type: "submit", variant: "accent" }, () => "저장");
h(Input, {
  modelValue: name.value,
  "onUpdate:modelValue": (value) => {
    name.value = String(value ?? "");
  },
});
h(Field, { label: "이름", required: true }, () => h(Input));
h(Calendar, { label: "마감일", modelValue: new CalendarDate(2026, 10, 1) });
h(DateField, {
  label: "시작일",
  modelValue: "2026-10-01",
  name: "startDate",
  form: "employee-form",
  min: "2026-01-01",
  max: "2026-12-31",
  step: "any",
  "onUpdate:modelValue": (value) => value.trim(),
});
h(TimeField, {
  label: "알림 시간",
  defaultValue: "09:00",
  name: "reminder",
  min: "09:00",
  max: "18:00",
  step: 900,
  "onUpdate:modelValue": (value) => value.trim(),
});
h(NumberField, {
  label: "수량",
  modelValue: 1.5,
  name: "quantity",
  min: 0,
  max: 10,
  step: 0.5,
  "onUpdate:modelValue": (value) => value.trim(),
});
h(
  ScrollArea,
  {
    label: "업무 내역",
    orientation: "both",
    height: "12rem",
    dir: "rtl",
    viewportProps: { tabindex: 0, onScroll: (event) => event.type },
  },
  () => h("p", "스크롤 가능한 업무 내역"),
);
h(Pagination, {
  page: 5,
  count: 1000,
  label: "업무 페이지",
  previousLabel: "이전 업무 페이지",
  nextLabel: "다음 업무 페이지",
  getPageLabel: (page) => `${page}번째 업무 페이지`,
  "onUpdate:page": (page) => page.toFixed(0),
  onPageChange: (page) => page.toFixed(0),
});
h(DialogRoot, {}, () =>
  h(DialogContent, {}, () => h(DialogTitle, {}, () => "평가")),
);
h(TabsTrigger, { value: "profile" }, () => "프로필");
h(ContextMenuTrigger, { asChild: true, disabled: false }, () => h(Button));
h(Select, {
  label: "조직",
  options: [{ value: "people", label: "피플팀" }],
  "onUpdate:modelValue": (value) => value.toUpperCase(),
});
h(Combobox, { label: "검색", options: [], modelValue: "" });
h(Listbox, { label: "목록", options: [] });
h(PinInput, { label: "인증", length: 6 });
h(TagsInput, {
  label: "태그",
  "onUpdate:modelValue": (value) => value.join(","),
});
h(Editable, { label: "제목" });
h(Rating, { label: "평점" });
h(ColorPicker, { label: "색상" });
h(DateRangeField, {
  label: "기간",
  required: true,
  "onUpdate:modelValue": (value) => value.start.trim(),
});
h(TimeRangeField, {
  label: "시간",
  defaultValue: { start: "09:00", end: "10:00" },
});
h(MonthPicker, { label: "월" });
h(YearPicker, { label: "연도" });
h(Splitter, { label: "분할" }, { first: () => "조직", second: () => "내용" });
h(
  Carousel,
  { label: "안내", count: 2 },
  { default: ({ index }: { index: number }) => String(index) },
);
h(NavigationMenuRoot, {});
h(MenubarRoot, {});
h(ToolbarRoot, {});

const organizationNodes: OrganizationNode[] = [
  {
    id: "company",
    label: "회사",
    children: [{ id: "people", label: "피플팀", disabled: false }],
  },
];
const selectedOrganizations = ref<string[]>(["people"]);
const permissionActions: PermissionAction[] = [{ id: "read", label: "조회" }];
const permissionResources: PermissionResource[] = [
  { id: "employees", label: "구성원", unavailableActions: [] },
];
const grants = ref<PermissionGrant[]>([
  { resourceId: "employees", actionId: "read" },
]);
type ReviewerOrderItem = SortableListItem & { reviewerId: number };
const orderedItems = ref<ReviewerOrderItem[]>([
  {
    id: "profile",
    label: "기본 정보",
    description: "직원 프로필",
    reviewerId: 101,
  },
  { id: "permissions", label: "접근 권한", disabled: false, reviewerId: 102 },
]);
h(OrganizationTreeSelect, {
  label: "소속 조직",
  nodes: organizationNodes,
  modelValue: selectedOrganizations.value,
  multiple: true,
  "onUpdate:modelValue": (ids) => {
    selectedOrganizations.value = ids.map((id) => id.trim());
  },
});
h(PermissionMatrix, {
  label: "구성원 권한",
  resources: permissionResources,
  actions: permissionActions,
  modelValue: grants.value,
  readOnly: false,
  "onUpdate:modelValue": (next) => {
    grants.value = next.map((grant) => ({
      resourceId: grant.resourceId.trim(),
      actionId: grant.actionId.trim(),
    }));
  },
});
h(SortableList<ReviewerOrderItem>, {
  label: "상세 정보 순서",
  items: orderedItems.value,
  "onUpdate:items": (items) => {
    orderedItems.value = items.map((item) => ({
      ...item,
      label: item.label.trim(),
      description: `검토 담당자 ${item.reviewerId.toFixed(0)}`,
    }));
  },
});
h(
  ListPage,
  { title: "구성원 목록", eyebrow: "PEOPLE", headingLevel: 2 },
  {
    actions: () => h(Button, {}, () => "구성원 추가"),
    summary: () => h("p", "1명"),
    filters: () => h(FilterBar, { search: "", filters: [] }),
    toolbar: () => h("p", "목록 작업"),
    default: () => h("p", "가상 직원"),
    pagination: () => h(Pagination, { page: 1, count: 1 }),
  },
);
h(
  DetailPage,
  { title: "구성원 상세", headingLevel: 2 },
  {
    actions: () => h(Button, {}, () => "수정"),
    summary: () => h("p", "재직"),
    tabs: () => h("p", "기본 정보"),
    default: () => h(ReadOnlyField, { label: "이름", value: "가상 직원" }),
    aside: () => h("p", "관련 업무"),
    footer: () => h("p", "최종 확인 완료"),
  },
);
h(
  MasterDetailLayout,
  { listLabel: "구성원", detailLabel: "선택한 구성원" },
  {
    list: () => h("p", "가상 직원"),
    detail: () => h("p", "피플팀"),
  },
);
h(
  FormPage,
  {
    id: "foundation-profile",
    title: "구성원 수정",
    headingLevel: 2,
    noValidate: true,
    pending: false,
    onSubmit: (event) => event.preventDefault(),
  },
  {
    actions: () => h(Button, {}, () => "도움말"),
    default: () =>
      h(
        FormSection,
        { title: "기본 정보", description: "공개 프로필" },
        {
          default: () =>
            h(
              FormGrid,
              { columns: 2 },
              {
                default: () => [
                  h(ReadOnlyField, { label: "업무 수", value: 0 }),
                  h(ReadOnlyField, { label: "관리자", value: false }),
                  h(ReadOnlyField, {
                    label: "소개",
                    value: null,
                    emptyText: "미입력",
                  }),
                  h(
                    ReadOnlyField,
                    { label: "소속" },
                    { default: () => h("strong", "피플팀") },
                  ),
                ],
              },
            ),
        },
      ),
    footer: () =>
      h(
        FormActions,
        { form: "foundation-profile", onCancel: () => undefined },
        {
          status: () => h(SaveStatus, { status: "dirty" }),
          default: () => h(Button, { variant: "ghost" }, () => "임시 저장"),
        },
      ),
  },
);
const savedViews = ref<SavedView[]>([{ id: "active", label: "재직 구성원" }]);
const activeView = ref("active");
h(SavedViews, {
  views: savedViews.value,
  modelValue: activeView.value,
  save: async (label) => {
    savedViews.value.push({
      id: `view-${savedViews.value.length}`,
      label: label.trim(),
    });
  },
  remove: async (id) => {
    savedViews.value = savedViews.value.filter((view) => view.id !== id);
  },
  "onUpdate:modelValue": (id) => {
    activeView.value = id.trim();
  },
});
const exportColumns: ExportColumn[] = [{ id: "name", label: "이름" }];
const exportScope: ExportScopeValue = "current";
const exportScopes: ExportScope[] = [
  { value: exportScope, label: "현재 목록" },
];
const exportFormats: ExportFormat[] = [{ value: "csv", label: "CSV" }];
const exportOpen = ref(false);
const exportSelections = ref<ExportSelection[]>([]);
async function exportFoundation(
  selection: ExportSelection,
  context: ImportContext,
): Promise<void> {
  if (!context.signal.aborted) exportSelections.value.push(selection);
}
h(ExportDialog, {
  open: exportOpen.value,
  columns: exportColumns,
  scopes: exportScopes,
  formats: exportFormats,
  exportData: exportFoundation,
  "onUpdate:open": (open) => {
    exportOpen.value = open;
  },
});
const importFields: ImportField[] = [
  { id: "name", label: "이름", required: true },
];
const importedRows = ref<ImportRow[]>([]);
h(ImportWizard, {
  fields: importFields,
  accept: ".txt",
  maxRows: 100,
  parse: async (file, { signal }): Promise<ImportParsedData> => ({
    columns: ["name"],
    rows: signal.aborted ? [] : [{ name: await file.text() }],
  }),
  validate: async (rows, { signal }): Promise<ImportIssue[]> =>
    signal.aborted
      ? []
      : rows
          .filter((row) => !row.values.name?.trim())
          .map((row) => ({
            row: row.row,
            field: "name",
            message: "이름을 입력해 주세요.",
          })),
  importRows: async (rows, { signal }): Promise<ImportResult> => {
    if (signal.aborted) return { succeededRows: [], failures: [] };
    importedRows.value = rows.map((row) => ({
      row: row.row,
      values: { ...row.values },
    }));
    return { succeededRows: rows.map((row) => row.row), failures: [] };
  },
});
const notifications = ref<NotificationItem[]>([
  {
    id: "notice",
    title: "검토 요청",
    body: "구성원 정보를 확인하세요.",
    time: "방금",
    read: false,
  },
]);
const notificationProps: NotificationCenterProps = {
  items: notifications.value,
  onRead: async (id) => {
    notifications.value = notifications.value.map((item) =>
      item.id === id ? { ...item, read: true } : item,
    );
  },
  onReadAll: async () => {
    notifications.value = notifications.value.map((item) => ({
      ...item,
      read: true,
    }));
  },
  onNavigate: (item) => {
    activeView.value = item.id;
  },
  onRetry: () => undefined,
};
h(NotificationCenter, notificationProps);
const initialReply: CommentReply = {
  id: "reply",
  author: "운영자",
  body: "확인했습니다.",
  time: "방금",
  canEdit: true,
};
const comments = ref<CommentItem[]>([
  {
    id: "comment",
    author: "가상 직원",
    body: "검토를 요청합니다.",
    time: "오늘",
    canEdit: true,
    canDelete: true,
    canReply: true,
    replies: [initialReply],
  },
]);
const composerProps: CommentComposerProps = {
  label: "검토 의견",
  defaultValue: "",
  maxLength: 500,
  onSubmit: async (body) => {
    comments.value.push({
      id: `comment-${comments.value.length}`,
      author: "운영자",
      body: body.trim(),
      time: "방금",
    });
  },
  onCancel: () => undefined,
};
h(CommentComposer, composerProps);
const threadProps: CommentThreadProps = {
  items: comments.value,
  onEdit: async (id, body) => {
    comments.value = comments.value.map((item) =>
      item.id === id ? { ...item, body: body.trim(), edited: true } : item,
    );
  },
  onDelete: async (id) => {
    comments.value = comments.value.filter((item) => item.id !== id);
  },
  onReply: async (parentId, body) => {
    comments.value = comments.value.map((item) =>
      item.id === parentId
        ? {
            ...item,
            replies: [
              ...(item.replies ?? []),
              {
                id: `reply-${item.replies?.length ?? 0}`,
                author: "운영자",
                body: body.trim(),
                time: "방금",
              },
            ],
          }
        : item,
    );
  },
  onRetry: () => undefined,
};
h(CommentThread, threadProps);
const previewFiles: PreviewFile[] = [
  {
    id: "guide",
    name: "입사 안내.txt",
    kind: "unsupported",
    url: safePreviewUrl("https://example.test/guide.txt"),
    downloadable: false,
  },
];
const fileOpen = ref(false);
const previewId = ref<string | null>(null);
h(FilePreview, {
  open: fileOpen.value,
  item: previewFiles[0] ?? null,
  retryable: true,
  downloadable: true,
  "onUpdate:open": (open) => {
    fileOpen.value = open;
  },
  onRetry: (item) => {
    previewId.value = item.id;
  },
  onDownload: (item) => {
    name.value = item.name;
  },
});
h(AttachmentGallery, {
  label: "제출 자료",
  items: previewFiles,
  previewId: previewId.value,
  retryable: true,
  downloadable: true,
  "onUpdate:previewId": (id) => {
    previewId.value = id;
  },
  onRetry: (item) => {
    previewId.value = item.id;
  },
  onDownload: (item) => {
    name.value = item.name;
  },
});
h(AccessDenied, { actionable: true, onAction: () => undefined });
h(SessionExpired, {
  actionable: true,
  busy: false,
  onReauthenticate: () => undefined,
});
h(
  PageError,
  { retryable: true, busy: false, onRetry: () => undefined },
  {
    actions: () => h(Button, {}, () => "고객지원"),
  },
);
