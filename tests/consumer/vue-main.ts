import "@cheese/css";
import { createApp, h, ref } from "vue";
import {
  Button,
  Field,
  Input,
  Calendar,
  Tree,
  DateField,
  TimeField,
  NumberField,
  ScrollArea,
  Pagination,
  AppShell,
  NavigationList,
  UserIdentity,
  SectionHeader,
  StatCard,
  StatGroup,
  RecordCollection,
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
  type PermissionGrant,
  type SortableListItem,
  type SavedView,
  type NotificationItem,
  type CommentItem,
  type PreviewFile,
  type NavigationItem,
  type TableColumn,
  type TableQuery,
} from "@cheese/vue";
import { CalendarDate } from "@internationalized/date";
const selectedOrganizations = ref(["people"]);
const permissionGrants = ref<PermissionGrant[]>([]);
type ReviewerOrderItem = SortableListItem & { reviewerId: number };
const sectionOrder = ref<ReviewerOrderItem[]>([
  { id: "profile", label: "프로필", reviewerId: 101 },
  { id: "permissions", label: "권한", reviewerId: 102 },
]);
const savedViews = ref<SavedView[]>([{ id: "active", label: "재직 구성원" }]);
const selectedView = ref("active");
const exportOpen = ref(false);
const notifications = ref<NotificationItem[]>([
  { id: "review", title: "구성원 검토 요청", time: "방금", read: false },
]);
const comments = ref<CommentItem[]>([
  {
    id: "review",
    author: "운영자",
    body: "기본 정보를 확인했습니다.",
    time: "방금",
    canEdit: true,
    canDelete: true,
    canReply: true,
  },
]);
const previewFiles: PreviewFile[] = [
  {
    id: "guide",
    name: "입사 안내.txt",
    kind: "unsupported",
    downloadable: false,
  },
];
const fileOpen = ref(false);
const previewId = ref<string | null>(null);
const consumerStatus = ref("");
const navigation: NavigationItem[] = [
  { id: "people", label: "구성원", group: "인사 업무" },
  { id: "records", label: "검토 목록", href: "#root", group: "인사 업무" },
  { id: "reports", label: "보고서", disabled: true, group: "분석" },
];
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
const recordQuery = ref<TableQuery>({
  page: 1,
  pageSize: 5,
  search: "",
  sort: null,
});
const selectedRecordIds = ref<string[]>(["member"]);
createApp({
  render: () =>
    h("main", { class: "cheese-root" }, [
      h(
        AppShell,
        {
          items: navigation,
          activeId: "people",
          variant: "embedded",
          onNavigate: (id, event) => {
            if (id === "people") event.preventDefault();
            consumerStatus.value = id;
          },
        },
        {
          brand: () => "CHEESE PEOPLE",
          "header-actions": () => h(Button, {}, () => "새 업무"),
          "sidebar-user": () =>
            h(UserIdentity, {
              name: "운영자",
              description: "피플팀",
              fallback: "운",
              size: "sm",
            }),
          default: () => [
            h(NavigationList, {
              items: navigation,
              activeId: "people",
              label: "업무 바로가기",
              onNavigate: (id, event) => {
                if (id === "people") event.preventDefault();
                consumerStatus.value = id;
              },
            }),
            h(
              SectionHeader,
              {
                title: "검토 현황",
                description: "구성원 검토 진행 상황",
                headingLevel: 2,
              },
              {
                actions: () => h(Button, {}, () => "검토 추가"),
              },
            ),
            h(
              StatGroup,
              { columns: 3 },
              {
                default: () => [
                  h(StatCard, {
                    label: "구성원",
                    value: reviewRecords.length,
                    description: "검토 대상",
                  }),
                  h(StatCard, { label: "검토", value: 2 }),
                  h(StatCard, { label: "완료율", value: "100%" }),
                ],
              },
            ),
            h(
              RecordCollection<ReviewRecord>,
              {
                label: "구성원 검토 목록",
                columns: [
                  { key: "name", label: "이름", sortable: true },
                  { key: "reviewCount", label: "검토 수" },
                ],
                rows: reviewRecords,
                getRowId: (row) => row.id,
                rowLabel: (row) =>
                  `${row.name} 검토 ${row.reviewCount.toFixed(0)}건`,
                isRowSelectable: (row) => row.active,
                query: recordQuery.value,
                selected: selectedRecordIds.value,
                resultCount: reviewRecords.length,
                "onUpdate:query": (query) => {
                  recordQuery.value = query;
                },
                "onUpdate:selected": (ids) => {
                  selectedRecordIds.value = ids.map((id) => id.trim());
                },
              },
              {
                toolbar: () => h("p", "검토 대상을 선택하세요."),
                "bulk-actions": () =>
                  h(
                    Button,
                    {
                      onClick: () => {
                        consumerStatus.value =
                          selectedRecordIds.value.join(",");
                      },
                    },
                    () => "선택 검토",
                  ),
                cell: ({
                  row,
                  column,
                }: {
                  row: ReviewRecord;
                  column: TableColumn;
                }) =>
                  column.key === "reviewCount"
                    ? `${row.reviewCount.toFixed(0)}건`
                    : row.name,
              },
            ),
            h(PageHeader, {
              title: "업무 패턴",
              description: "공개 패키지의 구성원 업무",
            }),
            h(PeoplePicker, {
              label: "프로젝트 구성원",
              people: [
                { id: "member", name: "가상 직원", organizationId: "people" },
              ],
              organizations: [{ id: "people", label: "피플팀" }],
              modelValue: ["member"],
              multiple: true,
            }),
            h(FilterBar, {
              search: "",
              filters: [
                {
                  id: "organization",
                  label: "소속",
                  value: "",
                  options: [{ value: "", label: "전체 조직" }],
                },
              ],
              resultCount: 1,
            }),
            h(BulkActionBar, {
              selectedCount: 1,
              actions: [{ id: "review", label: "검토 시작" }],
            }),
            h(DescriptionList, { items: [{ label: "소속", value: "피플팀" }] }),
            h(ActivityTimeline, {
              label: "업무 이력",
              items: [
                { id: "review", title: "구성원 검토", status: "current" },
              ],
            }),
            h(SaveStatus, { status: "saved" }),
          ],
        },
      ),
      h(Field, { label: "이름" }, () => h(Input, { name: "employee" })),
      h(Button, {}, () => "저장"),
      h(Calendar, {
        label: "마감일",
        modelValue: new CalendarDate(2026, 10, 1),
      }),
      h(DateField, {
        label: "시작일",
        name: "startDate",
        defaultValue: "2026-10-01",
        step: "any",
      }),
      h(TimeField, {
        label: "알림 시간",
        name: "reminder",
        defaultValue: "09:00",
        step: 900,
      }),
      h(NumberField, {
        label: "수량",
        name: "quantity",
        defaultValue: 1.5,
        min: 0,
        max: 10,
        step: 0.5,
      }),
      h(
        ScrollArea,
        { label: "업무 내역", orientation: "both", height: 180 },
        () => h("p", "스크롤 가능한 업무 내역"),
      ),
      h(Pagination, { page: 5, count: 1000, label: "업무 페이지" }),
      h(Tree, { nodes: [{ id: "team", label: "팀" }] }),
      h(
        ListPage,
        { title: "구성원 목록", headingLevel: 2 },
        {
          actions: () => h(Button, {}, () => "구성원 추가"),
          summary: () => "1명",
          filters: () => h(FilterBar, { search: "", filters: [] }),
          toolbar: () => "목록 작업",
          default: () => h("p", "가상 직원"),
          pagination: () => h(Pagination, { page: 1, count: 1 }),
        },
      ),
      h(
        DetailPage,
        { title: "구성원 상세", headingLevel: 2 },
        {
          summary: () => "재직",
          default: () =>
            h(ReadOnlyField, { label: "이름", value: "가상 직원" }),
          aside: () => "관련 업무",
        },
      ),
      h(
        MasterDetailLayout,
        { listLabel: "구성원", detailLabel: "선택 정보" },
        {
          list: () => "가상 직원",
          detail: () => "피플팀",
        },
      ),
      h(
        FormPage,
        {
          id: "consumer-profile",
          title: "구성원 수정",
          headingLevel: 2,
          onSubmit: (event) => event.preventDefault(),
        },
        {
          default: () =>
            h(
              FormSection,
              { title: "기본 정보" },
              {
                default: () =>
                  h(
                    FormGrid,
                    { columns: 2 },
                    {
                      default: () => [
                        h(ReadOnlyField, { label: "담당 업무", value: 0 }),
                        h(ReadOnlyField, { label: "관리자", value: false }),
                      ],
                    },
                  ),
              },
            ),
          footer: () =>
            h(
              FormActions,
              { form: "consumer-profile" },
              {
                status: () => h(SaveStatus, { status: "saved" }),
              },
            ),
        },
      ),
      h(OrganizationTreeSelect, {
        label: "소속 조직",
        nodes: [
          {
            id: "company",
            label: "회사",
            children: [{ id: "people", label: "피플팀" }],
          },
        ],
        modelValue: selectedOrganizations.value,
        multiple: true,
        "onUpdate:modelValue": (ids) => {
          selectedOrganizations.value = ids;
        },
      }),
      h(PermissionMatrix, {
        label: "구성원 권한",
        resources: [{ id: "employees", label: "구성원" }],
        actions: [{ id: "read", label: "조회" }],
        modelValue: permissionGrants.value,
        "onUpdate:modelValue": (grants) => {
          permissionGrants.value = grants;
        },
      }),
      h(SortableList<ReviewerOrderItem>, {
        label: "정보 순서",
        items: sectionOrder.value,
        "onUpdate:items": (items) => {
          sectionOrder.value = items;
        },
      }),
      h(
        "output",
        { "aria-label": "검토 담당자 순서" },
        sectionOrder.value
          .map((item) => item.reviewerId.toFixed(0))
          .join(" → "),
      ),
      h(SavedViews, {
        views: savedViews.value,
        modelValue: selectedView.value,
        save: async (label) => {
          savedViews.value.push({
            id: `view-${savedViews.value.length}`,
            label,
          });
        },
        remove: async (id) => {
          savedViews.value = savedViews.value.filter((view) => view.id !== id);
        },
        "onUpdate:modelValue": (id) => {
          selectedView.value = id;
        },
      }),
      h(
        Button,
        {
          onClick: () => {
            exportOpen.value = true;
          },
        },
        () => "데이터 내보내기",
      ),
      h(ExportDialog, {
        open: exportOpen.value,
        columns: [{ id: "name", label: "이름" }],
        scopes: [{ value: "current", label: "현재 목록" }],
        formats: [{ value: "csv", label: "CSV" }],
        exportData: async (_selection, { signal }) => {
          if (signal.aborted) return;
        },
        "onUpdate:open": (open) => {
          exportOpen.value = open;
        },
      }),
      h(ImportWizard, {
        fields: [{ id: "name", label: "이름", required: true }],
        accept: ".txt",
        parse: async (file, { signal }) => ({
          columns: ["name"],
          rows: signal.aborted ? [] : [{ name: await file.text() }],
        }),
        validate: async (rows, { signal }) =>
          signal.aborted
            ? []
            : rows
                .filter((row) => !row.values.name?.trim())
                .map((row) => ({
                  row: row.row,
                  field: "name",
                  message: "이름을 입력해 주세요.",
                })),
        importRows: async (rows, { signal }) => ({
          succeededRows: signal.aborted ? [] : rows.map((row) => row.row),
          failures: [],
        }),
      }),
      h(NotificationCenter, {
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
          consumerStatus.value = item.title;
        },
      }),
      h(CommentComposer, {
        label: "검토 의견",
        onSubmit: async (body) => {
          comments.value.push({
            id: `comment-${comments.value.length}`,
            author: "운영자",
            body,
            time: "방금",
          });
        },
      }),
      h(CommentThread, {
        items: comments.value,
        onEdit: async (id, body) => {
          comments.value = comments.value.map((item) =>
            item.id === id ? { ...item, body, edited: true } : item,
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
                      body,
                      time: "방금",
                    },
                  ],
                }
              : item,
          );
        },
      }),
      h(
        Button,
        {
          onClick: () => {
            fileOpen.value = true;
          },
        },
        () => "첨부 단독 미리보기",
      ),
      h(FilePreview, {
        open: fileOpen.value,
        item: previewFiles[0] ?? null,
        "onUpdate:open": (open) => {
          fileOpen.value = open;
        },
      }),
      h(AttachmentGallery, {
        label: "제출 자료",
        items: previewFiles,
        previewId: previewId.value,
        "onUpdate:previewId": (id) => {
          previewId.value = id;
        },
      }),
      h(AccessDenied, {
        actionable: true,
        onAction: () => {
          consumerStatus.value = "이전 화면";
        },
      }),
      h(SessionExpired, {
        actionable: true,
        onReauthenticate: () => {
          consumerStatus.value = "로그인 요청";
        },
      }),
      h(PageError, {
        retryable: true,
        onRetry: () => {
          consumerStatus.value = "다시 불러오기";
        },
      }),
      h("p", { role: "status" }, consumerStatus.value),
    ]),
}).mount("#root");
