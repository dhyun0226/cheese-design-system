<script setup lang="ts">
import SearchSelect from "./SearchSelect.vue";
import type { ChoiceOption } from "./fieldModel";
import type { OptionsLoader } from "./business";
defineProps<{
  label: string;
  loadOptions: OptionsLoader;
  modelValue?: ChoiceOption | null;
  defaultValue?: ChoiceOption | null;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  debounceMs?: number;
  minLength?: number;
  placeholder?: string;
  error?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: ChoiceOption | null];
}>();
</script>
<template>
  <SearchSelect
    v-bind="$props"
    :multiple="false"
    :model-value="
      modelValue === undefined ? undefined : modelValue ? [modelValue] : []
    "
    :default-value="defaultValue ? [defaultValue] : []"
    @update:model-value="emit('update:modelValue', $event[0] ?? null)"
  />
</template>
