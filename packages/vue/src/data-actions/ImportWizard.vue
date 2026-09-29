<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from "vue";
import { Check, FileUp } from "@lucide/vue";
import Button from "../Button.vue";
import Select from "../Select.vue";
import { CheckboxRoot, CheckboxIndicator } from "../styled";
import type {
  ImportContext,
  ImportField,
  ImportIssue,
  ImportParsedData,
  ImportResult,
  ImportRow,
} from "./types";

const props = withDefaults(
  defineProps<{
    fields: ImportField[];
    parse: (file: File, context: ImportContext) => Promise<ImportParsedData>;
    validate: (
      rows: ImportRow[],
      context: ImportContext,
    ) => Promise<ImportIssue[]>;
    importRows: (
      rows: ImportRow[],
      context: ImportContext,
    ) => Promise<ImportResult>;
    accept?: string;
    maxFileBytes?: number;
    maxRows?: number;
    title?: string;
  }>(),
  {
    accept: ".csv,.xlsx",
    maxFileBytes: 10_485_760,
    maxRows: 10_000,
    title: "데이터 가져오기",
  },
);

const id = useId();
const fileInput = ref<HTMLInputElement>();
const fileName = ref("");
const columns = ref<string[]>([]);
const sourceRows = ref<Record<string, string>[]>([]);
const mapping = ref<Record<string, string>>({});
const validatedRows = ref<ImportRow[]>([]);
const issues = ref<ImportIssue[]>([]);
const successes = ref<number[]>([]);
const failedRows = ref<number[]>([]);
const error = ref("");
const unknownOutcome = ref(false);
const importDispatched = ref(false);
const configurationChanged = ref(false);
const reconciled = ref(false);
const submittedSchema = ref<ImportField[]>([]);
const phase = ref<"file" | "mapping" | "review" | "result">("file");
const busy = ref<"" | "parse" | "validate" | "import">("");
let revision = 0;
let controller: AbortController | undefined;
const requiresReconciliation = computed(
  () => configurationChanged.value || unknownOutcome.value,
);
const canReset = computed(
  () =>
    busy.value !== "import" &&
    (!requiresReconciliation.value || reconciled.value),
);
const canChooseFile = computed(
  () =>
    busy.value !== "import" &&
    !importDispatched.value &&
    !requiresReconciliation.value,
);
const displayFields = computed(() =>
  importDispatched.value ? submittedSchema.value : props.fields,
);
const schemaSignature = computed(() =>
  JSON.stringify([
    props.fields.map((field) => [
      field.id,
      field.label,
      Boolean(field.required),
    ]),
    props.maxFileBytes,
    props.maxRows,
  ]),
);

function cancel() {
  revision += 1;
  controller?.abort();
  controller = undefined;
  busy.value = "";
}
function operation(kind: typeof busy.value) {
  cancel();
  controller = new AbortController();
  busy.value = kind;
  return { version: revision, context: { signal: controller.signal } };
}
function current(version: number) {
  return version === revision && !controller?.signal.aborted;
}
function reset() {
  cancel();
  fileName.value = "";
  columns.value = [];
  sourceRows.value = [];
  mapping.value = {};
  validatedRows.value = [];
  issues.value = [];
  successes.value = [];
  failedRows.value = [];
  error.value = "";
  unknownOutcome.value = false;
  importDispatched.value = false;
  configurationChanged.value = false;
  reconciled.value = false;
  submittedSchema.value = [];
  phase.value = "file";
  if (fileInput.value) fileInput.value.value = "";
}
function resetFromUser() {
  if (canReset.value) reset();
}
function openFilePicker() {
  if (canChooseFile.value && !fieldError.value) fileInput.value?.click();
}
function acknowledgeReconciliation(value: boolean) {
  if (busy.value !== "import") reconciled.value = value;
}
watch(
  schemaSignature,
  () => {
    if (importDispatched.value) {
      // A dispatched server write cannot safely be undone by a new props object.
      // Keep its request, accounting and original field schema until reconciled.
      configurationChanged.value = true;
      reconciled.value = false;
    } else {
      reset();
    }
  },
  { flush: "sync" },
);
onUnmounted(cancel);

