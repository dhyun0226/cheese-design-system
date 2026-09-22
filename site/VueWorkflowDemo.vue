<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import {
  AttachmentList,
  Badge,
  Button,
  ChevronLeft,
  DataTable,
  DateField,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  ErrorSummary,
  Field,
  Input,
  Select,
  type AttachmentItem,
  type AttachmentRemoveHandler,
  type ErrorSummaryItem,
  type TableQuery,
} from "@cheese/vue";
import {
  defaultWorkflowQuery,
  demoWait,
  initialAttachments,
  initialRecords,
  readWorkflowLocation,
  saveWorkflow,
  statuses,
  teams,
  validateWorkflow,
  workflowColumns,
  WorkflowSaveError,
  writeWorkflowLocation,
  type WorkflowDraft,
  type WorkflowErrors,
} from "./workflow-demo";

const initialLocation = readWorkflowLocation();
const records = ref(initialRecords());
const query = ref<TableQuery>(initialLocation.query);
const statusFilter = ref(initialLocation.status);
const stage = ref<"list" | "edit" | "saved">("list");
const recordId = ref("");
const draft = ref<WorkflowDraft>({
  name: "",
  team: "",
  deadline: "",
  status: "",
});
const errors = ref<WorkflowErrors>({});
const saveError = ref("");
const pending = ref(false);
const response = ref("retry");
const attemptedSave = ref(false);
const discardOpen = ref(false);
const summary = ref<{ focus: () => void }>();
const listHeading = ref<HTMLHeadingElement>();
const successHeading = ref<HTMLHeadingElement>();
const attachments = ref<Record<string, AttachmentItem[]>>({});
const failedDeletes = new Set<string>();
let saveController: AbortController | undefined;
let revision = 0;
let mounted = true;

