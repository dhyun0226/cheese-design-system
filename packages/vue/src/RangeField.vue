<script setup lang="ts">
import { computed, useId, watchPostEffect } from "vue";
import { useFieldModel, type RangeFieldValue } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    type?: "date" | "time";
    modelValue?: RangeFieldValue;
    defaultValue?: RangeFieldValue;
    name?: string;
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
  ),
  id = useId();
const invalid = computed(
  () =>
    !!(
      value.value.start &&
      value.value.end &&
      value.value.end < value.value.start
    ),
);
function update(key: "start" | "end", event: Event) {
  value.value = {
    ...value.value,
    [key]: (event.target as HTMLInputElement).value,
  };
}
watchPostEffect(() => {
  root.value
    ?.querySelectorAll<HTMLInputElement>("input")[1]
    ?.setCustomValidity(
      invalid.value ? "종료는 시작보다 빠를 수 없습니다." : "",
    );
});
</script>
<template>
  <div ref="root">
    <fieldset class="cheese-range-field" :disabled="disabled">
      <legend class="cheese-label">{{ label }}</legend>
      <div class="cheese-range-inputs">
        <div
          v-for="key in ['start', 'end'] as const"
          :key="key"
          class="cheese-field"
        >
          <label :for="id + key" class="cheese-help">{{
            key === "start" ? "시작" : "종료"
          }}</label
          ><input
            :id="id + key"
            class="cheese-input"
            :type="type"
            :value="value[key]"
            :name="name ? name + '.' + key : undefined"
            :readonly="readOnly"
            :required="required"
            :min="
              key === 'end'
                ? [value.start, min || ''].sort().at(-1) || undefined
                : min
            "
            :max="max"
            :step="step"
            :aria-invalid="key === 'end' && invalid"
            :aria-describedby="invalid ? id + 'error' : undefined"
            @input="update(key, $event)"
          />
        </div>
      </div>
      <p v-if="invalid" :id="id + 'error'" class="cheese-help" role="alert">
        종료는 시작보다 빠를 수 없습니다.
      </p>
    </fieldset>
  </div>
</template>
