<script setup lang="ts">
import { ref, watch, useId } from "vue";
import { RadioGroupRoot, RadioGroupItem } from "reka-ui";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = defineProps<{
  label: string;
  modelValue?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  name?: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? "",
  (v) => emit("update:modelValue", v),
);
const year = ref(Number(value.value.slice(0, 4)) || new Date().getFullYear()),
  id = useId();
watch(value, (v) => {
  if (v) year.value = Number(v.slice(0, 4));
});
function month(n: number) {
  return `${year.value}-${String(n).padStart(2, "0")}`;
}
</script>
<template>
  <div ref="root" class="cheese-period-picker">
    <span :id="id" class="cheese-label">{{ label }}</span>
    <div class="cheese-period-heading">
      <button
        type="button"
        class="cheese-icon-button"
        aria-label="이전 연도"
        :disabled="disabled || (!!min && year <= Number(min.slice(0, 4)))"
        @click="year--"
      >
        <ChevronLeft :size="18" /></button
      ><span aria-live="polite">{{ year }}년</span
      ><button
        type="button"
        class="cheese-icon-button"
        aria-label="다음 연도"
        :disabled="disabled || (!!max && year >= Number(max.slice(0, 4)))"
        @click="year++"
      >
        <ChevronRight :size="18" />
      </button>
    </div>
    <RadioGroupRoot
      v-model="value"
      :aria-labelledby="id"
      class="cheese-period-grid"
      :disabled="disabled"
      :name="name"
      ><RadioGroupItem
        v-for="n in 12"
        :key="month(n)"
        :value="month(n)"
        class="cheese-period-item"
        :aria-label="year + '년 ' + n + '월'"
        :disabled="(!!min && month(n) < min) || (!!max && month(n) > max)"
        >{{ n }}월</RadioGroupItem
      ></RadioGroupRoot
    >
  </div>
</template>
