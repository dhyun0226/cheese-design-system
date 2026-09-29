<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from "vue";
import {
  Badge,
  AccessDenied,
  AttachmentGallery,
  Button,
  Card,
  Check,
  CheckboxIndicator,
  CheckboxRoot,
  CommentComposer,
  CommentThread,
  DataTable,
  DescriptionList,
  DetailPage,
  ExportDialog,
  Field,
  FilePreview,
  FilterBar,
  FormActions,
  FormGrid,
  FormPage,
  FormSection,
  Input,
  ImportWizard,
  ListPage,
  MasterDetailLayout,
  NotificationCenter,
  OrganizationTreeSelect,
  PermissionMatrix,
  PageError,
  ReadOnlyField,
  SaveStatus,
  SavedViews,
  SessionExpired,
  SortableList,
  type DataRow,
  type CommentItem,
  type ExportSelection,
  type ExportScope,
  type ImportContext,
  type ImportIssue,
  type ImportParsedData,
  type ImportResult,
  type ImportRow,
  type NotificationItem,
  type OrganizationNode,
  type PermissionGrant,
  type PreviewFile,
  type SortableListItem,
} from "@cheese/vue";
import "./business-patterns.css";

const sampleRows: DataRow[] = [
  { id: "EMP-001", name: "김민서", team: "제품팀" },
  { id: "EMP-002", name: "이지우", team: "디자인팀" },
  { id: "EMP-003", name: "박하린", team: "경영지원팀" },
];
const listSearch = ref("");
const listRows = computed(() =>
  sampleRows.filter((row) =>
    `${row.name} ${row.team}`.includes(listSearch.value.trim()),
  ),
);
const detailExpanded = ref(false);
const masterId = ref("EMP-001");
const masterEmployee = computed(() =>
  sampleRows.find((row) => row.id === masterId.value)!,
);
const formName = ref("김민서");
const formMessage = ref("");
const formPending = ref(false);
let formTimer: ReturnType<typeof setTimeout> | undefined;
function submitForm() {
  formPending.value = true;
  formMessage.value = "변경 사항을 처리하고 있습니다.";
  formTimer = setTimeout(() => {
    formMessage.value = `${formName.value.trim()}님의 변경을 예제 메모리에 저장했습니다.`;
    formPending.value = false;
  }, 300);
}
const demoLifecycle = new AbortController();
onBeforeUnmount(() => {
  clearTimeout(formTimer);
  demoLifecycle.abort();
});
function demoRequest(signal = demoLifecycle.signal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("요청이 취소되었습니다.", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("요청이 취소되었습니다.", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 300);
    signal.addEventListener("abort", abort, { once: true });
  });
}
const sectionDisabled = ref(false);
const sectionEmail = ref("minseo@example.com");
const gridColumns = ref<1 | 2 | 3>(2);
const actionTitle = ref("제품팀 협업 안내");
const actionSaved = ref(false);
const readOnlyEmpty = ref(false);
const organizations: OrganizationNode[] = [
  {
    id: "company",
    label: "회사",
    children: [
      { id: "product", label: "플랫폼팀" },
      { id: "design", label: "디자인팀" },
      { id: "people", label: "경영지원팀" },
      { id: "archive", label: "보관 조직", disabled: true },
    ],
  },
];
const selectedOrganizations = ref(["product"]);
const permissions = ref<PermissionGrant[]>([
  { resourceId: "employee", actionId: "read" },
]);
const permissionReadOnly = ref(false);
const sortableItems = ref<SortableListItem[]>([
  { id: "overview", label: "대시보드", description: "가장 먼저 보이는 메뉴" },
  { id: "documents", label: "직원관리", description: "직원 정보와 조직 탐색" },
  { id: "schedule", label: "평가관리", description: "평가 진행 상황 확인" },
  {
    id: "policy",
    label: "보안 정책",
    description: "위치를 변경할 수 없는 고정 메뉴",
    disabled: true,
  },
]);
const viewQuery = ref("");
const selectedView = ref("all");
const savedViews = ref([{ id: "all", label: "전체 직원" }]);
const snapshots = new Map<string, string>([["all", ""]]);
let viewSequence = 0;
async function saveView(label: string) {
  await demoRequest();
  const id = `custom-${++viewSequence}`;
  savedViews.value = [...savedViews.value, { id, label }];
  snapshots.set(id, viewQuery.value);
  selectedView.value = id;
}
function selectView(id: string) {
  selectedView.value = id;
  viewQuery.value = snapshots.get(id) ?? "";
}
async function removeView(id: string) {
  await demoRequest();
  savedViews.value = savedViews.value.filter((view) => view.id !== id);
  snapshots.delete(id);
  if (selectedView.value === id) {
    selectedView.value = savedViews.value[0]?.id ?? "";
    viewQuery.value = snapshots.get(selectedView.value) ?? "";
  }
}

