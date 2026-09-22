<script setup lang="ts">
import SearchSelect, { type SearchSelectProps } from "./SearchSelect.vue";
import type { ChoiceOption } from "./fieldModel";
defineProps<Omit<SearchSelectProps, "multiple">>();
const emit = defineEmits<{ "update:modelValue": [value: ChoiceOption[]] }>();
</script>
<template>
  <SearchSelect
    v-bind="$props"
    multiple
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
