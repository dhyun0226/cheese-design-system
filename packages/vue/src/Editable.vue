<script setup lang="ts">
import { ref, nextTick, useId, watch } from "vue";
import { Check, X, Pencil } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = defineProps<{
  label: string;
  modelValue?: string;
  defaultValue?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? "",
  (v) => emit("update:modelValue", v),
);
const id = useId(),
  editing = ref(false),
  draft = ref(""),
  error = ref(""),
  input = ref<HTMLInputElement>(),
  validationInput = ref<HTMLInputElement>(),
  trigger = ref<HTMLButtonElement>();
function syncValidation() {
  if (!validationInput.value) return;
  // Parent forms submit the saved value; an uncommitted draft is not a form value.
  validationInput.value.value = value.value;
  validationInput.value.setCustomValidity(
    props.required && !props.disabled && !value.value.trim()
      ? "내용을 입력해 주세요."
      : "",
  );
}
watch(
  [validationInput, value, () => props.required, () => props.disabled],
  syncValidation,
  { flush: "post" },
);
watch(root, (node, _, cleanup) => {
  const form = node?.closest("form");
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const reset = (event: Event) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (event.defaultPrevented) return;
      draft.value = "";
      editing.value = false;
      error.value = "";
      void nextTick(syncValidation);
    }, 0);
    timers.add(timer);
  };
  form?.addEventListener("reset", reset);
  cleanup(() => {
    form?.removeEventListener("reset", reset);
    timers.forEach(clearTimeout);
  });
});
async function invalid(event: Event) {
  event.preventDefault();
  const proxy = validationInput.value;
  const first =
    proxy?.form &&
    Array.from(proxy.form.elements).find((element) => {
      const control = element as HTMLInputElement;
      return (
        control.willValidate && control.validity && !control.validity.valid
      );
    });
  if (!editing.value) {
    draft.value = value.value;
    editing.value = true;
  }
  error.value = draft.value.trim()
    ? "변경 내용을 저장해 주세요."
    : "내용을 입력해 주세요.";
  await nextTick();
  if (!first || first === proxy) input.value?.focus();
}
async function edit() {
  draft.value = value.value;
  editing.value = true;
  await nextTick();
  input.value?.focus();
  input.value?.select();
}
async function finish(save: boolean) {
  if (save && props.required && !draft.value.trim()) {
    error.value = "내용을 입력해 주세요.";
    input.value?.focus();
    return;
  }
  error.value = "";
  if (save) value.value = draft.value.trim();
  editing.value = false;
  await nextTick();
  trigger.value?.focus();
}
function key(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (event.key === "Enter" || event.key === "Escape") {
    event.preventDefault();
    finish(event.key === "Enter");
  }
}
</script>
<template>
  <div ref="root" class="cheese-field">
    <span :id="id" class="cheese-label">{{ label }}</span>
    <div v-if="editing" class="cheese-editable-controls">
      <input
        ref="input"
        v-model="draft"
        class="cheese-input"
        :aria-labelledby="id"
        :aria-invalid="!!error"
        :aria-describedby="error ? id + '-error' : undefined"
        :disabled="disabled"
        :aria-required="required || undefined"
        @keydown="key"
        @input="error = ''"
      /><button
        type="button"
        class="cheese-icon-button"
        aria-label="변경 저장"
        :disabled="disabled"
        @click="finish(true)"
      >
        <Check :size="18" /></button
      ><button
        type="button"
        class="cheese-icon-button"
        aria-label="변경 취소"
        @click="finish(false)"
      >
        <X :size="18" />
      </button>
    </div>
    <button
      v-else
      ref="trigger"
      type="button"
      class="cheese-editable-preview"
      :aria-label="label + ' 수정'"
      :disabled="disabled"
      @click="edit"
    >
      {{ value || placeholder || "내용을 입력하세요"
      }}<Pencil :size="16" aria-hidden="true" /></button
    ><input
      ref="validationInput"
      class="cheese-sr-only"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      :name="name"
      :value="value"
      :disabled="disabled"
      :required="required"
      @invalid="invalid"
    />
    <p v-if="error" :id="id + '-error'" class="cheese-help" role="alert">
      {{ error }}
    </p>
  </div>
</template>
