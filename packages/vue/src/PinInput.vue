<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  watch,
} from "vue";
import { useFieldModel } from "./fieldModel";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    label: string;
    length?: number;
    modelValue?: string;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
    readonly?: boolean;
  }>(),
  { length: 6 },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  complete: [value: string];
  invalid: [event: Event];
  paste: [event: ClipboardEvent];
}>();
const attrs = useAttrs();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? "",
  (v) => emit("update:modelValue", v),
  () => attrs.form as string | undefined,
);
const autoId = useId(),
  id = computed(() => (attrs.id as string | undefined) ?? autoId),
  size = computed(() =>
    Number.isFinite(props.length)
      ? Math.min(12, Math.max(1, Math.floor(props.length)))
      : 6,
  );
const inputElement = ref<HTMLInputElement>();
const validationError = ref("");
const selection = ref({ start: 0, end: 0 });
function syncSelection() {
  const node = inputElement.value;
  if (node) {
    node.scrollLeft = 0;
    selection.value = {
      start: node.selectionStart ?? 0,
      end: node.selectionEnd ?? 0,
    };
  }
}
const resetTimers = new Set<ReturnType<typeof setTimeout>>();
watch(
  [value, () => props.disabled, () => props.readOnly || props.readonly],
  () => {
    validationError.value = "";
    void nextTick(syncSelection);
  },
);
watch(
  [inputElement, () => attrs.form],
  (_, __, cleanup) => {
    const owner = inputElement.value?.form;
    const reset = (event: Event) => {
      const timer = setTimeout(() => {
        resetTimers.delete(timer);
        if (event.defaultPrevented) return;
        validationError.value = "";
        void nextTick(() => {
          if (inputElement.value) inputElement.value.value = value.value;
          syncSelection();
        });
      }, 0);
      resetTimers.add(timer);
    };
    owner?.addEventListener("reset", reset);
    cleanup(() => owner?.removeEventListener("reset", reset));
  },
  { flush: "post" },
);
onBeforeUnmount(() => resetTimers.forEach(clearTimeout));
defineExpose({ input: inputElement, focus: () => inputElement.value?.focus() });
function updateCode(next: string, caret: number) {
  const target = inputElement.value;
  if (!target || target.matches(":disabled") || target.readOnly) return;
  const changed = next !== value.value;
  validationError.value = "";
  value.value = next;
  target.value = next;
  target.setSelectionRange(caret, caret);
  syncSelection();
  void nextTick(() => {
    target.value = value.value;
    syncSelection();
  });
  if (changed && next.length === size.value) emit("complete", next);
}
function input(event: Event) {
  const target = event.target as HTMLInputElement;
  const next = target.value.replace(/[^0-9]/g, "").slice(0, size.value);
  const caret = Math.min(
    target.value
      .slice(0, target.selectionStart ?? target.value.length)
      .replace(/[^0-9]/g, "").length,
    size.value,
  );
  updateCode(next, caret);
}
function paste(event: ClipboardEvent) {
  emit("paste", event);
  if (event.defaultPrevented) return;
  event.preventDefault();
  const node = inputElement.value;
  if (!node || node.matches(":disabled") || node.readOnly) return;
  const start = node.selectionStart ?? value.value.length;
  const end = node.selectionEnd ?? start;
  const digits = (
    event.clipboardData?.getData("text/plain") ||
    event.clipboardData?.getData("text") ||
    ""
  ).replace(/[^0-9]/g, "");
  if (!digits) return;
  const inserted = digits.slice(
    0,
    Math.max(0, size.value - (value.value.length - (end - start))),
  );
  const next = value.value.slice(0, start) + inserted + value.value.slice(end);
  const caret = start + inserted.length;
  if (next === value.value) {
    node.setSelectionRange(caret, caret);
    syncSelection();
    return;
  }
  node.value = next;
  node.setSelectionRange(caret, caret);
  // Use the existing input handler for the model update while notifying native
  // form listeners and the caller's @input listener with the same event.
  node.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      composed: true,
      inputType: "insertFromPaste",
      data: inserted,
    }),
  );
}
function invalid(event: Event) {
  event.preventDefault();
  validationError.value = (event.target as HTMLInputElement).validity
    .valueMissing
    ? "인증 코드를 입력해 주세요."
    : `숫자 ${size.value}자리 인증 코드를 입력해 주세요.`;
  const node = inputElement.value;
  const first =
    node?.form &&
    Array.from(node.form.elements).find((element) => {
      const control = element as HTMLInputElement;
      return (
        control.willValidate && control.validity && !control.validity.valid
      );
    });
  if (!first || first === node) node?.focus();
  emit("invalid", event);
}
</script>
<template>
  <div ref="root" class="cheese-field">
    <label :for="id" class="cheese-label">{{ label }}</label>
    <div
      class="cheese-pin-control"
      :data-compact="size > 8 || undefined"
      :style="{ '--cheese-pin-length': size }"
    >
      <input
        v-bind="$attrs"
        ref="inputElement"
        :id="id"
        class="cheese-input cheese-pin-input"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        :disabled="disabled"
        :readonly="readOnly || readonly"
        :pattern="'[0-9]{' + size + '}'"
        :maxlength="size"
        :value="value"
        :aria-invalid="
          validationError
            ? true
            : ($attrs['aria-invalid'] as boolean | undefined)
        "
        :aria-describedby="
          [
            $attrs['aria-describedby'],
            id + '-help',
            validationError ? id + '-error' : undefined,
          ]
            .filter(Boolean)
            .join(' ')
        "
        @input="input"
        @paste="paste"
        @focus="syncSelection"
        @select="syncSelection"
        @keyup="syncSelection"
        @invalid="invalid"
      />
      <div class="cheese-pin-slots" aria-hidden="true">
        <span
          v-for="(_, index) in size"
          :key="index"
          class="cheese-pin-slot"
          :data-active="
            Math.min(selection.start, size - 1) === index || undefined
          "
          :data-selected="
            (index >= selection.start && index < selection.end) || undefined
          "
          :data-empty="!value[index] || undefined"
          ><span v-if="value[index]">{{ value[index] }}</span></span
        >
      </div>
    </div>
    <p :id="id + '-help'" class="cheese-help">
      숫자 {{ size }}자리 · 코드를 붙여넣을 수 있습니다.
    </p>
    <p
      v-if="validationError"
      :id="id + '-error'"
      class="cheese-help"
      data-error="true"
      role="alert"
    >
      {{ validationError }}
    </p>
  </div>
</template>
