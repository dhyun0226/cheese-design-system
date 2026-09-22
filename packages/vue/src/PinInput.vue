<script setup lang="ts">
import { computed, useId } from "vue";
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
}>();
const { root, value } = useFieldModel(
  () => props.modelValue,
  () => props.defaultValue ?? "",
  (v) => emit("update:modelValue", v),
);
const id = useId(),
  size = computed(() => Math.min(12, Math.max(1, Math.floor(props.length))));
function input(event: Event) {
  const target = event.target as HTMLInputElement,
    next = target.value.replace(/[^0-9]/g, "").slice(0, size.value),
    changed = next !== value.value;
  target.value = next;
  value.value = next;
  if (changed && next.length === size.value) emit("complete", next);
}
</script>
<template>
  <div ref="root" class="cheese-field">
    <label :for="id" class="cheese-label">{{ label }}</label
    ><input
      v-bind="$attrs"
      :id="id"
      class="cheese-input cheese-pin-input"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      :pattern="'[0-9]{' + size + '}'"
      :maxlength="size"
      :value="value"
      :placeholder="'○'.repeat(size)"
      @input="input"
    />
    <p class="cheese-help">
      숫자 {{ size }}자리 · 코드를 붙여넣을 수 있습니다.
    </p>
  </div>
</template>
