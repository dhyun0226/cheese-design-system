<script setup lang="ts">
import { computed, useId } from "vue";
import DateField from "./DateField.vue";
import TimeField from "./TimeField.vue";
import { useFieldModel, type RangeFieldValue } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    type?: "date" | "time";
    modelValue?: RangeFieldValue;
    defaultValue?: RangeFieldValue;
    name?: string;
    form?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    min?: string;
    max?: string;
    step?: number;
  }>(),
  { type: "date" },
);
const emit = defineEmits<{ "update:modelValue": [value: RangeFieldValue] }>();
const { root, value } = useFieldModel(
    () => props.modelValue,
    () => props.defaultValue ?? { start: "", end: "" },
    (v) => emit("update:modelValue", v),
    () => props.form,
  ),
  id = useId();
const validShape = (value: string) => {
  if (props.type === "time")
    return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    year >= 1 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};
const invalid = computed(
  () =>
    !!(
      validShape(value.value.start) &&
      validShape(value.value.end) &&
      (props.type === "time"
        ? timeOrder(value.value.end) < timeOrder(value.value.start)
        : value.value.end < value.value.start)
    ),
);
function timeOrder(value: string) {
  const [h, m, s = 0] = value.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}
function update(key: "start" | "end", next: string) {
  value.value = {
    ...value.value,
    [key]: next,
  };
}
</script>
<template>
  <div ref="root">
    <fieldset class="cheese-range-field" :disabled="disabled">
      <legend class="cheese-label">{{ label }}</legend>
      <div class="cheese-range-inputs">
        <component
          :is="type === 'date' ? DateField : TimeField"
          v-for="key in ['start', 'end'] as const"
          :key="key"
          :label="key === 'start' ? '시작' : '종료'"
          :id="id + key"
          :model-value="value[key]"
          :default-value="defaultValue?.[key] ?? ''"
          :name="name ? name + '.' + key : undefined"
          :form="form"
          :disabled="disabled"
          :read-only="readOnly"
          :required="required"
          :min="min"
          :max="max"
          :step="step"
          :error="
            key === 'end' && invalid
              ? '종료는 시작보다 빠를 수 없습니다.'
              : undefined
          "
          @update:model-value="update(key, $event)"
        />
      </div>
    </fieldset>
  </div>
</template>
