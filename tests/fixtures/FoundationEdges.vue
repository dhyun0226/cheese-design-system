<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import {
  CommentThread,
  ExportDialog,
  FilePreview,
  FormPage,
  FormSection,
  ImportWizard,
  OrganizationTreeSelect,
  SavedViews,
  SortableList,
  type CommentItem,
  type ExportColumn,
  type ExportFormat,
  type ExportScope,
  type ExportSelection,
  type ImportContext,
  type ImportField,
  type ImportIssue,
  type ImportParsedData,
  type ImportResult,
  type ImportRow,
  type OrganizationNode,
  type PreviewFile,
  type SavedView,
  type SortableListItem,
} from "@cheese/vue";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (cause: unknown) => void;
};
type SignalRequest<T> = Deferred<T> & { signal: AbortSignal };
type ImportRequest = SignalRequest<ImportResult> & { rows: ImportRow[] };
type ExportRequest = SignalRequest<void> & { settled: boolean };

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const params = new URLSearchParams(location.search);
const fixtureCase = params.get("case") ?? "import";
const lockMode = params.get("lock") ?? "page-pending";
const signalRevision = ref(0);
function observeSignal(signal: AbortSignal) {
  signal.addEventListener("abort", () => signalRevision.value++, {
    once: true,
  });
}

const fieldRevision = ref(0);
const schemaChanged = ref(false);
const fields = computed<ImportField[]>(() => {
  void fieldRevision.value;
  return [
    {
      id: "name",
      label: schemaChanged.value ? "Renamed person" : "Name",
      required: true,
    },
  ];
});
const parseCount = ref(0);
const importCount = ref(0);
const importBatches = ref<number[][]>([]);
// Shallow refs keep browser AbortSignals and deferred callbacks unproxied.
const pendingParse = shallowRef<SignalRequest<ImportParsedData>>();
const lastParse = shallowRef<SignalRequest<ImportParsedData>>();
const pendingImport = shallowRef<ImportRequest>();
const lastImport = shallowRef<ImportRequest>();
const parseAborted = computed(() => {
  void signalRevision.value;
  return lastParse.value?.signal.aborted ?? false;
});
const importAborted = computed(() => {
  void signalRevision.value;
  return lastImport.value?.signal.aborted ?? false;
});

function parse(_file: File, { signal }: ImportContext) {
  const request = { ...deferred<ImportParsedData>(), signal };
  pendingParse.value = request;
  lastParse.value = request;
  parseCount.value++;
  observeSignal(signal);
  return request.promise;
}
function resolveParse() {
  const request = pendingParse.value;
  if (!request) return;
  pendingParse.value = undefined;
  request.resolve({
    columns: ["name"],
    rows: [{ name: "Alpha" }, { name: "Beta" }],
  });
}
function validate(): Promise<ImportIssue[]> {
  return Promise.resolve([]);
}
function importRows(rows: ImportRow[], { signal }: ImportContext) {
  const request = { ...deferred<ImportResult>(), signal, rows };
  pendingImport.value = request;
  lastImport.value = request;
  importCount.value++;
  importBatches.value = [...importBatches.value, rows.map((row) => row.row)];
  observeSignal(signal);
  return request.promise;
}
function resolveImport(retry = false) {
  const request = pendingImport.value;
  if (!request) return;
  pendingImport.value = undefined;
  request.resolve(
    retry
      ? { succeededRows: request.rows.map((row) => row.row), failures: [] }
      : {
          succeededRows: [1],
          failures: [{ row: 2, field: "name", message: "Retry Beta" }],
        },
  );
}
function rejectImport() {
  const request = pendingImport.value;
  if (!request) return;
  pendingImport.value = undefined;
  request.reject(new Error("Uncertain import outcome"));
}

const views = ref<SavedView[]>([
  { id: "a", label: "View A" },
  { id: "b", label: "View B" },
]);
const selectedView = ref("a");
const selectEvents = ref<string[]>([]);
const deleteCount = ref(0);
const pendingDelete = shallowRef<Deferred<void>>();
function selectView(value: string) {
  selectedView.value = value;
  selectEvents.value = [...selectEvents.value, value];
}
function saveView() {}
async function removeView(id: string) {
  const request = deferred<void>();
  pendingDelete.value = request;
  deleteCount.value++;
  await request.promise;
  views.value = views.value.filter((view) => view.id !== id);
}
function resolveDelete() {
  const request = pendingDelete.value;
  if (!request) return;
  pendingDelete.value = undefined;
  request.resolve();
}