const fieldError = computed(() => {
  const ids = props.fields.map((field) => field.id);
  if (
    !ids.length ||
    ids.some((field) => !field.trim()) ||
    new Set(ids).size !== ids.length
  )
    return "서로 다른 ID를 가진 등록 항목을 설정해 주세요.";
  return "";
});
const columnOptions = computed(() => [
  { value: "__cheese_unmapped__", label: "연결하지 않음" },
  ...columns.value.map((column, index) => ({
    value: String(index),
    label: column,
  })),
]);
const preview = computed(() => sourceRows.value.slice(0, 5));
const step = computed(
  () => ({ file: 0, mapping: 1, review: 2, result: 3 })[phase.value],
);

async function chooseFile(event: Event) {
  if (!canChooseFile.value) return;
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  reset();
  fileName.value = file.name;
  if (fieldError.value) {
    error.value = fieldError.value;
    return;
  }
  if (
    !Number.isFinite(props.maxFileBytes) ||
    props.maxFileBytes <= 0 ||
    file.size > props.maxFileBytes
  ) {
    error.value = "허용된 파일 크기를 초과했습니다.";
    return;
  }
  if (!file.size) {
    error.value = "빈 파일은 등록할 수 없습니다.";
    return;
  }
  const { version, context } = operation("parse");
  try {
    const data = await props.parse(file, context);
    if (!current(version)) return;
    if (
      !data ||
      !Array.isArray(data.columns) ||
      !Array.isArray(data.rows) ||
      !data.columns.length
    )
      throw new Error("파일의 열과 행을 확인할 수 없습니다.");
    const headers = data.columns;
    if (
      headers.some((column) => typeof column !== "string" || !column.trim()) ||
      new Set(headers.map((column) => column.trim())).size !== headers.length
    )
      throw new Error("비어 있거나 중복된 열 이름을 수정해 주세요.");
    if (
      !Number.isInteger(props.maxRows) ||
      props.maxRows < 1 ||
      !data.rows.length ||
      data.rows.length > props.maxRows
    )
      throw new Error(`등록 가능한 데이터 행 수는 1~${props.maxRows}개입니다.`);
    for (const row of data.rows) {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        headers.some(
          (column) =>
            !Object.hasOwn(row, column) || typeof row[column] !== "string",
        ) ||
        headers.every((column) => !row[column]!.trim())
      )
        throw new Error("비어 있거나 올바르지 않은 데이터 행을 수정해 주세요.");
    }
    columns.value = [...headers];
    sourceRows.value = data.rows.map((row) => ({ ...row }));
    mapping.value = Object.fromEntries(
      props.fields.map((field) => {
        const index = headers.findIndex(
          (header) => header === field.id || header === field.label,
        );
        return [field.id, index < 0 ? "__cheese_unmapped__" : String(index)];
      }),
    );
    phase.value = "mapping";
  } catch (cause) {
    if (current(version))
      error.value =
        cause instanceof Error
          ? cause.message
          : "파일을 읽지 못했습니다. 다시 선택해 주세요.";
  } finally {
    if (current(version)) busy.value = "";
  }
}
function setMapping(field: string, value: string) {
  if (busy.value || importDispatched.value || requiresReconciliation.value)
    return;
  cancel();
  mapping.value = { ...mapping.value, [field]: value };
  validatedRows.value = [];
  issues.value = [];
  error.value = "";
  phase.value = "mapping";
}
function validIssues(
  value: unknown,
  submitted: Set<number>,
  fieldIds: Set<string>,
): value is ImportIssue[] {
  return (
    Array.isArray(value) &&
    value.every(
      (issue) =>
        issue &&
        typeof issue === "object" &&
        Number.isInteger(issue.row) &&
        submitted.has(issue.row) &&
        typeof issue.message === "string" &&
        issue.message.trim() &&
        (issue.field === undefined || fieldIds.has(issue.field)),
    )
  );
}
function cloneRows(rows: ImportRow[]) {
  return rows.map((row) => ({ row: row.row, values: { ...row.values } }));
}
async function validateMapping() {
  if (
    busy.value ||
    fieldError.value ||
    !sourceRows.value.length ||
    importDispatched.value ||
    requiresReconciliation.value
  )
    return;
  error.value = "";
  issues.value = [];
  validatedRows.value = [];
  const missing = props.fields.filter(
    (field) =>
      field.required &&
      (mapping.value[field.id] === "__cheese_unmapped__" ||
        mapping.value[field.id] === undefined),
  );
  if (missing.length) {
    error.value = `필수 항목을 연결해 주세요: ${missing.map((field) => field.label).join(", ")}`;
    return;
  }
  const rows: ImportRow[] = sourceRows.value.map((source, index) => ({
    row: index + 1,
    values: Object.fromEntries(
      props.fields.map((field) => {
        const mapped = mapping.value[field.id];
        const column =
          mapped !== undefined && mapped !== "__cheese_unmapped__"
            ? columns.value[Number(mapped)]
            : undefined;
        return [field.id, column === undefined ? "" : source[column]!];
      }),
    ),
  }));
  const requiredIssues: ImportIssue[] = rows.flatMap((row) =>
    props.fields
      .filter((field) => field.required && !row.values[field.id]?.trim())
      .map((field) => ({
        row: row.row,
        field: field.id,
        message: `${field.label} 값이 필요합니다.`,
      })),
  );
  if (requiredIssues.length) {
    issues.value = requiredIssues;
    return;
  }
  const { version, context } = operation("validate");
  const validationFieldIds = new Set(props.fields.map((field) => field.id));
  try {
    const result = await props.validate(cloneRows(rows), context);
    if (!current(version)) return;
    if (
      !validIssues(
        result,
        new Set(rows.map((row) => row.row)),
        validationFieldIds,
      )
    )
      throw new Error("검증 결과의 행 번호 또는 항목이 올바르지 않습니다.");
    issues.value = result;
    if (!result.length) {
      validatedRows.value = rows;
      phase.value = "review";
    }
  } catch (cause) {
    if (current(version))
      error.value =
        cause instanceof Error
          ? cause.message
          : "데이터 검증에 실패했습니다. 다시 검증해 주세요.";
  } finally {
    if (current(version)) busy.value = "";
  }
}
async function submit(retry = false) {
  if (busy.value || requiresReconciliation.value || !validatedRows.value.length)
    return;
  if (
    (!retry && phase.value !== "review") ||
    (retry && phase.value !== "result")
  )
    return;
  const rows = retry
    ? validatedRows.value.filter((row) => failedRows.value.includes(row.row))
    : validatedRows.value;
  if (!rows.length) return;
  if (!importDispatched.value)
    submittedSchema.value = props.fields.map((field) => ({ ...field }));
  const importFieldIds = new Set(
    submittedSchema.value.map((field) => field.id),
  );
  importDispatched.value = true;
  const { version, context } = operation("import");
  error.value = "";
  try {
    const result = await props.importRows(cloneRows(rows), context);
    if (!current(version)) return;
    const submitted = new Set(rows.map((row) => row.row));
    if (
      !result ||
      !Array.isArray(result.succeededRows) ||
      result.succeededRows.some(
        (row) => !Number.isInteger(row) || !submitted.has(row),
      ) ||
      new Set(result.succeededRows).size !== result.succeededRows.length ||
      !validIssues(result.failures, submitted, importFieldIds)
    )
      throw new Error("서버의 등록 결과를 확인할 수 없습니다.");
    const passed = new Set(result.succeededRows);
    const failed = new Set(result.failures.map((issue) => issue.row));
    if (
      [...failed].some((row) => passed.has(row)) ||
      passed.size + failed.size !== submitted.size
    )
      throw new Error("일부 행의 등록 결과가 누락되거나 중복되었습니다.");
    successes.value = [
      ...new Set([...successes.value, ...result.succeededRows]),
    ];
    failedRows.value = [...failed];
    issues.value = result.failures;
    phase.value = "result";
  } catch (cause) {
    if (current(version)) {
      unknownOutcome.value = true;
      reconciled.value = false;
      failedRows.value = [];
      issues.value = [];
      phase.value = "result";
      error.value = `${cause instanceof Error ? cause.message : "등록 요청에 실패했습니다."} 서버 반영 여부가 불확실합니다. 관리자에게 결과를 확인해 주세요. 중복 등록을 막기 위해 바로 재시도할 수 없습니다.`;
    }
  } finally {
    if (current(version)) busy.value = "";
  }
}
function returnToMapping() {
  if (busy.value || importDispatched.value || requiresReconciliation.value)
    return;
  phase.value = "mapping";
  validatedRows.value = [];
}
</script>