const notifications = ref<NotificationItem[]>([
  {
    id: "notice-1",
    title: "평가 검토 요청",
    body: "팀원이 검토 의견을 요청했습니다.",
    time: "오늘 09:30",
    read: false,
  },
  {
    id: "notice-2",
    title: "조직 정보 변경",
    body: "구성원의 소속 정보가 변경되었습니다.",
    time: "어제 16:00",
    read: false,
  },
]);
const notificationFailure = ref(false);
const notificationOpened = ref("");
async function readNotification(id?: string) {
  await demoRequest();
  if (notificationFailure.value) throw new Error("예제 읽음 요청 실패");
  notifications.value = notifications.value.map((item) =>
    !id || item.id === id ? { ...item, read: true } : item,
  );
}
const composerFailure = ref(false);
const composerResults = ref<string[]>([]);
async function submitComment(body: string) {
  await demoRequest();
  if (composerFailure.value) throw new Error("예제 등록 요청 실패");
  composerResults.value = [...composerResults.value, body];
}
const threadFailure = ref(false);
const comments = ref<CommentItem[]>([
  {
    id: "comment-1",
    author: "김민서",
    body: "첨부 문서의 일정도 함께 확인해 주세요.",
    time: "오늘 10:20",
    canEdit: true,
    canDelete: true,
    canReply: true,
    replies: [
      {
        id: "reply-1",
        author: "이지우",
        body: "네, 일정 확인하겠습니다.",
        time: "오늘 10:25",
        canEdit: true,
        canDelete: true,
      },
    ],
  },
]);
let commentSequence = 1;
async function editComment(id: string, body: string) {
  await demoRequest();
  if (threadFailure.value) throw new Error("예제 수정 요청 실패");
  comments.value = comments.value.map((item) => ({
    ...item,
    ...(item.id === id ? { body, edited: true } : {}),
    replies: item.replies?.map((reply) =>
      reply.id === id ? { ...reply, body, edited: true } : reply,
    ),
  }));
}
async function deleteComment(id: string) {
  await demoRequest();
  if (threadFailure.value) throw new Error("예제 삭제 요청 실패");
  comments.value = comments.value
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      replies: item.replies?.filter((reply) => reply.id !== id),
    }));
}
async function replyComment(id: string, body: string) {
  await demoRequest();
  if (threadFailure.value) throw new Error("예제 답글 요청 실패");
  comments.value = comments.value.map((item) =>
    item.id === id
      ? {
          ...item,
          replies: [
            ...(item.replies ?? []),
            {
              id: `new-reply-${++commentSequence}`,
              author: "운영 담당자",
              body,
              time: "방금",
              canEdit: true,
              canDelete: true,
            },
          ],
        }
      : item,
  );
}
const imageUrl = new URL("./assets/starship-logo.png", import.meta.url).href;
const previewOpen = ref(false);
const previewTrigger = shallowRef<HTMLElement | null>(null);
function openPreview(event: MouseEvent) {
  previewTrigger.value =
    event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  previewOpen.value = true;
}
const previewFile = ref<PreviewFile>({
  id: "preview-logo",
  name: "브랜드 로고.png",
  kind: "image",
  url: imageUrl,
  description: "문서 사이트의 로고 자산을 미리보기용 파일로 재사용합니다.",
  status: "expired",
});
const galleryFiles = ref<PreviewFile[]>([
  {
    id: "gallery-logo",
    name: "브랜드 로고.png",
    kind: "image",
    url: imageUrl,
    status: "ready",
  },
  {
    id: "gallery-expired",
    name: "만료된 이미지.png",
    kind: "image",
    url: imageUrl,
    status: "expired",
  },
  {
    id: "gallery-source",
    name: "업무 원본.zip",
    kind: "unsupported",
    description: "미리보기를 지원하지 않는 파일입니다.",
  },
]);
const galleryId = ref<string | null>(null);
function retryGallery(file: PreviewFile) {
  galleryFiles.value = galleryFiles.value.map((item): PreviewFile =>
    item.id === file.id ? { ...item, status: "ready" } : item,
  );
}
const accessMessage = ref("");
const sessionReconnected = ref(false);
const pageRecovered = ref(false);
const importFailure = ref(false);
const importedNames = ref<string[]>([]);
const importFields = [
  { id: "name", label: "이름", required: true },
  { id: "team", label: "소속", required: true },
];
const sampleCsv = "name,team\r\n김민서,플랫폼팀\r\n이지우,디자인팀\r\n";

