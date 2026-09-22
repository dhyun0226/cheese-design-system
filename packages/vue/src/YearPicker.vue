<script setup lang="ts">
import { ref, watch, useId } from "vue";
import { RadioGroupRoot, RadioGroupItem } from "reka-ui";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    name?: string;
  }>(),
  { min: 1900, max: 2100 },
);
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? new Date().getFullYear(),
  (v) => emit("update:modelValue", v),
);
const start = ref(Math.floor(value.value / 12) * 12),
  id = useId();
watch(value, (v) => {
  start.value = Math.floor(v / 12) * 12;
});
</script>
<template>
  <div ref="root" class="cheese-period-picker">
    <span :id="id" class="cheese-label">{{ label }}</span>
    <div class="cheese-period-heading">
      <button
        type="button"
        class="cheese-icon-button"
        aria-label="이전 연도 범위"
        :disabled="disabled || start <= min"
        @click="start -= 12"
      >
        <ChevronLeft :size="18" /></button
      ><span aria-live="polite">{{ start }}–{{ start + 11 }}</span
      ><button
        type="button"
        class="cheese-icon-button"
        aria-label="다음 연도 범위"
        :disabled="disabled || start + 11 >= max"
        @click="start += 12"
      >
        <ChevronRight :size="18" />
      </button>
    </div>
    <RadioGroupRoot
      :model-value="String(value)"
      @update:model-value="value = Number($event)"
      :aria-labelledby="id"
      class="cheese-period-grid"
      :disabled="disabled"
      :name="name"
      ><RadioGroupItem
        v-for="n in 12"
        :key="start + n - 1"
        :value="String(start + n - 1)"
        class="cheese-period-item"
        :disabled="start + n - 1 < min || start + n - 1 > max"
        >{{ start + n - 1 }}</RadioGroupItem
      ></RadioGroupRoot
    >
  </div>
</template>