const fieldIds: Record<keyof WorkflowDraft, string> = {
  name: "vue-workflow-name",
  team: "vue-workflow-team",
  deadline: "vue-workflow-deadline",
  status: "vue-workflow-status",
};
const filteredRecords = computed(() =>
  records.value.filter(
    (record) =>
      statusFilter.value === "all" || record.status === statusFilter.value,
  ),
);
const dirty = computed(() => {
  const record = records.value.find((item) => item.id === recordId.value);
  return (
    !!record &&
    (Object.keys(fieldIds) as (keyof WorkflowDraft)[]).some(
      (key) => draft.value[key] !== record[key],
    )
  );
});
function beforeUnload(event: BeforeUnloadEvent) {
  if (stage.value !== "edit" || !dirty.value) return;
  event.preventDefault();
  event.returnValue = "";
}
const summaryErrors = computed<ErrorSummaryItem[]>(() => [
  ...(Object.keys(fieldIds) as (keyof WorkflowDraft)[]).flatMap((key) =>
    errors.value[key]
      ? [{ id: key, message: errors.value[key]!, targetId: fieldIds[key] }]
      : [],
  ),
  ...(saveError.value ? [{ id: "save", message: saveError.value }] : []),
]);
const currentAttachments = computed(
  () => attachments.value[recordId.value] ?? [],
);
const removeAttachment = computed<AttachmentRemoveHandler>(() => {
  // Each operation retains its owner even if another record is opened later.
  const ownerId = recordId.value;
  return async (item, { signal }) => {
    await demoWait(signal);
    if (signal.aborted || !mounted) return;
    const key = `${ownerId}:${item.id}`;
    if (!failedDeletes.has(key)) {
      failedDeletes.add(key);
      throw new Error("파일을 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
    attachments.value = {
      ...attachments.value,
      [ownerId]: (attachments.value[ownerId] ?? []).filter(
        (file) => file.id !== item.id,
      ),
    };
  };
});

watch([query, statusFilter], ([nextQuery, status]) =>
  writeWorkflowLocation(nextQuery, status),
);
function restoreLocation() {
  const restored = readWorkflowLocation();
  query.value = restored.query;
  statusFilter.value = restored.status;
}
onMounted(() => {
  window.addEventListener("popstate", restoreLocation);
  window.addEventListener("beforeunload", beforeUnload);
});
onBeforeUnmount(() => {
  mounted = false;
  revision++;
  saveController?.abort();
  window.removeEventListener("popstate", restoreLocation);
  window.removeEventListener("beforeunload", beforeUnload);
});

function filterStatus(value: string) {
  statusFilter.value = value;
  query.value = { ...query.value, page: 1 };
}
function resetFilters() {
  statusFilter.value = "all";
  query.value = defaultWorkflowQuery();
}
async function editRecord(id: string) {
  const record = records.value.find((item) => item.id === id);
  if (!record || pending.value) return;
  revision++;
  saveController?.abort();
  recordId.value = id;
  draft.value = {
    name: record.name,
    team: record.team,
    deadline: record.deadline,
    status: record.status,
  };
  errors.value = {};
  saveError.value = "";
  attemptedSave.value = false;
  if (!attachments.value[id])
    attachments.value = { ...attachments.value, [id]: initialAttachments() };
  stage.value = "edit";
  await nextTick();
  document.getElementById(fieldIds.name)?.focus();
}
function updateField(
  key: keyof WorkflowDraft,
  value: string | number | undefined,
) {
  if (pending.value) return;
  draft.value = { ...draft.value, [key]: String(value ?? "") };
  if (errors.value[key]) {
    const next = { ...errors.value };
    delete next[key];
    errors.value = next;
  }
}
async function focusSummary() {
  await nextTick();
  if (mounted) summary.value?.focus();
}
async function save() {
  if (pending.value || stage.value !== "edit") return;
  errors.value = validateWorkflow(draft.value);
  saveError.value = "";
  if (Object.keys(errors.value).length) {
    await focusSummary();
    return;
  }
  const controller = new AbortController();
  saveController?.abort();
  saveController = controller;
  const request = ++revision;
  const ownerId = recordId.value;
  const unavailable = response.value === "retry" && !attemptedSave.value;
  attemptedSave.value = true;
  pending.value = true;
  const isCurrent = () =>
    mounted && !controller.signal.aborted && revision === request;
  try {
    const saved = await saveWorkflow(
      { ...draft.value },
      controller.signal,
      unavailable,
    );
    if (!isCurrent()) return;
    records.value = records.value.map((record) =>
      record.id === ownerId ? { ...record, ...saved } : record,
    );
    draft.value = saved;
    stage.value = "saved";
    await nextTick();
    if (isCurrent()) successHeading.value?.focus();
  } catch (error) {
    if (!isCurrent()) return;
    if (error instanceof WorkflowSaveError && Object.keys(error.fields).length)
      errors.value = error.fields;
    else
      saveError.value =
        error instanceof Error
          ? error.message
          : "저장하지 못했습니다. 작성한 내용은 유지됩니다. 다시 시도해 주세요.";
    await focusSummary();
  } finally {
    if (isCurrent()) {
      pending.value = false;
      saveController = undefined;
    }
  }
}
async function returnToList() {
  if (pending.value) return;
  revision++;
  saveController?.abort();
  discardOpen.value = false;
  stage.value = "list";
  await nextTick();
  if (mounted) listHeading.value?.focus();
}
function cancel() {
  if (pending.value) return;
  if (dirty.value) discardOpen.value = true;
  else void returnToList();
}
function restoreDialogFocus(event: Event) {
  event.preventDefault();
  void nextTick(() => {
    if (!mounted) return;
    if (stage.value === "list") listHeading.value?.focus();
    else document.getElementById("vue-workflow-cancel")?.focus();
  });
}
</script>

<template>
  <main class="cheese-root vue-page">
    <header class="vue-header">
      <a href="./index.html#/workflows"
        ><ChevronLeft class="cheese-inline-icon" aria-hidden="true" /> CHEESE
        문서</a
      >
      <a href="./index.html#/workflows">React 업무 흐름</a>
      <Badge>Vue · 업무 흐름</Badge>
    </header>
    <div class="page-heading">
      <span class="eyebrow">CONNECTED WORKFLOW · VUE</span>
      <h1>목록에서 저장까지.</h1>
      <p>
        검색 조건을 유지하며 업무를 수정하고, 입력 오류와 저장 실패를 복구하는
        흐름을 확인하세요.
      </p>
    </div>
    <section class="workflow-demo" aria-label="Vue 업무 흐름 체험">
      <div class="workflow-guide">
        <Badge tone="brand">목록 → 수정 → 저장 → 복귀</Badge>
        <p>
          가상 데이터로 실패와 복구를 체험합니다. 변경 내용은 이 화면에만
          남습니다.
        </p>
        <a href="./index.html#/workflows">같은 흐름을 React로 보기 ↗</a>
      </div>
      <section
        v-if="stage === 'list'"
        class="workflow-panel"
        aria-labelledby="vue-workflow-list-title"
      >
        <h2 id="vue-workflow-list-title" ref="listHeading" tabindex="-1">
          평가 업무 목록
        </h2>
        <div class="workflow-toolbar">
          <Select
            label="상태 필터"
            :model-value="statusFilter"
            :options="[{ value: 'all', label: '전체 상태' }, ...statuses]"
            @update:model-value="filterStatus"
          />
          <Button variant="weak" @click="resetFilters">조건 초기화</Button>
        </div>
        <DataTable
          v-model:query="query"
          label="평가 업무"
          :columns="workflowColumns"
          :rows="filteredRecords"
          :get-row-id="(row) => String(row.id)"
          :row-label="(row) => String(row.name)"
        >
          <template #cell="{ row, column }">
            <button
              v-if="column.key === 'name'"
              type="button"
              class="workflow-cell-link"
              :aria-label="`${row.name} 수정`"
              @click="editRecord(String(row.id))"
            >
              {{ row.name }}
            </button>
            <Badge v-else-if="column.key === 'status'">{{ row.status }}</Badge>
            <template v-else>{{ String(row[column.key] ?? "—") }}</template>
          </template>
        </DataTable>
        <p class="workflow-note">
          검색·정렬·페이지·상태 조건은 주소에 반영됩니다. 새로고침하거나 수정 후
          돌아와도 같은 조건을 유지합니다.
        </p>
      </section>
      <section
        v-else-if="stage === 'edit'"
        class="workflow-panel"
        aria-labelledby="vue-workflow-edit-title"
      >
        <h2 id="vue-workflow-edit-title">업무 수정</h2>
        <form
          aria-label="업무 수정"
          novalidate
          :aria-busy="pending || undefined"
          @submit.prevent="save"
        >
          <div class="cheese-stack">
            <ErrorSummary ref="summary" :errors="summaryErrors" />
            <div class="workflow-form-grid">
              <Field
                label="업무명"
                :id="fieldIds.name"
                :error="errors.name"
                required
              >
                <Input
                  :model-value="draft.name"
                  name="name"
                  :maxlength="80"
                  :disabled="pending"
                  autocomplete="off"
                  @update:model-value="updateField('name', $event)"
                />
              </Field>
              <Select
                :id="fieldIds.team"
                label="담당 조직"
                :model-value="draft.team"
                name="team"
                :options="teams"
                :error="errors.team"
                :disabled="pending"
                required
                @update:model-value="updateField('team', $event)"
              />
              <DateField
                :id="fieldIds.deadline"
                label="업무 마감일"
                :model-value="draft.deadline"
                name="deadline"
                :error="errors.deadline"
                :disabled="pending"
                required
                @update:model-value="updateField('deadline', $event)"
              />
              <Select
                :id="fieldIds.status"
                label="진행 상태"
                :model-value="draft.status"
                name="status"
                :options="statuses"
                :error="errors.status"
                :disabled="pending"
                required
                @update:model-value="updateField('status', $event)"
              />
            </div>
            <div class="workflow-actions">
              <Button
                id="vue-workflow-cancel"
                variant="weak"
                :disabled="pending"
                @click="cancel"
                >수정 취소</Button
              >
              <Button type="submit" variant="accent" :loading="pending">{{
                pending ? "저장 중" : saveError ? "다시 저장" : "변경 내용 저장"
              }}</Button>
            </div>
            <span class="cheese-sr-only" role="status">{{
              pending ? "변경 내용을 저장하고 있습니다." : ""
            }}</span>
          </div>
        </form>
        <details class="workflow-note">
          <summary>실패 복구 체험 안내</summary>
          <Select
            v-model="response"
            label="저장 응답"
            :disabled="pending"
            :options="[
              { value: 'retry', label: '첫 저장 실패 후 재시도' },
              { value: 'success', label: '정상 저장' },
            ]"
          />
          <p>
            업무명을 “중복 평가”로 입력하면 서버 필드 오류를 확인할 수 있습니다.
            각 파일의 첫 삭제는 실패하며, 다시 시도하면 삭제됩니다.
          </p>
        </details>
        <div class="cheese-stack">
          <AttachmentList
            :key="recordId"
            label="저장된 첨부"
            :items="currentAttachments"
            :remove="removeAttachment"
          />
          <p class="workflow-note">
            각 파일의 첫 삭제는 실패하며 재시도하면 삭제됩니다. 저장된 파일
            삭제는 업무 수정과 별개로 반영되어, 수정 취소나 저장 실패로 복구되지
            않습니다.
          </p>
        </div>
      </section>
      <section
        v-else
        class="workflow-panel workflow-success"
        aria-labelledby="vue-workflow-success-title"
      >
        <Badge tone="positive">저장 완료</Badge>
        <h3 id="vue-workflow-success-title" ref="successHeading" tabindex="-1">
          저장 완료
        </h3>
        <p>
          <strong>{{ draft.name }}</strong
          >의 변경 내용을 저장했습니다.
        </p>
        <p class="workflow-note">
          {{ draft.team }} · {{ draft.deadline }} · {{ draft.status }}
        </p>
        <Button variant="accent" :disabled="pending" @click="returnToList"
          >목록으로 돌아가기</Button
        >
      </section>
      <DialogRoot v-model:open="discardOpen">
        <DialogContent @close-auto-focus="restoreDialogFocus">
          <DialogTitle>변경 내용을 버릴까요?</DialogTitle>
          <DialogDescription
            >저장하지 않은 업무 수정 내용은 사라집니다. 이미 삭제한 첨부파일은
            복구되지 않습니다.</DialogDescription
          >
          <div class="cheese-dialog-actions">
            <Button variant="weak" @click="discardOpen = false"
              >계속 작성</Button
            >
            <Button variant="critical" @click="returnToList"
              >변경 사항 버리기</Button
            >
          </div>
        </DialogContent>
      </DialogRoot>
    </section>
  </main>
</template>
