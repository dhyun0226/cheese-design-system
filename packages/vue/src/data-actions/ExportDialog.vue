<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";
import { Check } from "@lucide/vue";
import { DialogRoot } from "reka-ui";
import Button from "../Button.vue";
import Select from "../Select.vue";
import {
  CheckboxRoot,
  CheckboxIndicator,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../styled";
import type {
  ExportColumn,
  ExportScope,
  ExportFormat,
  ExportSelection,
  ImportContext,
} from "./types";

const props = withDefaults(
  defineProps<{
    open: boolean;
    columns: ExportColumn[];
    scopes: ExportScope[];
    formats: ExportFormat[];
    exportData: (
      selection: ExportSelection,
      context: ImportContext,
    ) => Promise<void>;
    title?: string;
  }>(),
  { title: "데이터 내보내기" },
);
const emit = defineEmits<{ "update:open": [value: boolean] }>();
const id = useId();
const selectedColumns = ref<string[]>([]);
const scope = ref("");
const format = ref("");
const busy = ref(false);
const error = ref("");
const status = ref("");
let controller: AbortController | undefined;
let revision = 0;
const enabledColumns = computed(() =>
  props.columns.filter((column) => !column.disabled),
);
const validColumns = computed(() =>
  [...new Set(selectedColumns.value)].filter((columnId) =>
    enabledColumns.value.some((column) => column.id === columnId),
  ),
);
const validScope = computed(() =>
  props.scopes.find((item) => !item.disabled && item.value === scope.value),
);
const validFormat = computed(() =>
  props.formats.find(
    (item) => item.value === format.value && item.value.trim(),
  ),
);
const ready = computed(
  () =>
    validColumns.value.length > 0 &&
    !!validScope.value &&
    !!validFormat.value &&
    !busy.value,
);
const configSignature = computed(() =>
  // Compare supported values, including equivalent optional disabled flags,
  // so an ordinary parent render does not cancel an in-flight request.
  JSON.stringify([
    props.columns.map((column) => [
      column.id,
      column.label,
      Boolean(column.disabled),
    ]),
    props.scopes.map((item) => [
      item.value,
      item.label,
      Boolean(item.disabled),
    ]),
    props.formats.map((item) => [item.value, item.label]),
  ]),
);
function invalidate() {
  revision++;
  controller?.abort();
  controller = undefined;
  busy.value = false;
}
function initialize() {
  invalidate();
  selectedColumns.value = enabledColumns.value.map((column) => column.id);
  scope.value = props.scopes.find((item) => !item.disabled)?.value ?? "";
  format.value = props.formats.find((item) => item.value.trim())?.value ?? "";
  error.value = "";
  status.value = "";
}
watch(
  () => props.open,
  (open) => {
    if (open) initialize();
    else invalidate();
  },
  { immediate: true },
);
watch(
  configSignature,
  () => {
    if (busy.value) {
      invalidate();
      error.value =
        "내보내기 설정이 변경되었습니다. 처리 결과는 서비스에서 확인하고 다시 선택해 주세요.";
    }
    selectedColumns.value = validColumns.value;
    status.value = "";
  },
  // Invalidate in-place changes before an already queued completion can commit.
  { flush: "sync" },
);
onBeforeUnmount(invalidate);
function updateOpen(open: boolean) {
  if (!open) invalidate();
  emit("update:open", open);
}
function toggleColumn(column: ExportColumn, checked: boolean) {
  if (column.disabled || busy.value) return;
  selectedColumns.value = checked
    ? [...new Set([...selectedColumns.value, column.id])]
    : selectedColumns.value.filter((value) => value !== column.id);
  status.value = "";
  error.value = "";
}
function updateScope(value: string) {
  if (
    busy.value ||
    !props.scopes.some((item) => !item.disabled && item.value === value)
  )
    return;
  scope.value = value;
  status.value = "";
  error.value = "";
}
function updateFormat(value: string) {
  if (busy.value || !props.formats.some((item) => item.value === value)) return;
  format.value = value;
  status.value = "";
  error.value = "";
}
async function runExport() {
  if (!ready.value || !props.open || !validScope.value || !validFormat.value)
    return;
  invalidate();
  const currentRevision = revision;
  const request = new AbortController();
  controller = request;
  busy.value = true;
  error.value = "";
  status.value = "";
  const selection: ExportSelection = {
    columns: [...validColumns.value],
    scope: validScope.value.value,
    format: validFormat.value.value,
  };
  try {
    await props.exportData(selection, { signal: request.signal });
    if (revision !== currentRevision || request.signal.aborted || !props.open)
      return;
    status.value = "내보내기 처리가 완료되었습니다.";
  } catch {
    if (revision !== currentRevision || request.signal.aborted || !props.open)
      return;
    error.value =
      "내보내기를 완료하지 못했습니다. 다운로드 결과를 확인한 후 다시 시도해 주세요.";
  } finally {
    if (revision === currentRevision) {
      busy.value = false;
      controller = undefined;
    }
  }
}
</script>

<template>
  <DialogRoot :open="open" @update:open="updateOpen">
    <DialogContent
      class="cheese-data-actions cheese-data-actions-dialog cheese-data-actions-stack"
      :aria-busy="busy || undefined"
    >
      <div>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription
          >내보낼 범위, 파일 형식과 항목을 선택해 주세요.</DialogDescription
        >
      </div>
      <div class="cheese-data-actions-map">
        <Select
          label="내보내기 범위"
          :options="
            scopes.map((item) => ({
              value: item.value,
              label: item.label,
              disabled: item.disabled,
            }))
          "
          :model-value="scope"
          :disabled="busy || !scopes.some((item) => !item.disabled)"
          @update:model-value="updateScope"
        />
        <Select
          label="파일 형식"
          :options="formats.filter((item) => item.value.trim())"
          :model-value="format"
          :disabled="busy || !formats.length"
          @update:model-value="updateFormat"
        />
      </div>
      <fieldset class="cheese-data-actions-fieldset" :disabled="busy">
        <legend class="cheese-label">내보낼 항목</legend>
        <label
          v-for="(column, position) in columns"
          :key="column.id"
          class="cheese-check-label"
          :for="`${id}-column-${position}`"
        >
          <CheckboxRoot
            :id="`${id}-column-${position}`"
            :aria-labelledby="`${id}-column-${position}-label`"
            :model-value="validColumns.includes(column.id)"
            :disabled="busy || column.disabled"
            @update:model-value="toggleColumn(column, $event === true)"
          >
            <CheckboxIndicator
              ><Check :size="14" aria-hidden="true"
            /></CheckboxIndicator>
          </CheckboxRoot>
          <span :id="`${id}-column-${position}-label`"
            >{{ column.label
            }}<span v-if="column.disabled" class="cheese-data-actions-muted">
              · 내보내기 불가</span
            ></span
          >
        </label>
        <p v-if="!enabledColumns.length" class="cheese-data-actions-muted">
          내보낼 수 있는 항목이 없습니다.
        </p>
      </fieldset>
      <p class="cheese-data-actions-muted">
        {{ validColumns.length }}개 항목 선택
      </p>
      <p v-if="error" class="cheese-data-actions-error" role="alert">
        {{ error }}
      </p>
      <p v-if="status" class="cheese-data-actions-status" role="status">
        {{ status }}
      </p>
      <p v-if="busy" class="cheese-data-actions-status" role="status">
        내보내기 처리 중입니다.
      </p>
      <div class="cheese-data-actions-toolbar">
        <Button variant="weak" @click="updateOpen(false)">닫기</Button>
        <Button :disabled="!ready" @click="runExport">내보내기</Button>
      </div>
    </DialogContent>
  </DialogRoot>
</template>