<template>
  <section
    class="cheese-data-actions cheese-data-actions-stack"
    :aria-labelledby="`${id}-title`"
    :aria-busy="Boolean(busy)"
  >
    <h2 :id="`${id}-title`" class="cheese-data-actions-title">{{ title }}</h2>
    <ol class="cheese-data-actions-steps" aria-label="등록 단계">
      <li
        v-for="(label, index) in ['파일 선택', '열 연결', '검토', '결과']"
        :key="label"
        :data-current="index === step ? '' : undefined"
        :aria-current="index === step ? 'step' : undefined"
      >
        <span aria-hidden="true">{{ index + 1 }}</span>
        {{ label }}
      </li>
    </ol>
    <div class="cheese-data-actions-file">
      <FileUp :size="24" aria-hidden="true" />
      <div>
        <strong>{{ fileName || "가져올 파일을 선택하세요" }}</strong>
        <p v-if="sourceRows.length" class="cheese-data-actions-muted">
          {{ sourceRows.length.toLocaleString() }}개 행 · {{ columns.length }}개
          열
        </p>
        <p class="cheese-data-actions-muted">
          파일 해석과 실제 등록은 연결한 서비스에서 처리합니다.
        </p>
      </div>
      <Button
        variant="weak"
        :disabled="Boolean(fieldError) || !canChooseFile"
        @click="openFilePicker"
        >{{ fileName ? "파일 변경" : "파일 선택" }}</Button
      >
      <input
        :id="`${id}-file`"
        ref="fileInput"
        type="file"
        hidden
        :accept="accept"
        :disabled="!canChooseFile"
        aria-label="등록할 파일"
        @change="chooseFile"
      />
    </div>
    <div class="cheese-data-actions-toolbar">
      <Button variant="ghost" :disabled="!canReset" @click="resetFromUser"
        >초기화</Button
      >
    </div>
    <p class="cheese-data-actions-muted">
      최대 {{ Math.round(maxFileBytes / 1024 / 1024) }}MB ·
      {{ maxRows.toLocaleString() }}행. 데이터 행 번호는 헤더를 제외한 1부터
      시작합니다.
    </p>
    <div v-if="requiresReconciliation" class="cheese-data-actions-result">
      <p
        v-if="configurationChanged"
        role="alert"
        class="cheese-data-actions-error"
      >
        등록 요청 후 항목 또는 제한 설정이 변경되었습니다. 기존 요청의 결과와
        성공 내역은 유지됩니다. 서버 처리 내역을 확인한 뒤 초기화해 주세요.
      </p>
      <p class="cheese-data-actions-muted">
        확인 전에는 파일 변경이나 추가 등록을 할 수 없습니다. 진행 중인 요청이
        끝나면 서버 결과를 확인하고 초기화해 주세요.
      </p>
      <label class="cheese-check-label" :for="`${id}-reconciled`">
        <CheckboxRoot
          :id="`${id}-reconciled`"
          :model-value="reconciled"
          :disabled="busy === 'import'"
          @update:model-value="acknowledgeReconciliation($event === true)"
        >
          <CheckboxIndicator
            ><Check :size="14" aria-hidden="true"
          /></CheckboxIndicator>
        </CheckboxRoot>
        <span>서버 처리 내역을 확인했습니다</span>
      </label>
    </div>
    <p v-if="busy" role="status" class="cheese-data-actions-status">
      {{
        busy === "parse"
          ? "파일을 읽고 있습니다."
          : busy === "validate"
            ? "데이터를 검증하고 있습니다."
            : "등록 결과를 기다리고 있습니다."
      }}
    </p>
    <p
      v-if="error || fieldError"
      role="alert"
      class="cheese-data-actions-error"
    >
      {{ error || fieldError }}
    </p>

    <fieldset
      v-if="phase === 'mapping'"
      class="cheese-data-actions-fieldset"
      :disabled="Boolean(busy)"
    >
      <legend>파일 열과 등록 항목 연결</legend>
      <div class="cheese-data-actions-map">
        <Select
          v-for="field in fields"
          :key="field.id"
          :label="`${field.label}${field.required ? ' (필수)' : ''}`"
          :options="columnOptions"
          :model-value="mapping[field.id] ?? '__cheese_unmapped__'"
          :disabled="Boolean(busy)"
          @update:model-value="setMapping(field.id, $event)"
        />
      </div>
      <Button
        :loading="busy === 'validate'"
        :disabled="Boolean(busy)"
        @click="validateMapping"
        >데이터 검증</Button
      >
    </fieldset>

    <div
      v-if="preview.length && phase !== 'result'"
      class="cheese-data-actions-summary"
    >
      <h3 class="cheese-data-actions-title">
        파일 미리보기 · 처음 {{ preview.length }}행
      </h3>
      <ol class="cheese-data-actions-list">
        <li
          v-for="(row, index) in preview"
          :key="index"
          class="cheese-data-actions-row"
        >
          <strong>{{ index + 1 }}행</strong>
          <span>{{
            columns.map((column) => `${column}: ${row[column]}`).join(" · ")
          }}</span>
        </li>
      </ol>
    </div>
    <div
      v-if="issues.length"
      class="cheese-data-actions-result"
      aria-live="polite"
    >
      <h3 class="cheese-data-actions-title">
        확인이 필요한 내용 {{ issues.length }}건
      </h3>
      <ul class="cheese-data-actions-list">
        <li
          v-for="(issue, index) in issues.slice(0, 50)"
          :key="`${issue.row}-${index}`"
          class="cheese-data-actions-error"
        >
          {{ issue.row }}행{{
            issue.field
              ? ` · ${displayFields.find((field) => field.id === issue.field)?.label ?? issue.field}`
              : ""
          }}: {{ issue.message }}
        </li>
      </ul>
      <p v-if="issues.length > 50" class="cheese-data-actions-muted">
        처음 50건만 표시합니다. 파일을 수정한 뒤 다시 선택해 주세요.
      </p>
    </div>
    <div v-if="phase === 'review'" class="cheese-data-actions-stack">
      <p role="status" class="cheese-data-actions-status">
        {{ validatedRows.length }}행의 검증을 완료했습니다. 아래 버튼을 눌러야
        실제 등록 요청을 보냅니다.
      </p>
      <div class="cheese-data-actions-toolbar">
        <Button
          variant="weak"
          :disabled="
            Boolean(busy) || importDispatched || requiresReconciliation
          "
          @click="returnToMapping"
          >열 연결 수정</Button
        >
        <Button
          :loading="busy === 'import'"
          :disabled="Boolean(busy) || requiresReconciliation"
          @click="submit()"
          >{{ validatedRows.length }}행 등록</Button
        >
      </div>
    </div>
    <div v-if="phase === 'result'" class="cheese-data-actions-result">
      <p role="status" class="cheese-data-actions-status">
        확인된 등록 성공 {{ successes.length }}행<span v-if="!unknownOutcome">
          · 실패 {{ failedRows.length }}행</span
        >
      </p>
      <Button
        v-if="failedRows.length && !unknownOutcome"
        :loading="busy === 'import'"
        :disabled="Boolean(busy) || requiresReconciliation"
        @click="submit(true)"
        >실패한 {{ failedRows.length }}행만 재시도</Button
      >
    </div>
    <p class="cheese-data-actions-muted">
      파일 해석·업무 검증·저장은 연결된 서비스가 수행합니다. 초기화나 파일
      변경으로 화면 요청을 취소해도 서버 작업이 취소되지는 않을 수 있습니다.
      서비스는 중복 요청 방지와 등록 결과 확인 기능을 제공해야 합니다.
    </p>
  </section>
</template>
