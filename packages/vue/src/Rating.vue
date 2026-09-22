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
  count = computed(() => Math.min(10, Math.max(1, Math.floor(props.max)))),
  selected = computed(() =>
    Number.isInteger(value.value) &&
    value.value >= 1 &&
    value.value <= count.value
      ? String(value.value)
      : "",
  );
function invalid(event: Event) {
  event.preventDefault();
  const input = event.target as HTMLInputElement;
  const first =
    input.form &&
    Array.from(input.form.elements).find((element) => {
      const control = element as HTMLInputElement;
      return (
        control.willValidate && control.validity && !control.validity.valid
      );
    });
  if (!first || first === input)
    root.value?.querySelector<HTMLButtonElement>('[role="radio"]')?.focus();
}
</script>
<template>
  <div ref="root" class="cheese-field" @invalid.capture="invalid">
    <span :id="id" class="cheese-label">{{ label }}</span
    ><RadioGroupRoot
      :model-value="selected"
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
        :data-filled="!!selected && n <= value"
        :aria-label="n + '점'"
        ><Star :size="26" aria-hidden="true" /></RadioGroupItem
    ></RadioGroupRoot>
    <!-- Reka only creates its validation input when a name is supplied. -->
    <input
      v-if="!name"
      class="cheese-sr-only"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      :value="selected"
      :required="required"
      :disabled="disabled"
    />
    <p class="cheese-help" role="status">
      {{ selected ? `${count}점 중 ${value}점` : "평점을 선택하세요." }}
    </p>
  </div>
</template>
