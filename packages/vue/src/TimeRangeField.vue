<script setup lang="ts">
import RangeField from "./RangeField.vue";
import type { RangeFieldProps, RangeFieldValue } from "./fieldModel";
defineOptions({ inheritAttrs: false });
defineProps<RangeFieldProps>();
defineEmits<{ "update:modelValue": [value: RangeFieldValue] }>();
</script>
<template>
  <RangeField
    v-bind="{ ...$attrs, ...$props }"
    type="time"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