const exportOpen = ref(false);
const exportColumns: ExportColumn[] = [{ id: "name", label: "Name" }];
const exportScopes: ExportScope[] = [
  { value: "current", label: "Current rows" },
];
const exportFormats: ExportFormat[] = [{ value: "csv", label: "CSV" }];
const exportCount = ref(0);
const closeRequests = ref(0);
const exportRevision = ref(0);
const exportRequests: ExportRequest[] = [];
const exportAborted = computed(() => {
  void signalRevision.value;
  void exportCount.value;
  return exportRequests[0]?.signal.aborted ?? false;
});
const firstExportPending = computed(() => {
  void exportRevision.value;
  return !!exportRequests[0] && !exportRequests[0].settled;
});
const latestExportPending = computed(() => {
  void exportRevision.value;
  const request = exportRequests.at(-1);
  return !!request && !request.settled;
});
function updateExportOpen(value: boolean) {
  if (!value) closeRequests.value++;
}
function exportData(_selection: ExportSelection, { signal }: ImportContext) {
  const request = { ...deferred<void>(), signal, settled: false };
  exportRequests.push(request);
  exportCount.value++;
  exportRevision.value++;
  observeSignal(signal);
  return request.promise;
}
function resolveExport(first = false) {
  const request = first ? exportRequests[0] : exportRequests.at(-1);
  if (!request || request.settled) return;
  request.settled = true;
  exportRevision.value++;
  request.resolve();
}

const comments: CommentItem[] = [
  {
    id: "one",
    author: "Alex",
    body: "Original comment",
    time: "Today",
    canEdit: true,
    canDelete: true,
    canReply: true,
  },
];
const replyCount = ref(0);
const editCount = ref(0);
const commentDeleteCount = ref(0);
const pendingReply = shallowRef<Deferred<void>>();
function reply() {
  const request = deferred<void>();
  pendingReply.value = request;
  replyCount.value++;
  return request.promise;
}
function settleReply(reject = false) {
  const request = pendingReply.value;
  if (!request) return;
  pendingReply.value = undefined;
  if (reject) request.reject(new Error("Reply rejected"));
  else request.resolve();
}
function editComment() {
  editCount.value++;
}
function deleteComment() {
  commentDeleteCount.value++;
}

const locked = ref(false);
const sortItems = ref<SortableListItem[]>([
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
]);
const reorderCount = ref(0);
const selectedOrganizations = ref<string[]>([]);
const organizationCount = ref(0);
const organizationNodes: OrganizationNode[] = [
  { id: "a", label: "Team A" },
  { id: "b", label: "Team B" },
];
function reorder(items: SortableListItem[]) {
  sortItems.value = items;
  reorderCount.value++;
}
function selectOrganizations(ids: string[]) {
  selectedOrganizations.value = ids;
  organizationCount.value++;
}

const previewOpen = ref(false);
const mediaKind = ref<PreviewFile["kind"]>("image");
const mediaDescription = ref<string>();
const media = computed<PreviewFile>(() => ({
  id: "media",
  name: "Edge media",
  kind: mediaKind.value,
  url: new URL("/__foundation_edge_media__", location.origin).href,
  status: "ready",
  description: mediaDescription.value,
}));
</script>