// This decoder belongs to the example adapter, not the design-system component.
function decodeCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index++;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("CSV 따옴표가 닫히지 않았습니다.");
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  return rows;
}
async function parseImport(
  file: File,
  { signal }: ImportContext,
): Promise<ImportParsedData> {
  await demoRequest(signal);
  const text = await file.text();
  signal.throwIfAborted();
  const [columns, ...rows] = decodeCsv(text);
  if (
    !columns?.length ||
    new Set(columns).size !== columns.length ||
    columns.some((value) => !value.trim())
  )
    throw new Error("CSV 첫 행에 고유한 열 이름이 필요합니다.");
  if (rows.some((row) => row.length !== columns.length))
    throw new Error("CSV의 열 개수가 일정하지 않습니다.");
  return {
    columns,
    rows: rows.map((row) =>
      Object.fromEntries(columns.map((column, index) => [column, row[index]])),
    ),
  };
}
async function validateImport(
  rows: ImportRow[],
  { signal }: ImportContext,
): Promise<ImportIssue[]> {
  await demoRequest(signal);
  signal.throwIfAborted();
  return rows.flatMap((row) =>
    importFields.flatMap((field) =>
      row.values[field.id]?.trim()
        ? []
        : [
            {
              row: row.row,
              field: field.id,
              message: `${field.label}을 입력해 주세요.`,
            },
          ],
    ),
  );
}
async function importRows(
  rows: ImportRow[],
  { signal }: ImportContext,
): Promise<ImportResult> {
  await demoRequest(signal);
  signal.throwIfAborted();
  const failed = importFailure.value ? rows.slice(-1) : [];
  if (failed.length) importFailure.value = false;
  const succeeded = rows.filter((row) => !failed.includes(row));
  importedNames.value = [
    ...importedNames.value,
    ...succeeded.map((row) => row.values.name),
  ];
  return {
    succeededRows: succeeded.map((row) => row.row),
    failures: failed.map((row) => ({
      row: row.row,
      message: "예제 처리 실패입니다. 실패한 행을 다시 시도하세요.",
    })),
  };
}
function downloadFile(
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: mime }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const exportOpen = ref(false);
const exportFailure = ref(false);
const exportMessage = ref("");
const exportColumns = [
  { id: "name", label: "이름" },
  { id: "team", label: "소속" },
];
const exportScopes: ExportScope[] = [
  { value: "current", label: "현재 목록 (3명)" },
  { value: "selected", label: "선택한 직원 (1명)" },
  { value: "all", label: "전체 직원 (3명)" },
];
const exportFormats = [{ value: "csv", label: "CSV" }];
async function exportData(
  selection: ExportSelection,
  { signal }: ImportContext,
) {
  await demoRequest(signal);
  signal.throwIfAborted();
  if (exportFailure.value) throw new Error("예제 내보내기 실패");
  const rows =
    selection.scope === "selected" ? sampleRows.slice(0, 1) : sampleRows;
  const cell = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;
  const content = [
    selection.columns.map(cell).join(","),
    ...rows.map((row) =>
      selection.columns.map((column) => cell(row[column])).join(","),
    ),
  ].join("\r\n");
  downloadFile("cheese-members.csv", content);
  exportMessage.value = `${rows.length}행, ${selection.columns.length}개 열을 CSV 파일로 내보냈습니다.`;
}
</script>

