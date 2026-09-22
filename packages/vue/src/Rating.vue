<script setup lang="ts">
import { computed, useId } from "vue";
import { RadioGroupRoot, RadioGroupItem } from "reka-ui";
import { Star } from "@lucide/vue";
import { useFieldModel } from "./fieldModel";
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: number;
    defaultValue?: number;
    max?: number;
    name?: string;
    disabled?: boolean;
    required?: boolean;
  }>(),
  { max: 5 },
);
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? 0,
  (v) => emit("update:modelValue", v),
);
const id = useId(),
  count = computed(() => Math.min(10, Math.max(1, props.max)));
</script>
<template>
  <div ref="root" class="cheese-field">
    <span :id="id" class="cheese-label">{{ label }}</span
    ><RadioGroupRoot
      :model-value="String(value)"
      @update:model-value="value = Number($event)"
      class="cheese-rating"
      :aria-labelledby="id"
      :name="name"
      :disabled="disabled"
      :required="required"
      orientation="horizontal"
      ><RadioGroupItem
        v-for="n in count"
        :key="n"
        :value="String(n)"
        class="cheese-rating-item"
        :data-filled="n <= value"
        :aria-label="n + '점'"
        ><Star :size="26" aria-hidden="true" /></RadioGroupItem
    ></RadioGroupRoot>
    <p class="cheese-help" role="status">
      {{ value ? `${count}점 중 ${value}점` : "평점을 선택하세요." }}
    </p>
  </div>
</template>