<template>
  <main
    class="cheese-root cheese-stack"
    data-testid="foundation-edges"
    data-framework="vue"
    style="max-width: 880px; margin: 24px auto; padding: 16px"
  >
    <h1>Foundation edge cases</h1>
    <section v-if="fixtureCase === 'import'" data-testid="import-fixture">
      <button
        type="button"
        data-testid="rerender-fields"
        @click="fieldRevision++"
      >
        Recreate equivalent fields
      </button>
      <button
        type="button"
        data-testid="change-schema"
        @click="schemaChanged = true"
      >
        Change schema
      </button>
      <button
        type="button"
        data-testid="resolve-parse"
        :disabled="!pendingParse"
        @click="resolveParse"
      >
        Resolve parse
      </button>
      <button
        type="button"
        data-testid="resolve-import"
        :disabled="!pendingImport"
        @click="resolveImport()"
      >
        Resolve import
      </button>
      <button
        type="button"
        data-testid="reject-import"
        :disabled="!pendingImport"
        @click="rejectImport"
      >
        Reject import
      </button>
      <button
        type="button"
        data-testid="resolve-retry"
        :disabled="!pendingImport"
        @click="resolveImport(true)"
      >
        Resolve retry
      </button>
      <output data-testid="parse-count">{{ parseCount }}</output>
      <output data-testid="import-count">{{ importCount }}</output>
      <output data-testid="import-batches">{{
        JSON.stringify(importBatches)
      }}</output>
      <output data-testid="parse-aborted">{{ String(parseAborted) }}</output>
      <output data-testid="import-aborted">{{ String(importAborted) }}</output>
      <output data-testid="field-revision">{{ fieldRevision }}</output>
      <output data-testid="schema-label">{{ fields[0].label }}</output>
      <ImportWizard
        title="Edge import"
        :fields="fields"
        :parse="parse"
        :validate="validate"
        :import-rows="importRows"
      />
    </section>

    <section v-else-if="fixtureCase === 'saved'" data-testid="saved-fixture">
      <button type="button" data-testid="select-b" @click="selectedView = 'b'">
        Parent selects B
      </button>
      <button
        type="button"
        data-testid="resolve-delete"
        :disabled="!pendingDelete"
        @click="resolveDelete"
      >
        Resolve delete
      </button>
      <output data-testid="selected-view">{{ selectedView }}</output>
      <output data-testid="select-events">{{
        JSON.stringify(selectEvents)
      }}</output>
      <output data-testid="delete-count">{{ deleteCount }}</output>
      <SavedViews
        label="Edge views"
        :views="views"
        :model-value="selectedView"
        :save="saveView"
        :remove="removeView"
        @update:model-value="selectView"
      />
    </section>

    <section v-else-if="fixtureCase === 'export'" data-testid="export-fixture">
      <button
        type="button"
        data-testid="open-export"
        @click="exportOpen = true"
      >
        Open export
      </button>
      <button
        type="button"
        data-testid="resolve-export"
        :disabled="!latestExportPending"
        @click="resolveExport()"
      >
        Resolve export
      </button>
      <button
        type="button"
        data-testid="resolve-first-export"
        :disabled="!firstExportPending"
        @click="resolveExport(true)"
      >
        Resolve first export
      </button>
      <output data-testid="export-count">{{ exportCount }}</output>
      <output data-testid="export-aborted">{{ String(exportAborted) }}</output>
      <output data-testid="close-requests">{{ closeRequests }}</output>
      <ExportDialog
        title="Edge export"
        :open="exportOpen"
        :columns="exportColumns"
        :scopes="exportScopes"
        :formats="exportFormats"
        :export-data="exportData"
        @update:open="updateExportOpen"
      />
    </section>

    <section
      v-else-if="fixtureCase === 'comments'"
      data-testid="comments-fixture"
    >
      <button
        type="button"
        data-testid="reject-reply"
        :disabled="!pendingReply"
        @click="settleReply(true)"
      >
        Reject reply
      </button>
      <button
        type="button"
        data-testid="resolve-reply"
        :disabled="!pendingReply"
        @click="settleReply()"
      >
        Resolve reply
      </button>
      <output data-testid="reply-count">{{ replyCount }}</output>
      <output data-testid="edit-count">{{ editCount }}</output>
      <output data-testid="delete-count">{{ commentDeleteCount }}</output>
      <CommentThread
        label="Edge comments"
        :items="comments"
        :on-reply="reply"
        :on-edit="editComment"
        :on-delete="deleteComment"
      />
    </section>

    <section v-else-if="fixtureCase === 'form'" data-testid="form-fixture">
      <button type="button" data-testid="lock-form" @click="locked = true">
        Lock form
      </button>
      <button type="button" data-testid="unlock-form" @click="locked = false">
        Unlock form
      </button>
      <output data-testid="lock-state">{{ String(locked) }}</output>
      <output data-testid="reorder-count">{{ reorderCount }}</output>
      <output data-testid="sort-order">{{
        JSON.stringify(sortItems.map((item) => item.id))
      }}</output>
      <output data-testid="selected-organizations">{{
        JSON.stringify(selectedOrganizations)
      }}</output>
      <output data-testid="organization-count">{{ organizationCount }}</output>
      <FormPage
        title="Edge form"
        :pending="lockMode === 'page-pending' && locked"
        :disabled="lockMode === 'page-disabled' && locked"
      >
        <FormSection
          title="Nested section"
          :disabled="lockMode === 'section-disabled' ? locked : false"
        >
          <SortableList
            label="Edge order"
            :items="sortItems"
            @update:items="reorder"
          />
          <OrganizationTreeSelect
            label="Edge organization"
            :nodes="organizationNodes"
            :multiple="true"
            :model-value="selectedOrganizations"
            @update:model-value="selectOrganizations"
          />
        </FormSection>
      </FormPage>
    </section>

    <section v-else-if="fixtureCase === 'media'" data-testid="media-fixture">
      <button
        type="button"
        data-testid="open-preview"
        @click="previewOpen = true"
      >
        Open preview
      </button>
      <button
        type="button"
        data-testid="correct-media-kind"
        @click="mediaKind = 'video'"
      >
        Correct media kind
      </button>
      <button
        type="button"
        data-testid="update-media-description"
        @click="mediaDescription = 'Updated description'"
      >
        Update media description
      </button>
      <output data-testid="media-kind">{{ mediaKind }}</output>
      <FilePreview
        :open="previewOpen"
        :item="media"
        @update:open="previewOpen = $event"
      />
    </section>
  </main>
</template>