<template>
  <main class="cheese-root business-patterns business-vue-page">
    <a class="text-link" href="./#/business-patterns">← CHEESE 업무 패턴</a>
    <header class="page-heading">
      <span class="eyebrow">GROUPWARE FOUNDATION · VUE</span>
      <h1>화면의 뼈대부터.<br />같은 컴포넌트로.</h1>
      <p>
        공개 Vue 패키지의 22개 구성요소를 직접 조합한 예제입니다. 제품별 API와
        정책은 주입하고, 화면 구조와 상호작용은 재사용합니다. 모든
        인물·조직·데이터는 가상이며 서버에 저장하지 않습니다.
      </p>
    </header>

    <nav
      class="business-pattern-section cheese-inline"
      aria-label="Vue 업무 기반 바로가기"
    >
      <a class="text-link" href="#vue-foundation-layouts">화면 골격</a>
      <a class="text-link" href="#vue-foundation-forms">업무 폼</a>
      <a class="text-link" href="#vue-foundation-organization">조직·권한</a>
      <a class="text-link" href="#vue-foundation-order">순서 편집</a>
      <a class="text-link" href="#vue-foundation-collaboration">협업</a>
      <a class="text-link" href="#vue-foundation-files">파일</a>
      <a class="text-link" href="#vue-foundation-states">공통 상태</a>
      <a class="text-link" href="#vue-foundation-data">데이터 작업</a>
    </nav>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-layouts"
    >
      <h2 id="vue-foundation-layouts">01 · 화면 골격</h2>
      <div class="business-demo-stack">
        <Card id="foundation-list-page" aria-label="Vue ListPage">
          <div class="business-vue-card-heading">
            <h3>ListPage</h3>
            <Badge>목록 화면</Badge>
          </div>
          <ListPage
            title="직원 목록"
            description="제목·검색·목록을 슬롯으로 구성합니다."
            :heading-level="4"
          >
            <template #summary
              ><Badge>{{ listRows.length }}명</Badge></template
            >
            <template #filters
              ><FilterBar
                v-model:search="listSearch"
                search-label="직원 검색"
                :filters="[]"
                :result-count="listRows.length"
                @reset="listSearch = ''"
            /></template>
            <DataTable
              label="직원 목록 예제"
              :columns="[
                { key: 'name', label: '이름' },
                { key: 'team', label: '소속' },
              ]"
              :rows="listRows"
              :get-row-id="(row: DataRow) => String(row.id)"
              :show-search="false"
            />
          </ListPage>
        </Card>

        <Card id="foundation-detail-page" aria-label="Vue DetailPage">
          <div class="business-vue-card-heading">
            <h3>DetailPage</h3>
            <Badge>상세 화면</Badge>
          </div>
          <DetailPage
            title="김민서"
            description="본문·보조 정보·작업 영역을 제품에 맞게 채웁니다."
            :heading-level="4"
          >
            <template #actions
              ><Button
                variant="weak"
                :aria-expanded="detailExpanded"
                @click="detailExpanded = !detailExpanded"
                >{{ detailExpanded ? "연락처 숨기기" : "연락처 보기" }}</Button
              ></template
            >
            <template #summary><Badge tone="brand">재직</Badge></template>
            <DescriptionList
              :items="[
                { label: '사번', value: 'EMP-001' },
                { label: '소속', value: '제품팀' },
              ]"
            />
            <template #aside
              ><ReadOnlyField label="직무" value="프로덕트 매니저"
            /></template>
            <template v-if="detailExpanded" #footer
              ><ReadOnlyField label="이메일" value="minseo@example.com"
            /></template>
          </DetailPage>
        </Card>

        <Card id="foundation-form-page" aria-label="Vue FormPage">
          <div class="business-vue-card-heading">
            <h3>FormPage</h3>
            <Badge>작성 화면</Badge>
          </div>
          <FormPage
            title="직원 정보 수정"
            description="표준 form과 하단 작업 영역을 조합합니다."
            :heading-level="4"
            :pending="formPending"
            @submit="submitForm"
          >
            <Field label="직원 이름"
              ><Input v-model="formName" required name="employeeName"
            /></Field>
            <template #footer
              ><FormActions
                submit-label="변경 저장"
                :pending="formPending"
                @cancel="
                  formName = '김민서';
                  formMessage = '';
                "
                ><template #status
                  ><span role="status">{{
                    formMessage || "이 예제는 메모리에서만 변경됩니다."
                  }}</span></template
                ></FormActions
              ></template
            >
          </FormPage>
        </Card>

        <Card
          id="foundation-master-detail-layout"
          aria-label="Vue MasterDetailLayout"
        >
          <div class="business-vue-card-heading">
            <h3>MasterDetailLayout</h3>
            <Badge>목록 · 상세</Badge>
          </div>
          <MasterDetailLayout
            list-label="직원 탐색"
            detail-label="선택한 직원 정보"
          >
            <template #list
              ><div class="business-demo-stack">
                <Button
                  v-for="row in sampleRows"
                  :key="String(row.id)"
                  :variant="masterId === row.id ? 'weak' : 'ghost'"
                  :aria-pressed="masterId === row.id"
                  @click="masterId = String(row.id)"
                  >{{ row.name }}</Button
                >
              </div></template
            >
            <template #detail
              ><DescriptionList
                :items="[
                  { label: '이름', value: String(masterEmployee.name) },
                  { label: '소속', value: String(masterEmployee.team) },
                ]"
            /></template>
          </MasterDetailLayout>
        </Card>
      </div>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-forms"
    >
      <h2 id="vue-foundation-forms">02 · 업무 폼</h2>
      <div class="business-vue-grid">
        <Card id="foundation-form-section" aria-label="Vue FormSection">
          <div class="business-vue-card-heading">
            <h3>FormSection</h3>
            <Badge>항목 그룹</Badge>
          </div>
          <div class="business-demo-stack">
            <label class="business-demo-checkbox-label"
              ><CheckboxRoot
                :model-value="sectionDisabled"
                @update:model-value="sectionDisabled = $event === true"
                ><CheckboxIndicator
                  ><Check
                    aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
              >연락처 편집 잠금</label
            >
            <FormSection
              title="연락처"
              description="같은 맥락의 필드를 한 그룹으로 묶습니다."
              :disabled="sectionDisabled"
              ><Field label="업무 이메일"
                ><Input v-model="sectionEmail" type="email" /></Field
            ></FormSection>
          </div>
        </Card>
        <Card id="foundation-form-grid" aria-label="Vue FormGrid">
          <div class="business-vue-card-heading">
            <h3>FormGrid</h3>
            <Badge>입력 배치</Badge>
          </div>
          <div class="business-demo-stack">
            <div class="cheese-inline">
              <Button
                v-for="columns in [1, 2, 3] as const"
                :key="columns"
                size="sm"
                :variant="gridColumns === columns ? 'weak' : 'ghost'"
                :aria-pressed="gridColumns === columns"
                @click="gridColumns = columns"
                >{{ columns }}열</Button
              >
            </div>
            <FormGrid :columns="gridColumns"
              ><Field label="성명"><Input placeholder="이름" /></Field
              ><Field label="직무"><Input placeholder="직무" /></Field
              ><Field label="근무지"><Input placeholder="근무지" /></Field
            ></FormGrid>
            <p class="cheese-help">
              좁은 화면에서는 공통 컴포넌트가 한 열로 정리합니다.
            </p>
          </div>
        </Card>
        <Card id="foundation-form-actions" aria-label="Vue FormActions">
          <div class="business-vue-card-heading">
            <h3>FormActions</h3>
            <Badge>저장 · 취소</Badge>
          </div>
          <div class="business-demo-stack">
            <form
              id="vue-foundation-action-form"
              @submit.prevent="actionSaved = true"
            >
              <Field label="문서 제목"
                ><Input
                  v-model="actionTitle"
                  required
                  @update:model-value="actionSaved = false"
              /></Field>
            </form>
            <FormActions
              form="vue-foundation-action-form"
              @cancel="
                actionTitle = '제품팀 협업 안내';
                actionSaved = false;
              "
              ><template #status
                ><SaveStatus
                  :status="actionSaved ? 'saved' : 'dirty'"
                  :label="
                    actionSaved
                      ? '메모리에 저장되었습니다.'
                      : '저장되지 않은 변경'
                  " /></template
            ></FormActions>
          </div>
        </Card>
        <Card id="foundation-read-only-field" aria-label="Vue ReadOnlyField">
          <div class="business-vue-card-heading">
            <h3>ReadOnlyField</h3>
            <Badge>조회 모드</Badge>
          </div>
          <div class="business-demo-stack">
            <Button
              size="sm"
              variant="ghost"
              :aria-pressed="readOnlyEmpty"
              @click="readOnlyEmpty = !readOnlyEmpty"
              >{{ readOnlyEmpty ? "값 표시" : "빈 값 보기" }}</Button
            >
            <ReadOnlyField
              label="업무 이메일"
              :value="readOnlyEmpty ? null : 'minseo@example.com'"
              empty-text="등록된 이메일 없음"
            />
            <ReadOnlyField label="미처리 건수" :value="0" />
            <ReadOnlyField label="외부 공유" :value="false" />
          </div>
        </Card>
      </div>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-organization"
    >
      <h2 id="vue-foundation-organization">03 · 조직 · 권한</h2>
      <div class="business-demo-stack">
        <Card
          id="foundation-organization-tree-select"
          aria-label="Vue OrganizationTreeSelect"
        >
          <div class="business-vue-card-heading">
            <h3>OrganizationTreeSelect</h3>
            <Badge>계층형 선택</Badge>
          </div>
          <div class="business-demo-stack">
            <OrganizationTreeSelect
              v-model="selectedOrganizations"
              label="업무 담당 조직"
              :nodes="organizations"
              multiple
              description="검색과 계층 탐색으로 조직을 고른 뒤 적용합니다."
            />
            <p class="cheese-help" role="status">
              선택된 조직 ID: {{ selectedOrganizations.join(", ") || "없음" }}
            </p>
          </div>
        </Card>
        <Card
          id="foundation-permission-matrix"
          aria-label="Vue PermissionMatrix"
        >
          <div class="business-vue-card-heading">
            <h3>PermissionMatrix</h3>
            <Badge>권한 설정 UI</Badge>
          </div>
          <div class="business-demo-stack">
            <label class="business-demo-checkbox-label"
              ><CheckboxRoot
                :model-value="permissionReadOnly"
                @update:model-value="permissionReadOnly = $event === true"
                ><CheckboxIndicator
                  ><Check
                    aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
              >읽기 전용</label
            >
            <PermissionMatrix
              v-model="permissions"
              label="역할별 기능 권한"
              :read-only="permissionReadOnly"
              :actions="[
                { id: 'read', label: '조회' },
                { id: 'edit', label: '수정' },
                { id: 'remove', label: '삭제' },
              ]"
              :resources="[
                { id: 'employee', label: '직원정보' },
                {
                  id: 'audition',
                  label: '평가결과',
                  unavailableActions: ['remove'],
                },
                { id: 'audit', label: '시스템설정', disabled: true },
              ]"
            />
            <p class="cheese-help" role="status">
              {{ permissions.length }}개의 권한 선택 · 실제 접근 권한은 서버에서
              검증해야 합니다.
            </p>
          </div>
        </Card>
      </div>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-order"
    >
      <h2 id="vue-foundation-order">04 · 순서 편집</h2>
      <Card id="foundation-sortable-list" aria-label="Vue SortableList">
        <div class="business-vue-card-heading">
          <h3>SortableList</h3>
          <Badge>버튼 · 키보드</Badge>
        </div>
        <SortableList
          v-model:items="sortableItems"
          label="메뉴 순서"
          description="이동 버튼 또는 Alt + 방향키로 순서를 변경합니다. 고정 항목은 이동할 수 없습니다."
        />
        <p class="cheese-help" role="status">
          현재 순서: {{ sortableItems.map((item) => item.label).join(" → ") }}
        </p>
      </Card>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-collaboration"
    >
      <h2 id="vue-foundation-collaboration">05 · 협업</h2>
      <div class="business-demo-stack">
        <Card
          id="foundation-notification-center"
          aria-label="Vue NotificationCenter"
        >
          <div class="business-vue-card-heading">
            <h3>NotificationCenter</h3>
            <Badge>알림함</Badge>
          </div>
          <div class="business-demo-stack">
            <label class="business-demo-checkbox-label"
              ><CheckboxRoot
                :model-value="notificationFailure"
                @update:model-value="notificationFailure = $event === true"
                ><CheckboxIndicator
                  ><Check
                    aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
              >다음 요청 실패 재현</label
            >
            <NotificationCenter
              :items="notifications"
              :on-read="readNotification"
              :on-read-all="() => readNotification()"
              :on-navigate="
                (item: NotificationItem) => (notificationOpened = item.title)
              "
            />
            <p class="cheese-help" role="status">
              {{
                notificationOpened
                  ? `열어볼 업무: ${notificationOpened}`
                  : "알림을 누르면 연결할 업무 이름을 표시합니다. 읽음 상태는 별도로 변경합니다."
              }}
            </p>
          </div>
        </Card>
        <Card id="foundation-comment-composer" aria-label="Vue CommentComposer">
          <div class="business-vue-card-heading">
            <h3>CommentComposer</h3>
            <Badge>의견 작성</Badge>
          </div>
          <div class="business-demo-stack">
            <label class="business-demo-checkbox-label"
              ><CheckboxRoot
                :model-value="composerFailure"
                @update:model-value="composerFailure = $event === true"
                ><CheckboxIndicator
                  ><Check
                    aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
              >다음 요청 실패 재현</label
            >
            <CommentComposer
              label="검토 의견 작성"
              :max-length="300"
              :on-submit="submitComment"
            />
            <DescriptionList
              v-if="composerResults.length"
              :items="
                composerResults.map((body, index) => ({
                  label: `등록한 의견 ${index + 1}`,
                  value: body,
                }))
              "
            />
            <p class="cheese-help">
              오류가 발생하면 초안이 유지됩니다. 실패 재현을 끄면 같은 내용으로
              다시 등록할 수 있습니다.
            </p>
          </div>
        </Card>
        <Card id="foundation-comment-thread" aria-label="Vue CommentThread">
          <div class="business-vue-card-heading">
            <h3>CommentThread</h3>
            <Badge>수정 · 답글 · 삭제</Badge>
          </div>
          <div class="business-demo-stack">
            <label class="business-demo-checkbox-label"
              ><CheckboxRoot
                :model-value="threadFailure"
                @update:model-value="threadFailure = $event === true"
                ><CheckboxIndicator
                  ><Check
                    aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
              >다음 요청 실패 재현</label
            >
            <CommentThread
              :items="comments"
              label="업무 검토 의견"
              :on-edit="editComment"
              :on-delete="deleteComment"
              :on-reply="replyComment"
            />
            <p class="cheese-help">
              가능한 작업은 항목별 속성으로 표시합니다. 실제 수정·삭제 권한은
              서비스에서 검증합니다.
            </p>
          </div>
        </Card>
      </div>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-files"
    >
      <h2 id="vue-foundation-files">06 · 파일</h2>
      <div class="business-demo-stack">
        <Card id="foundation-file-preview" aria-label="Vue FilePreview">
          <div class="business-vue-card-heading">
            <h3>FilePreview</h3>
            <Badge>미리보기</Badge>
          </div>
          <div class="business-demo-stack">
            <p class="cheese-help">
              권한이 있는 파일의 URL을 전달합니다. 만료 상태에서는 다시 불러오기
              동작을 서비스로 돌려줍니다.
            </p>
            <Button variant="weak" @click="openPreview"
              >파일 미리보기 열기</Button
            >
            <Button
              variant="ghost"
              size="sm"
              @click="previewFile = { ...previewFile, status: 'expired' }"
              >만료 상태로 초기화</Button
            >
            <FilePreview
              v-model:open="previewOpen"
              :return-focus="previewTrigger"
              :item="previewFile"
              retryable
              @retry="previewFile = { ...previewFile, status: 'ready' }"
            />
          </div>
        </Card>
        <Card
          id="foundation-attachment-gallery"
          aria-label="Vue AttachmentGallery"
        >
          <div class="business-vue-card-heading">
            <h3>AttachmentGallery</h3>
            <Badge>첨부 탐색</Badge>
          </div>
          <AttachmentGallery
            v-model:preview-id="galleryId"
            label="업무 참고 자료"
            :items="galleryFiles"
            retryable
            @retry="retryGallery"
          />
          <p class="cheese-help">
            이미지·만료된 파일·지원하지 않는 형식의 처리를 비교할 수 있습니다.
          </p>
        </Card>
      </div>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-states"
    >
      <h2 id="vue-foundation-states">07 · 공통 상태</h2>
      <div class="business-demo-stack">
        <Card id="foundation-access-denied" aria-label="Vue AccessDenied">
          <div class="business-vue-card-heading">
            <h3>AccessDenied</h3>
            <Badge>접근 권한 없음</Badge>
          </div>
          <AccessDenied
            actionable
            action-label="권한 요청 안내"
            @action="
              accessMessage =
                '이 화면의 담당자에게 필요한 업무와 접근 범위를 전달해 주세요.'
            "
          />
          <p v-if="accessMessage" class="cheese-help" role="status">
            {{ accessMessage }}
          </p>
        </Card>
        <Card id="foundation-session-expired" aria-label="Vue SessionExpired">
          <div class="business-vue-card-heading">
            <h3>SessionExpired</h3>
            <Badge>인증 상태</Badge>
          </div>
          <SessionExpired
            v-if="!sessionReconnected"
            actionable
            @reauthenticate="sessionReconnected = true"
          />
          <div v-else class="business-demo-stack">
            <p role="status">
              로그인 연결 콜백이 실행되었습니다. 실제 인증은 서비스에서
              연결합니다.
            </p>
            <Button
              variant="ghost"
              size="sm"
              @click="sessionReconnected = false"
              >만료 상태 다시 보기</Button
            >
          </div>
        </Card>
        <Card id="foundation-page-error" aria-label="Vue PageError">
          <div class="business-vue-card-heading">
            <h3>PageError</h3>
            <Badge>조회 실패</Badge>
          </div>
          <PageError
            v-if="!pageRecovered"
            retryable
            @retry="pageRecovered = true"
          />
          <div v-else class="business-demo-stack">
            <p role="status">예제 조회를 다시 시도했습니다.</p>
            <Button variant="ghost" size="sm" @click="pageRecovered = false"
              >오류 상태 다시 보기</Button
            >
          </div>
        </Card>
      </div>
    </section>

    <section
      class="business-pattern-section"
      aria-labelledby="vue-foundation-data"
    >
      <h2 id="vue-foundation-data">08 · 데이터 작업</h2>
      <div class="business-demo-stack">
        <Card id="foundation-saved-views" aria-label="Vue SavedViews">
          <div class="business-vue-card-heading">
            <h3>SavedViews</h3>
            <Badge>검색 조건 저장</Badge>
          </div>
          <div class="business-demo-stack">
            <Field label="저장할 검색어"
              ><Input v-model="viewQuery" placeholder="예: 제품팀"
            /></Field>
            <SavedViews
              :views="savedViews"
              :model-value="selectedView"
              :save="saveView"
              :remove="removeView"
              label="직원 검색 보기"
              @update:model-value="selectView"
            />
            <p class="cheese-help" role="status">
              현재 검색어: {{ viewQuery || "전체" }} · 이름과 조건은 예제
              메모리에만 보관됩니다.
            </p>
          </div>
        </Card>
        <Card id="foundation-import-wizard" aria-label="Vue ImportWizard">
          <div class="business-vue-card-heading">
            <h3>ImportWizard</h3>
            <Badge>파일 · 연결 · 검증 · 등록</Badge>
          </div>
          <div class="business-demo-stack">
            <div class="cheese-inline">
              <Button
                variant="weak"
                size="sm"
                @click="downloadFile('cheese-import-sample.csv', sampleCsv)"
                >샘플 CSV 다운로드</Button
              ><label class="business-demo-checkbox-label"
                ><CheckboxRoot
                  :model-value="importFailure"
                  @update:model-value="importFailure = $event === true"
                  ><CheckboxIndicator
                    ><Check
                      aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
                >다음 요청 실패 재현</label
              >
            </div>
            <ImportWizard
              :fields="importFields"
              :parse="parseImport"
              :validate="validateImport"
              :import-rows="importRows"
              accept=".csv"
              title="직원 CSV 등록"
            />
            <p class="cheese-help" role="status">
              메모리에 등록된 이름: {{ importedNames.join(", ") || "없음" }}
            </p>
            <p class="cheese-help">
              이 예제의 파일 해석기는 CSV만 처리합니다. 엑셀 해석·서버
              검증·데이터 저장은 실제 서비스의 어댑터로 교체합니다.
            </p>
          </div>
        </Card>
        <Card id="foundation-export-dialog" aria-label="Vue ExportDialog">
          <div class="business-vue-card-heading">
            <h3>ExportDialog</h3>
            <Badge>범위 · 열 · 파일 형식</Badge>
          </div>
          <div class="business-demo-stack">
            <label class="business-demo-checkbox-label"
              ><CheckboxRoot
                :model-value="exportFailure"
                @update:model-value="exportFailure = $event === true"
                ><CheckboxIndicator
                  ><Check
                    aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
              >다음 요청 실패 재현</label
            >
            <Button variant="weak" @click="exportOpen = true"
              >직원 정보 내보내기</Button
            >
            <ExportDialog
              v-model:open="exportOpen"
              :columns="exportColumns"
              :scopes="exportScopes"
              :formats="exportFormats"
              :export-data="exportData"
            />
            <p class="cheese-help" role="status">
              {{
                exportMessage ||
                "확인한 범위와 열로 실제 CSV 파일을 생성합니다. 개인정보를 포함하지 않은 가상 직원입니다."
              }}
            </p>
          </div>
        </Card>
      </div>
    </section>
  </main>
</template>
