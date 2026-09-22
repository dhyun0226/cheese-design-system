<script setup lang="ts">
import { computed, onBeforeUnmount, onUpdated, ref, useId, watch } from "vue";
import { Minus, Plus } from "@lucide/vue";
import { useFieldBlur } from "./useFieldBlur";
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  label: string;
  modelValue?: string | number;
  defaultValue?: string | number;
  name?: string;
  form?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  description?: string;
  error?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [event: FocusEvent];
  invalid: [event: Event];
}>();
const autoId = useId(),
  id = computed(() => props.id ?? autoId);
const input = ref<HTMLInputElement>();
const shouldRevealOnBlur = useFieldBlur(input);
const local = ref(String(props.defaultValue ?? ""));
const current = computed(() =>
  String(props.modelValue === undefined ? local.value : props.modelValue),
);
const internalError = ref(""),
  revealed = ref(false);
const message = computed(
  () => props.error || (revealed.value ? internalError.value : ""),
);
const hint = computed(() => message.value || props.description);
const numeric = computed(() =>
  current.value.trim() === "" ? NaN : Number(current.value),
);
function measure() {
  const node = input.value;
  if (!node) return;
  const draft = node.value;
  node.defaultValue = String(props.defaultValue ?? "");
  if (node.value !== draft) node.value = draft;
  node.setCustomValidity("");
  const state = node.validity;
  const issue = state.badInput
    ? "숫자를 입력해 주세요."
    : state.valueMissing
      ? "값을 입력해 주세요."
      : state.rangeUnderflow
        ? `${node.min} 이상의 값을 입력해 주세요.`
        : state.rangeOverflow
          ? `${node.max} 이하의 값을 입력해 주세요.`
          : state.stepMismatch
            ? `${node.step || 1} 간격에 맞는 값을 입력해 주세요.`
            : "";
  node.setCustomValidity(
    props.disabled || props.readOnly ? "" : props.error || issue,
  );
  internalError.value = issue;
}
watch(
  [
    input,
    current,
    () => props.min,
    () => props.max,
    () => props.step,
    () => props.disabled,
    () => props.readOnly,
    () => props.required,
    () => props.error,
    () => props.defaultValue,
  ],
  measure,
  { flush: "post" },
);
// Vue also patches number input's value attribute on presentation-only updates.
// Re-pin the step origin after error text / touched-state updates, not just edits.
onUpdated(measure);
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  [input, () => props.form],
  (_, __, cleanup) => {
    const owner = input.value?.form;
    if (!owner) return;
    const reset = (event: Event) => {
      timer = setTimeout(() => {
        if (event.defaultPrevented) return;
        if (props.modelValue === undefined) {
          local.value = String(props.defaultValue ?? "");
          emit("update:modelValue", local.value);
        }
        if (input.value) input.value.value = current.value;
        measure();
        revealed.value = false;
      }, 0);
    };
    owner.addEventListener("reset", reset);
    cleanup(() => owner.removeEventListener("reset", reset));
  },
  { flush: "post" },
);
onBeforeUnmount(() => clearTimeout(timer));
function update(next: string) {
  if (props.disabled || props.readOnly) return;
  if (props.modelValue === undefined) local.value = next;
  measure();
  emit("update:modelValue", next);
}
function increment(direction: number) {
  const node = input.value;
  if (!node || props.disabled || props.readOnly) return;
  if (props.step === "any") {
    const candidate =
      (Number.isFinite(node.valueAsNumber) ? node.valueAsNumber : 0) +
      direction;
    node.value = String(
      Math.max(
        props.min === undefined ? -Infinity : Number(props.min),
        Math.min(
          props.max === undefined ? Infinity : Number(props.max),
          candidate,
        ),
      ),
    );
  } else if (direction > 0) node.stepUp();
  else node.stepDown();
  update(node.value);
  if (props.modelValue !== undefined) node.value = current.value;
  node.focus();
}
function invalid(event: Event) {
  event.preventDefault();
  measure();
  revealed.value = true;
  const node = input.value;
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
function blur(event: FocusEvent) {
  measure();
  if (shouldRevealOnBlur(event)) revealed.value = true;
  emit("blur", event);
}
defineExpose({ input, focus: () => input.value?.focus() });
</script>
<template>
  <div class="cheese-field">
    <label :for="id" class="cheese-label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <div class="cheese-number-field-control">
      <input
        v-bind="$attrs"
        :id="id"
        ref="input"
        :name="name"
        :form="form"
        type="number"
        :inputmode="($attrs.inputmode as 'decimal') ?? 'decimal'"
        :value="current"
        :min="min"
        :max="max"
        :step="step ?? 1"
        :disabled="disabled"
        :readonly="readOnly"
        :required="required"
        class="cheese-input cheese-number-field-input"
        :aria-invalid="!!message || undefined"
        :aria-describedby="
          [$attrs['aria-describedby'], hint ? `${id}-hint` : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        "
        @input="update(($event.target as HTMLInputElement).value)"
        @blur="blur"
        @invalid="invalid"
      />
      <div class="cheese-number-field-actions">
        <button
          type="button"
          class="cheese-field-action"
          :aria-label="`${label} 감소`"
          :disabled="
            disabled ||
            readOnly ||
            (min !== undefined &&
              Number.isFinite(numeric) &&
              numeric <= Number(min))
          "
          @click="increment(-1)"
        >
          <Minus :size="16" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="cheese-field-action"
          :aria-label="`${label} 증가`"
          :disabled="
            disabled ||
            readOnly ||
            (max !== undefined &&
              Number.isFinite(numeric) &&
              numeric >= Number(max))
          "
          @click="increment(1)"
        >
          <Plus :size="16" aria-hidden="true" />
        </button>
      </div>
    </div>
    <p
      v-if="hint"
      :id="`${id}-hint`"
      class="cheese-help"
      :data-error="!!message"
      :role="message ? 'alert' : undefined"
    >
      {{ hint }}
    </p>
  </div>
</template>
