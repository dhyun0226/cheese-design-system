<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value?: string | number | boolean | null;
    emptyText?: string;
  }>(),
  { emptyText: "—" },
);

defineSlots<{ default?(): unknown }>();

const displayValue = computed(() =>
  props.value === null || props.value === undefined || props.value === ""
    ? props.emptyText
    : String(props.value),
);
</script>

<template>
  <dl class="cheese-read-only-field">
    <dt class="cheese-read-only-field-label">{{ label }}</dt>
    <dd class="cheese-read-only-field-value">
      <slot>{{ displayValue }}</slot>
    </dd>
  </dl>
</template>
