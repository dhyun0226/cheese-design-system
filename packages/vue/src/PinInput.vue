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
  }>(),
  { length: 6 },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  complete: [value: string];
  invalid: [event: Event];
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
  size = computed(() => Math.min(12, Math.max(1, Math.floor(props.length))));
const inputElement = ref<HTMLInputElement>();
const validationError = ref("");
const resetTimers = new Set<ReturnType<typeof setTimeout>>();
watch(value, () => {
  validationError.value = "";
});
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
function input(event: Event) {
  const target = event.target as HTMLInputElement,
    next = target.value.replace(/[^0-9]/g, "").slice(0, size.value),
    changed = next !== value.value;
  target.value = next;
  validationError.value = "";
  value.value = next;
  if (changed && next.length === size.value) emit("complete", next);
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
    <label :for="id" class="cheese-label">{{ label }}</label
    ><input
      v-bind="$attrs"
      ref="inputElement"
      :id="id"
      class="cheese-input cheese-pin-input"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      :pattern="'[0-9]{' + size + '}'"
      :maxlength="size"
      :value="value"
      :placeholder="'○'.repeat(size)"
      :aria-invalid="
        validationError ? true : ($attrs['aria-invalid'] as boolean | undefined)
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
      @invalid="invalid"
    />
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
